import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@workspace/api-client-react";
import { 
  Home, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Bell, 
  User,
  LogOut,
  PlusCircle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, token, logout: contextLogout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = useLogout();

  if (!token) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const role = user?.current_role || 'seeker';

  const seekerNav = [
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Applications", href: "/applications", icon: FileText },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const providerNav = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Jobs", href: "/my-jobs", icon: Briefcase },
    { name: "Post Job", href: "/jobs/new", icon: PlusCircle },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const navItems = role === 'seeker' ? seekerNav : providerNav;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        contextLogout();
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card z-20">
        <Link href="/" className="font-bold text-xl text-primary tracking-tight">GigWork</Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-card border-r flex-shrink-0
        fixed md:sticky top-[73px] md:top-0 h-[calc(100vh-73px)] md:h-screen z-10 overflow-y-auto
      `}>
        <div className="p-6 hidden md:block">
          <Link href="/" className="font-bold text-2xl text-primary tracking-tight">GigWork</Link>
        </div>
        
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href) && (item.href !== '/' || location === '/');
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                <item.icon size={20} className={isActive ? "text-primary" : ""} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full max-w-full relative min-h-[calc(100vh-73px)] md:min-h-screen">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
