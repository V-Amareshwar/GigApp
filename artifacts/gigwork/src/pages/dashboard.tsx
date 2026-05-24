import { useGetProviderDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Star, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetProviderDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
        <Link href="/jobs/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_jobs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_applications || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_applications || 0} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hires</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_hires || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.hiring_success_rate ? `${stats.hiring_success_rate}% success rate` : 'No hires yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avg_rating?.toFixed(1) || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {stats?.recent_applications && stats.recent_applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{app.seeker?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">applied for {app.job?.title}</p>
                  </div>
                  <Link href={`/my-jobs/${app.job_id}/applicants`}>
                    <Button variant="outline" size="sm">Review</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
