import { useState, useEffect } from "react";
import { useListChatRooms } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { User, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export default function ChatList() {
  const { data: roomsData, isLoading } = useListChatRooms();
  const { user } = useAuth();
  const { socket } = useSocket();

  // Keep local state for live updates
  const [rooms, setRooms] = useState(roomsData ?? []);

  useEffect(() => {
    if (roomsData) setRooms(roomsData);
  }, [roomsData]);

  // Listen for live chat updates to refresh last message preview
  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = (update: { room_id: string; last_message: string; last_message_at: string }) => {
      setRooms((prev) => prev.map(r =>
        r.id === update.room_id
          ? { ...r, last_message: update.last_message, last_message_at: update.last_message_at }
          : r
      ).sort((a, b) => {
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : new Date(a.created_at).getTime();
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : new Date(b.created_at).getTime();
        return bTime - aTime;
      }));
    };

    socket.on("chat_update", handleChatUpdate);
    return () => {
      socket.off("chat_update", handleChatUpdate);
    };
  }, [socket]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Messages</h1>

      {isLoading && rooms.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-muted-foreground mt-1 text-sm max-w-md">
              {user?.current_role === 'seeker'
                ? "When an employer accepts your application, you can chat with them here."
                : "When you accept an applicant, you can chat with them here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rooms.map(room => (
            <Link key={room.id} href={`/chat/${room.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={room.other_user?.profile_photo_url || undefined} />
                      <AvatarFallback><User className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    {(room.unread_count || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold truncate pr-2">
                        {room.other_user?.name || "Unknown User"}
                      </h3>
                      {room.last_message_at && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(room.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {room.job?.title && <span className="font-medium mr-1 text-foreground/80">{room.job.title}:</span>}
                      {room.last_message || "No messages yet"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
