import { useGetMe, useListUserReviews, useSwitchRole, useGetSeekerDashboard } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { User, MapPin, Star, Settings, ShieldCheck, Repeat, Clock, Briefcase, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, login } = useAuth();
  const [_, setLocation] = useLocation();
  const switchRoleMutation = useSwitchRole();
  
  const { data: profile, isLoading } = useGetMe({
    query: { enabled: !!user?.id }
  });

  const { data: reviews, isLoading: reviewsLoading } = useListUserReviews(user?.id || "", {
    query: { enabled: !!user?.id }
  });

  const { data: seekerStats } = useGetSeekerDashboard({
    query: { enabled: !!user?.id && profile?.current_role === 'seeker' }
  });

  const handleSwitchRole = () => {
    const newRole = profile?.current_role === 'seeker' ? 'provider' : 'seeker';
    switchRoleMutation.mutate({ data: { role: newRole } }, {
      onSuccess: (res) => {
        // Update local context manually to avoid full reload
        login(localStorage.getItem("gigwork_token") || "", res);
      }
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 w-full md:col-span-1" />
          <Skeleton className="h-64 w-full md:col-span-2" />
        </div>
      </div>
    );
  }

  const isSeeker = profile.current_role === 'seeker';
  const seekerProfile = profile.seeker_profile;
  const providerProfile = profile.provider_profile;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSwitchRole} disabled={switchRoleMutation.isPending}>
            <Repeat className="h-4 w-4 mr-2" />
            Switch to {isSeeker ? 'Provider' : 'Seeker'}
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={profile.profile_photo_url || undefined} />
              <AvatarFallback className="text-2xl"><User className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-2">
                <div>
                  <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                    {profile.name || profile.phone}
                    {profile.is_id_verified && <ShieldCheck className="h-5 w-5 text-green-600" />}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-muted-foreground mt-1 text-sm">
                    <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> {profile.city || 'No city set'}</span>
                    <span className="flex items-center">
                      <Star className="h-3.5 w-3.5 mr-1 text-amber-500 fill-amber-500" /> 
                      {isSeeker 
                        ? (seekerProfile?.avg_rating?.toFixed(1) || 'New')
                        : (providerProfile?.avg_rating?.toFixed(1) || 'New')}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {isSeeker ? 'Finding Work' : 'Posting Jobs'}
                </Badge>
              </div>

              {isSeeker && seekerProfile?.bio && (
                <p className="text-sm mt-3 text-muted-foreground max-w-xl">{seekerProfile.bio}</p>
              )}
              {!isSeeker && providerProfile?.business_name && (
                <p className="text-sm mt-3 font-medium flex items-center justify-center md:justify-start">
                  <Briefcase className="h-4 w-4 mr-2 text-primary" />
                  {providerProfile.business_name} {providerProfile.business_type && `• ${providerProfile.business_type}`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Trust Score</span>
                <span className="font-medium text-green-600">{profile.trust_score || 0}%</span>
              </div>
              
              {isSeeker ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Applied</span>
                    <span className="font-medium">{seekerStats?.total_applied || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium">{seekerStats?.completed_count || seekerProfile?.total_jobs_completed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Attendance</span>
                    <span className="font-medium">{seekerStats?.attendance_score || seekerProfile?.attendance_score || 0}%</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Hires</span>
                    <span className="font-medium">{providerProfile?.total_hires || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium">{providerProfile?.hiring_success_rate || 0}%</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm">Member Since</span>
                <span className="font-medium text-sm">{format(new Date(profile.created_at), 'MMM yyyy')}</span>
              </div>
            </CardContent>
          </Card>

          {isSeeker && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Work Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {seekerProfile?.preferred_work_type && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center"><Clock className="h-3 w-3 mr-1" /> Type</span>
                    <p className="text-sm font-medium capitalize">{seekerProfile.preferred_work_type}</p>
                  </div>
                )}
                {seekerProfile?.availability && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center"><Calendar className="h-3 w-3 mr-1" /> Availability</span>
                    <p className="text-sm font-medium capitalize">{seekerProfile.availability.replace('_', ' ')}</p>
                  </div>
                )}
                {seekerProfile?.salary_expectation && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Expected Pay</span>
                    <p className="text-sm font-medium">₹{seekerProfile.salary_expectation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          {isSeeker && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Skills</CardTitle>
                <Link href="/settings"><Button variant="ghost" size="sm">Edit</Button></Link>
              </CardHeader>
              <CardContent>
                {seekerProfile?.skills && seekerProfile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {seekerProfile.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1 bg-muted/50">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : reviews?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews?.map(review => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]"><User className="h-3 w-3" /></AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{review.reviewer?.name || "User"}</span>
                        </div>
                        <div className="flex text-amber-500">
                          {Array.from({length: 5}).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-500" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 opacity-50">
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
