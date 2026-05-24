import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMe, useUpdateMe, UserUpdateAvailability, UserUpdatePreferredWorkType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Plus, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  city: z.string().min(2, "City is required"),
  bio: z.string().optional(),
  availability: z.nativeEnum(UserUpdateAvailability).optional(),
  preferred_work_type: z.nativeEnum(UserUpdatePreferredWorkType).optional(),
  salary_expectation: z.coerce.number().optional().nullable(),
  skills: z.array(z.object({ value: z.string() })).optional(),
  business_name: z.string().optional(),
  business_type: z.string().optional(),
});

export default function Settings() {
  const { toast } = useToast();
  const { user, login } = useAuth();
  
  const { data: profile, isLoading } = useGetMe({
    query: { enabled: !!user?.id }
  });

  const updateMutation = useUpdateMe();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      city: "",
      skills: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  useEffect(() => {
    if (profile) {
      const skillsArr = profile.seeker_profile?.skills?.map(s => ({ value: s })) || [];
      
      form.reset({
        name: profile.name || "",
        city: profile.city || "",
        bio: profile.seeker_profile?.bio || "",
        availability: profile.seeker_profile?.availability as any || "immediate",
        preferred_work_type: profile.seeker_profile?.preferred_work_type as any || "any",
        salary_expectation: profile.seeker_profile?.salary_expectation || null,
        business_name: profile.provider_profile?.business_name || "",
        business_type: profile.provider_profile?.business_type || "",
        skills: skillsArr,
      });
    }
  }, [profile, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    // Transform skills array back to strings
    const plainSkills = data.skills?.map(s => s.value).filter(s => s.trim() !== "");
    
    const payload = {
      ...data,
      skills: plainSkills,
      salary_expectation: data.salary_expectation || undefined
    };

    updateMutation.mutate({ data: payload as any }, {
      onSuccess: (updatedUser) => {
        toast({ title: "Profile updated successfully" });
        // Update auth context
        login(localStorage.getItem("gigwork_token") || "", updatedUser);
      },
      onError: (err: any) => {
        toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
      </div>
    );
  }

  const isSeeker = profile.current_role === 'seeker';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and preferences.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input {...form.register("city")} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={profile.phone} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Phone number cannot be changed.</p>
            </div>
          </CardContent>
        </Card>

        {isSeeker ? (
          <Card>
            <CardHeader>
              <CardTitle>Worker Profile</CardTitle>
              <CardDescription>Details shown to employers when you apply.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bio / About Me</Label>
                <Textarea {...form.register("bio")} placeholder="Briefly describe your experience..." className="h-24" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select 
                    value={form.watch("availability")} 
                    onValueChange={(v) => form.setValue("availability", v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="within_week">Within a Week</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Work Type</Label>
                  <Select 
                    value={form.watch("preferred_work_type")} 
                    onValueChange={(v) => form.setValue("preferred_work_type", v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expected Pay (₹)</Label>
                <Input type="number" {...form.register("salary_expectation")} placeholder="e.g. 500 per day" />
              </div>

              <div className="space-y-3 pt-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md border">
                      <Input 
                        {...form.register(`skills.${index}.value`)} 
                        className="h-7 w-24 border-0 bg-transparent p-0 focus-visible:ring-0 text-sm" 
                        placeholder="Skill name"
                      />
                      <Button type="button" variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-destructive/20 hover:text-destructive" onClick={() => remove(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="h-9 border-dashed" onClick={() => append({ value: "" })}>
                    <Plus className="h-4 w-4 mr-1" /> Add Skill
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Employer Profile</CardTitle>
              <CardDescription>Details shown to workers on your job posts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name / Shop Name</Label>
                <Input {...form.register("business_name")} placeholder="e.g. Sharma Traders" />
              </div>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input {...form.register("business_type")} placeholder="e.g. Restaurant, Retail Store" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending} size="lg">
            {updateMutation.isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
