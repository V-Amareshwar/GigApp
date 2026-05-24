import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateJob, useListCategories, JobInputWorkType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(5, "Title is too short").max(100),
  category_id: z.coerce.number().optional(),
  description: z.string().min(20, "Description needs more detail"),
  work_type: z.nativeEnum(JobInputWorkType),
  hourly_rate: z.coerce.number().optional().nullable(),
  daily_wage: z.coerce.number().optional().nullable(),
  monthly_salary: z.coerce.number().optional().nullable(),
  city: z.string().min(2, "City is required"),
  address: z.string().optional(),
  is_urgent: z.boolean().default(false),
  food_included: z.boolean().default(false),
  same_day_payment: z.boolean().default(false),
});

export default function NewJob() {
  const [step, setStep] = useState(1);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: categories } = useListCategories();
  const createJob = useCreateJob();

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      work_type: "daily",
      is_urgent: false,
      food_included: false,
      same_day_payment: false,
    }
  });

  const workType = form.watch("work_type");

  const onSubmit = (data: z.infer<typeof jobSchema>) => {
    // Clean up unneeded compensation fields based on work_type
    const cleanedData = { ...data };
    if (workType !== 'hourly') cleanedData.hourly_rate = null;
    if (workType !== 'daily') cleanedData.daily_wage = null;
    if (workType !== 'monthly') cleanedData.monthly_salary = null;

    createJob.mutate({ data: cleanedData }, {
      onSuccess: (res) => {
        toast({ title: "Job Posted Successfully!" });
        setLocation(`/jobs/${res.id}`);
      },
      onError: (err: any) => {
        toast({ 
          title: "Failed to post job", 
          description: err.message, 
          variant: "destructive" 
        });
      }
    });
  };

  const nextStep = async () => {
    const fieldsToValidate = 
      step === 1 ? ["title", "category_id", "description"] : 
      step === 2 ? ["work_type", "hourly_rate", "daily_wage", "monthly_salary"] : 
      ["city", "address"];
      
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep(s => s + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* STEP 1: Basic Info */}
            <div className={step === 1 ? "block" : "hidden"}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input {...form.register("title")} placeholder="e.g. Delivery Rider, Plumber" />
                  {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={(val) => form.setValue("category_id", parseInt(val))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    {...form.register("description")} 
                    placeholder="Describe the work to be done..."
                    className="h-32"
                  />
                  {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* STEP 2: Work Type & Salary */}
            <div className={step === 2 ? "block" : "hidden"}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Type of Work</Label>
                  <RadioGroup 
                    defaultValue="daily" 
                    onValueChange={(val) => form.setValue("work_type", val as JobInputWorkType)}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2 border p-4 rounded-md flex-1">
                      <RadioGroupItem value="hourly" id="t-hourly" />
                      <Label htmlFor="t-hourly" className="flex-1 cursor-pointer">Hourly</Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-md flex-1 bg-primary/5 border-primary/20">
                      <RadioGroupItem value="daily" id="t-daily" />
                      <Label htmlFor="t-daily" className="flex-1 cursor-pointer font-medium">Daily</Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-md flex-1">
                      <RadioGroupItem value="monthly" id="t-monthly" />
                      <Label htmlFor="t-monthly" className="flex-1 cursor-pointer">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>

                {workType === 'hourly' && (
                  <div className="space-y-2">
                    <Label>Hourly Rate (₹)</Label>
                    <Input type="number" {...form.register("hourly_rate")} placeholder="e.g. 150" />
                  </div>
                )}

                {workType === 'daily' && (
                  <div className="space-y-2">
                    <Label>Daily Wage (₹)</Label>
                    <Input type="number" {...form.register("daily_wage")} placeholder="e.g. 600" />
                  </div>
                )}

                {workType === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Monthly Salary (₹)</Label>
                    <Input type="number" {...form.register("monthly_salary")} placeholder="e.g. 15000" />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="same_day" 
                    checked={form.watch("same_day_payment")} 
                    onCheckedChange={(c) => form.setValue("same_day_payment", !!c)} 
                  />
                  <Label htmlFor="same_day" className="font-normal cursor-pointer">Same day payment</Label>
                </div>
              </div>
            </div>

            {/* STEP 3: Location */}
            <div className={step === 3 ? "block" : "hidden"}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input {...form.register("city")} placeholder="e.g. Bangalore" />
                  {form.formState.errors.city && <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Detailed Address (Optional)</Label>
                  <Textarea {...form.register("address")} placeholder="Landmarks or specific location" />
                </div>
              </div>
            </div>

            {/* STEP 4: Extras & Submit */}
            <div className={step === 4 ? "block" : "hidden"}>
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">Additional Details</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="urgent" 
                      checked={form.watch("is_urgent")} 
                      onCheckedChange={(c) => form.setValue("is_urgent", !!c)} 
                    />
                    <Label htmlFor="urgent" className="font-bold text-destructive cursor-pointer">Mark as URGENT hiring</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="food" 
                      checked={form.watch("food_included")} 
                      onCheckedChange={(c) => form.setValue("food_included", !!c)} 
                    />
                    <Label htmlFor="food" className="font-normal cursor-pointer">Food included</Label>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm">Please verify the details. You can review the applications once workers apply.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={() => setLocation("/dashboard")}>
                  Cancel
                </Button>
              )}

              {step < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={createJob.isPending}>
                  {createJob.isPending ? "Posting..." : <><Save className="mr-2 h-4 w-4" /> Post Job</>}
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
