import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister, RegisterInputRole } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name is required"),
  city: z.string().min(2, "City is required"),
  role: z.nativeEnum(RegisterInputRole),
});

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: "", password: "", name: "", city: "", role: "seeker" },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.access_token, res.user);
      },
      onError: (err: any) => {
        toast({
          title: "Login failed",
          description: err?.message || "Please check your credentials",
          variant: "destructive",
        });
      }
    });
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.access_token, res.user);
      },
      onError: (err: any) => {
        toast({
          title: "Registration failed",
          description: err?.message || "Please try again later",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary tracking-tight">GigWork</CardTitle>
          <CardDescription>
            {isRegister ? "Create an account to get started" : "Welcome back to your local work marketplace"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isRegister ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-phone">Phone Number</Label>
                <Input id="login-phone" {...loginForm.register("phone")} placeholder="10-digit number" />
                {loginForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" {...loginForm.register("password")} />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>I want to...</Label>
                <RadioGroup 
                  defaultValue="seeker" 
                  onValueChange={(val) => registerForm.setValue("role", val as RegisterInputRole)}
                  className="flex gap-4 pt-1 pb-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="seeker" id="r-seeker" />
                    <Label htmlFor="r-seeker" className="font-normal cursor-pointer">Find Work</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="provider" id="r-provider" />
                    <Label htmlFor="r-provider" className="font-normal cursor-pointer">Post Jobs</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input id="reg-name" {...registerForm.register("name")} />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone Number</Label>
                  <Input id="reg-phone" {...registerForm.register("phone")} placeholder="10 digits" />
                  {registerForm.formState.errors.phone && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-city">City</Label>
                  <Input id="reg-city" {...registerForm.register("city")} />
                  {registerForm.formState.errors.city && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.city.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" type="password" {...registerForm.register("password")} />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsRegister(!isRegister)} className="text-sm text-muted-foreground">
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
