import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Layout } from "@/components/layout";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import JobSearch from "@/pages/job-search";
import NewJob from "@/pages/new-job";
import JobDetail from "@/pages/job-detail";
import Applications from "@/pages/applications";
import MyJobs from "@/pages/my-jobs";
import JobApplicants from "@/pages/job-applicants";
import ChatList from "@/pages/chat-list";
import ChatRoom from "@/pages/chat-room";
import Notifications from "@/pages/notifications";
import Profile from "@/pages/profile";
import PublicProfile from "@/pages/public-profile";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { token, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!token) {
    return <Login />;
  }

  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/jobs" component={() => <ProtectedRoute component={Jobs} />} />
      <Route path="/jobs/search" component={() => <ProtectedRoute component={JobSearch} />} />
      <Route path="/jobs/new" component={() => <ProtectedRoute component={NewJob} />} />
      <Route path="/jobs/:id" component={() => <ProtectedRoute component={JobDetail} />} />
      <Route path="/applications" component={() => <ProtectedRoute component={Applications} />} />
      <Route path="/my-jobs" component={() => <ProtectedRoute component={MyJobs} />} />
      <Route path="/my-jobs/:id/applicants" component={() => <ProtectedRoute component={JobApplicants} />} />
      <Route path="/chat" component={() => <ProtectedRoute component={ChatList} />} />
      <Route path="/chat/:id" component={() => <ProtectedRoute component={ChatRoom} />} />
      <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/profile/:id" component={() => <ProtectedRoute component={PublicProfile} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <SocketProvider>
              <Router />
            </SocketProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
