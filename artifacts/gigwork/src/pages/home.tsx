import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.current_role === 'seeker') {
        setLocation("/jobs");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
