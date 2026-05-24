import { useListJobs } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Calendar, IndianRupee } from "lucide-react";
import { Link } from "wouter";

export default function Jobs() {
  const { data, isLoading } = useListJobs({ limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." className="pl-9" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.jobs.map(job => (
            <Card key={job.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  {job.is_urgent && <Badge variant="destructive">URGENT</Badge>}
                </div>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> {job.city}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {job.work_type === 'hourly' ? <Clock className="h-3 w-3 mr-1" /> : <Calendar className="h-3 w-3 mr-1" />}
                    {job.work_type}
                  </Badge>
                  <Badge variant="outline">
                    <IndianRupee className="h-3 w-3 mr-1" />
                    {job.work_type === 'hourly' ? `${job.hourly_rate}/hr` : 
                     job.work_type === 'daily' ? `${job.daily_wage}/day` : 
                     `${job.monthly_salary}/mo`}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/jobs/${job.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          {data?.jobs.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No jobs found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
