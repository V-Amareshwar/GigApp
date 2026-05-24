import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetChatMessages, useSendMessage, useListChatRooms } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Send, User } from "lucide-react";
import { format } from "date-fns";

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Note: we could fetch single room info if the API supported it, but we can also find it in the list
  const { data: rooms } = useListChatRooms();
  const room = rooms?.find(r => r.id === id);

  const { data: messages, isLoading, refetch } = useGetChatMessages(id, {
    query: { enabled: !!id, refetchInterval: 3000 } // Polling for new messages
  });

  const sendMutation = useSendMessage();

  useEffect(() => {
    // Scroll to bottom when messages load
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    sendMutation.mutate({ roomId: id, data: { content: content.trim() } }, {
      onSuccess: () => {
        setContent("");
        refetch();
      }
    });
  };

  if (isLoading && !messages) {
    return (
      <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <Card className="flex flex-col h-full overflow-hidden shadow-md border-muted">
        <CardHeader className="border-b bg-card py-3 px-4 flex flex-row items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setLocation("/chat")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={room?.other_user?.profile_photo_url || undefined} />
            <AvatarFallback><User className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{room?.other_user?.name || "Chat"}</CardTitle>
            <p className="text-xs text-muted-foreground truncate">{room?.job?.title}</p>
          </div>
        </CardHeader>

        <CardContent 
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10" 
          ref={scrollRef}
        >
          {messages?.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Start the conversation
            </div>
          ) : (
            messages?.map((msg, idx) => {
              const isMine = msg.sender_id === user?.id;
              const showTime = idx === 0 || new Date(msg.created_at).getTime() - new Date(messages[idx-1].created_at).getTime() > 5 * 60 * 1000;
              
              if (msg.message_type === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                    <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {showTime && (
                    <span className="text-[10px] text-muted-foreground mb-1 mx-1">
                      {format(new Date(msg.created_at), "MMM d, h:mm a")}
                    </span>
                  )}
                  <div 
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      isMine 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-card border shadow-sm rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>

        <CardFooter className="p-3 bg-card border-t">
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input 
              placeholder="Type a message..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 bg-muted/30 focus-visible:ring-1 focus-visible:bg-transparent"
              autoComplete="off"
            />
            <Button type="submit" disabled={!content.trim() || sendMutation.isPending} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
