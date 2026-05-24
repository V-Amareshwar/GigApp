import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetJob, useApplyToJob, useGetJobActivity, useReportJob } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Calendar, IndianRupee, AlertCircle, ArrowLeft, Building, User, Eye, Users, Flag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: job, isLoading } = useGetJob(id, {
    query: { enabled: !!id }
  });

  const { data: activity } = useGetJobActivity(id, {
    query: { enabled: !!id && user?.current_role === 'provider' && user?.id === job?.provider_id }
  });

  const applyMutation = useApplyToJob();
  const reportMutation = useReportJob();

  const handleApply = () => {
    applyMutation.mutate({ jobId: id }, {
      onSuccess: () => {
        toast({
          title: "Application submitted",
          description: "You have successfully applied for this job.",
        });
        setLocation("/applications");
      },
      onError: (err: any) => {
        toast({
          title: "Application failed",
          description: err?.message || "Could not submit application",
          variant: "destructive",
        });
      }
    });
  };

  const handleReport = () => {
    if (confirm("Are you sure you want to report this job as spam/scam?")) {
      reportMutation.mutate({ jobId: id, data: { reason: "spam", description: "User reported" } }, {
        onSuccess: () => {
          toast({ title: "Job reported" });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) return <div>Job not found</div>;

  const isProvider = user?.current_role === 'provider';
  const isOwner = isProvider && user?.id === job.provider_id;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => setLocation(isProvider ? "/dashboard" : "/jobs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {!isOwner && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleReport}>
            <Flag className="mr-2 h-4 w-4" /> Report Job
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                {job.is_urgent && <Badge variant="destructive" className="ml-2">URGENT</Badge>}
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-2">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {job.city}</span>
                {job.address && <span>• {job.address}</span>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1 text-sm">
                  {job.work_type === 'hourly' ? <Clock className="h-4 w-4 mr-1" /> : <Calendar className="h-4 w-4 mr-1" />}
                  {job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm border-primary/30">
                  <IndianRupee className="h-4 w-4 mr-1 text-primary" />
                  <span className="font-semibold text-foreground">
                    {job.work_type === 'hourly' ? `${job.hourly_rate}/hr` : 
                     job.work_type === 'daily' ? `${job.daily_wage}/day` : 
                     `${job.monthly_salary}/mo`}
                  </span>
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.description || "No description provided."}</p>
              </div>

              {job.skills_required && job.skills_required.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {job.same_day_payment !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckIcon included={job.same_day_payment} /> Same Day Payment
                  </div>
                )}
                {job.food_included !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckIcon included={job.food_included} /> Food Included
                  </div>
                )}
                {job.accommodation_included !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckIcon included={job.accommodation_included} /> Accommodation
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isOwner && activity && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ActivityIcon /> Job Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center">
                    <Eye className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-2xl font-bold">{activity.total_views}</span>
                    <span className="text-xs text-muted-foreground">Total Views</span>
                  </div>
                  <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center">
                    <Users className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-2xl font-bold">{activity.total_applications}</span>
                    <span className="text-xs text-muted-foreground">Applications</span>
                  </div>
                </div>
                <Link href={`/my-jobs/${id}/applicants`}>
                  <Button className="w-full">View Applicants</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {!isOwner && (
            <Card>
              <CardContent className="p-6">
                <Button 
                  className="w-full text-lg h-12" 
                  size="lg"
                  onClick={handleApply}
                  disabled={applyMutation.isPending || job.has_applied || job.status !== 'active'}
                >
                  {job.has_applied ? "Already Applied" : "Apply Now"}
                </Button>
                {job.status !== 'active' && (
                  <p className="text-xs text-center text-destructive mt-2">
                    <AlertCircle className="inline h-3 w-3 mr-1" />
                    This job is currently {job.status}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{job.provider?.provider_profile?.business_name || job.provider?.name}</h4>
                  {job.provider?.provider_profile?.business_type && (
                    <p className="text-sm text-muted-foreground">{job.provider.provider_profile.business_type}</p>
                  )}
                  {job.provider?.provider_profile?.avg_rating && (
                    <div className="flex items-center mt-1 text-sm text-amber-600 font-medium">
                      ★ {job.provider.provider_profile.avg_rating.toFixed(1)} 
                      <span className="text-muted-foreground font-normal ml-1">
                        ({job.provider.provider_profile.total_ratings} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href={`/profile/${job.provider_id}`}>
                  <Button variant="outline" className="w-full">View Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ included }: { included?: boolean }) {
  if (included) {
    return <span className="text-green-600 font-bold">✓</span>;
  }
  return <span className="text-muted-foreground">✕</span>;
}

function ActivityIcon() {
  return <Clock className="h-5 w-5" />;
}
