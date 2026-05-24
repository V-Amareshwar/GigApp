import { useLocation, useParams } from "wouter";
import { useListJobApplications, useAcceptApplication, useRejectApplication, useGetJob } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, User, ShieldCheck, ArrowLeft, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function JobApplicants() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: job, isLoading: jobLoading } = useGetJob(id, { query: { enabled: !!id } });
  const { data: applications, isLoading: appsLoading, refetch } = useListJobApplications(id, { query: { enabled: !!id } });

  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();

  const handleAccept = (applicationId: string) => {
    acceptMutation.mutate({ applicationId }, {
      onSuccess: () => {
        toast({ title: "Applicant accepted", description: "You can now chat with the applicant." });
        refetch();
      }
    });
  };

  const handleReject = (applicationId: string) => {
    rejectMutation.mutate({ applicationId, data: { employer_note: "Not a fit at this time." } }, {
      onSuccess: () => {
        toast({ title: "Applicant rejected" });
        refetch();
      }
    });
  };

  if (jobLoading || appsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/my-jobs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applicants</h1>
          <p className="text-muted-foreground">{job?.title}</p>
        </div>
      </div>

      {applications?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No one has applied for this job yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {applications?.map(app => (
            <Card key={app.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={app.seeker?.profile_photo_url || undefined} />
                      <AvatarFallback><User className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {app.seeker?.name || "Unknown User"}
                        {app.seeker?.is_id_verified && <ShieldCheck className="h-4 w-4 text-green-600" />}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" /> {app.seeker?.city || "Unknown Location"}
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    app.status === 'pending' ? 'secondary' : 
                    app.status === 'accepted' ? 'default' : 'outline'
                  }>
                    {app.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{app.seeker?.seeker_profile?.avg_rating?.toFixed(1) || "New"}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                  </span>
                </div>
                
                {app.seeker?.seeker_profile?.skills && app.seeker.seeker_profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {app.seeker.seeker_profile.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs bg-muted/50">{skill}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex flex-wrap gap-2 border-t bg-muted/10 justify-end">
                {app.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={() => handleReject(app.id)}
                      disabled={rejectMutation.isPending || acceptMutation.isPending}
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleAccept(app.id)}
                      disabled={rejectMutation.isPending || acceptMutation.isPending}
                    >
                      Accept applicant
                    </Button>
                  </>
                )}
                {app.chat_room_id && (
                  <Link href={`/chat/${app.chat_room_id}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <MessageSquare className="h-4 w-4 mr-2" /> Message
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
