import { Router } from "express";
import { db, chatRoomsTable, chatMessagesTable, jobsTable, applicationsTable, categoriesTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { serializeUser } from "../lib/userSerializer";

const router: Router = Router();

router.get("/v1/chat/rooms", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const rooms = await db.select().from(chatRoomsTable)
    .where(or(eq(chatRoomsTable.seekerId, userId), eq(chatRoomsTable.providerId, userId)))
    .orderBy(desc(chatRoomsTable.lastMessageAt));

  const results = await Promise.all(rooms.map(async (room) => {
    const otherUserId = room.seekerId === userId ? room.providerId : room.seekerId;
    const otherUser = await serializeUser(otherUserId);

    let job = null;
    if (room.applicationId) {
      const [app] = await db.select({ jobId: applicationsTable.jobId }).from(applicationsTable).where(eq(applicationsTable.id, room.applicationId));
      if (app) {
        const [j] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
        if (j) {
          const [cat] = j.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, j.categoryId)) : [null];
          const provider = await serializeUser(j.providerId);
          job = {
            id: j.id, title: j.title, work_type: j.workType, city: j.city, status: j.status,
            daily_wage: j.dailyWage, hourly_rate: j.hourlyRate, monthly_salary: j.monthlySalary,
            is_urgent: j.isUrgent, is_verified: j.isVerified, applications_count: j.applicationsCount,
            views_count: j.viewsCount, skills_required: j.skillsRequired ?? [], description: j.description,
            category_id: j.categoryId, provider_id: j.providerId, address: j.address,
            food_included: j.foodIncluded, accommodation_included: j.accommodationIncluded,
            category: cat ? { id: cat.id, name: cat.name, name_hi: cat.nameHi, icon_name: cat.iconName, sort_order: cat.sortOrder } : null,
            provider, created_at: j.createdAt.toISOString(), expires_at: j.expiresAt?.toISOString() ?? null,
          };
        }
      }
    }

    const [lastMsg] = await db.select({ content: chatMessagesTable.content })
      .from(chatMessagesTable).where(eq(chatMessagesTable.roomId, room.id))
      .orderBy(desc(chatMessagesTable.createdAt)).limit(1);

    const unreadCount = await db.select({ id: chatMessagesTable.id }).from(chatMessagesTable)
      .where(eq(chatMessagesTable.roomId, room.id));

    return {
      id: room.id,
      application_id: room.applicationId,
      seeker_id: room.seekerId,
      provider_id: room.providerId,
      last_message_at: room.lastMessageAt?.toISOString() ?? null,
      last_message: lastMsg?.content ?? null,
      unread_count: 0,
      other_user: otherUser,
      job,
      created_at: room.createdAt.toISOString(),
    };
  }));

  res.json(results);
});

router.get("/v1/chat/rooms/:roomId/messages", requireAuth, async (req, res): Promise<void> => {
  const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const [room] = await db.select().from(chatRoomsTable).where(eq(chatRoomsTable.id, roomId));
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  if (room.seekerId !== req.userId && room.providerId !== req.userId) {
    res.status(403).json({ error: "Not your chat room" }); return;
  }

  const messages = await db.select().from(chatMessagesTable)
    .where(eq(chatMessagesTable.roomId, roomId))
    .orderBy(chatMessagesTable.createdAt)
    .limit(100);

  const results = await Promise.all(messages.map(async (msg) => {
    const sender = await serializeUser(msg.senderId);
    return {
      id: msg.id,
      room_id: msg.roomId,
      sender_id: msg.senderId,
      message_type: msg.messageType,
      content: msg.content,
      is_read: msg.isRead,
      sender,
      created_at: msg.createdAt.toISOString(),
    };
  }));
  res.json(results);
});

router.post("/v1/chat/rooms/:roomId/messages", requireAuth, async (req, res): Promise<void> => {
  const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const [room] = await db.select().from(chatRoomsTable).where(eq(chatRoomsTable.id, roomId));
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  if (room.seekerId !== req.userId && room.providerId !== req.userId) {
    res.status(403).json({ error: "Not your chat room" }); return;
  }

  const { content } = req.body;
  if (!content || typeof content !== "string") {
    res.status(400).json({ error: "content is required" }); return;
  }

  const [msg] = await db.insert(chatMessagesTable).values({
    roomId, senderId: req.userId!, content, messageType: "text",
  }).returning();

  await db.update(chatRoomsTable).set({ lastMessageAt: new Date() }).where(eq(chatRoomsTable.id, roomId));

  const sender = await serializeUser(msg.senderId);
  res.status(201).json({
    id: msg.id, room_id: msg.roomId, sender_id: msg.senderId,
    message_type: msg.messageType, content: msg.content,
    is_read: msg.isRead, sender, created_at: msg.createdAt.toISOString(),
  });
});

export default router;
