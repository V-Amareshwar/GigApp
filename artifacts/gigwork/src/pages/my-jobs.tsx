import { useState } from "react";
import { useListMyJobs, useUpdateJob, useDeleteJob, JobStatus } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, Eye, Edit, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function MyJobs() {
  const [status, setStatus] = useState<JobStatus | 'all'>('all');
  
  const queryParams = status === 'all' ? {} : { status };
  const { data, isLoading, refetch } = useListMyJobs(queryParams);
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const handleStatusChange = (jobId: string, newStatus: any) => {
    updateJob.mutate({ jobId, data: { status: newStatus } }, {
      onSuccess: () => refetch()
    });
  };

  const handleDelete = (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJob.mutate({ jobId }, {
        onSuccess: () => refetch()
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Job Posts</h1>
        <Link href="/jobs/new">
          <Button>Post New Job</Button>
        </Link>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setStatus(v as any)}>
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="filled">Filled</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
          ) : data?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't posted any jobs in this category.</p>
                <Link href="/jobs/new">
                  <Button variant="outline">Create a Job Post</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            data?.map(job => (
              <Card key={job.id} className={job.status === 'paused' ? 'opacity-70' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex gap-6 mt-2">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        {job.applications_count || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">Applicants</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-primary" />
                        {job.views_count || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">Views</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-muted/20 flex flex-wrap gap-2 justify-between">
                  <div className="flex gap-2">
                    <Link href={`/my-jobs/${job.id}/applicants`}>
                      <Button variant="outline" size="sm">View Applicants</Button>
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    {job.status === 'active' ? (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(job.id, 'paused')}>
                        <PauseCircle className="h-4 w-4 mr-1" /> Pause
                      </Button>
                    ) : job.status === 'paused' ? (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(job.id, 'active')}>
                        <PlayCircle className="h-4 w-4 mr-1" /> Resume
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}
