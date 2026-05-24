import { Server } from "socket.io";
import { verifyToken } from "./auth";
import { db, chatRoomsTable, chatMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { serializeUser } from "./userSerializer";
import type http from "http";

export function setupSocketIO(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication error: no token"));
    }
    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error("Authentication error: invalid token"));
    }
    socket.data.userId = payload.sub;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on("send_message", async (data: { roomId: string; content: string }, callback?: (err: string | null, msg?: unknown) => void) => {
      try {
        const { roomId, content } = data;
        if (!content || typeof content !== "string" || content.trim().length === 0) {
          return callback?.("content is required");
        }

        // Verify user is in the room
        const [room] = await db.select().from(chatRoomsTable).where(eq(chatRoomsTable.id, roomId));
        if (!room || (room.seekerId !== userId && room.providerId !== userId)) {
          return callback?.("Not your chat room");
        }

        const [msg] = await db.insert(chatMessagesTable).values({
          roomId,
          senderId: userId,
          content: content.trim(),
          messageType: "text",
        }).returning();

        await db.update(chatRoomsTable).set({ lastMessageAt: new Date() }).where(eq(chatRoomsTable.id, roomId));

        const sender = await serializeUser(msg.senderId);
        const broadcastMsg = {
          id: msg.id,
          room_id: msg.roomId,
          sender_id: msg.senderId,
          message_type: msg.messageType,
          content: msg.content,
          is_read: msg.isRead,
          sender,
          created_at: msg.createdAt.toISOString(),
        };

        // Emit to everyone in the room including sender
        io.to(roomId).emit("new_message", broadcastMsg);

        // Also emit to the other user's private channel for chat list updates
        const otherUserId = room.seekerId === userId ? room.providerId : room.seekerId;
        io.to(`user_${otherUserId}`).emit("chat_update", {
          room_id: roomId,
          last_message: msg.content,
          last_message_at: msg.createdAt.toISOString(),
        });

        callback?.(null, broadcastMsg);
      } catch (err: any) {
        callback?.(err.message || "Failed to send message");
      }
    });

    // Join user's personal room for notifications
    socket.join(`user_${userId}`);

    socket.on("disconnect", () => {
      // Cleanup handled automatically by socket.io
    });
  });

  return io;
}
