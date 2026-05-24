import { useState } from "react";
import { useListMyApplications, useWithdrawApplication, useCreateReview, ApplicationStatus } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Building, MessageSquare, XCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Applications() {
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all');
  const { toast } = useToast();
  
  const queryParams = status === 'all' ? {} : { status };
  const { data, isLoading, refetch } = useListMyApplications(queryParams);

  const withdrawMutation = useWithdrawApplication();
  const reviewMutation = useCreateReview();

  const handleWithdraw = (applicationId: string) => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      withdrawMutation.mutate({ applicationId }, {
        onSuccess: () => {
          toast({ title: "Application withdrawn" });
          refetch();
        }
      });
    }
  };

  const handleLeaveReview = (app: any) => {
    const rating = parseInt(prompt("Enter rating from 1 to 5") || "5", 10);
    const comment = prompt("Enter review comment") || undefined;

    if (rating >= 1 && rating <= 5) {
      reviewMutation.mutate({ 
        data: { 
          application_id: app.id, 
          reviewee_id: app.job?.provider_id, 
          reviewer_role: "seeker", 
          rating, 
          comment 
        } 
      }, {
        onSuccess: () => {
          toast({ title: "Review submitted" });
          refetch();
        }
      });
    }
  };

  const getStatusColor = (s: ApplicationStatus) => {
    switch(s) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'withdrawn': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>

      <Tabs defaultValue="all" onValueChange={(v) => setStatus(v as any)}>
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : data?.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No applications found in this category.
              </CardContent>
            </Card>
          ) : (
            data?.map(app => (
              <Card key={app.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      <Link href={`/jobs/${app.job_id}`} className="hover:text-primary transition-colors">
                        {app.job?.title}
                      </Link>
                    </CardTitle>
                    <Badge variant="outline" className={getStatusColor(app.status)}>
                      {app.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 text-sm space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <Building className="h-4 w-4 mr-2" />
                    {app.job?.provider?.name || 'Unknown Employer'}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                  </div>
                  {app.employer_note && (
                    <div className="mt-2 p-3 bg-muted rounded-md text-sm border-l-2 border-primary">
                      <span className="font-semibold block mb-1">Employer Note:</span>
                      {app.employer_note}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 flex justify-end gap-2 border-t bg-muted/10 mt-2">
                  {app.status === 'pending' && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleWithdraw(app.id)}>
                      <XCircle className="h-4 w-4 mr-2" /> Withdraw
                    </Button>
                  )}
                  {app.status === 'completed' && (
                    <Button variant="outline" size="sm" onClick={() => handleLeaveReview(app)}>
                      <Star className="h-4 w-4 mr-2" /> Leave Review
                    </Button>
                  )}
                  {app.chat_room_id && (
                    <Link href={`/chat/${app.chat_room_id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" /> Message
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}
