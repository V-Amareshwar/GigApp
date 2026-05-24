import { useListNotifications, useMarkNotificationsRead } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Briefcase, MessageSquare, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { data: notifications, isLoading, refetch } = useListNotifications();
  const markReadMutation = useMarkNotificationsRead();

  const handleMarkAllRead = () => {
    markReadMutation.mutate(undefined, {
      onSuccess: () => refetch()
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'application_status': return <Briefcase className="h-5 w-5 text-primary" />;
      case 'new_message': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'job_alert': return <Bell className="h-5 w-5 text-amber-500" />;
      default: return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">You have {unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead}
            disabled={markReadMutation.isPending}
          >
            <Check className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : notifications?.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium">All caught up</p>
            <p className="text-muted-foreground mt-1 text-sm max-w-md">
              We'll let you know when there's an update on your jobs or applications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications?.map(notif => (
            <Card key={notif.id} className={`${!notif.is_read ? 'bg-primary/5 border-primary/20' : ''}`}>
              <CardContent className="p-4 flex gap-4">
                <div className="mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={`font-semibold ${!notif.is_read ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notif.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
