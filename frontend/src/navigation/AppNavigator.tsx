import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useProfile } from '../context/ProfileContext';

// Import Screens
import { AuthScreen } from '../screens/AuthScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { SeekerDashboard } from '../screens/SeekerDashboard';
import { ProviderDashboard } from '../screens/ProviderDashboard';
import { DynamicJobForm } from '../screens/JobPosting/DynamicJobForm';
import { SplashScreen } from '../screens/SplashScreen';
import { SeekerApplicationsScreen } from '../screens/SeekerApplicationsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SavedJobsScreen } from '../screens/SavedJobsScreen';
import { ProviderJobsScreen } from '../screens/ProviderJobsScreen';
import { ProviderWorkersScreen } from '../screens/ProviderWorkersScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { PrivacySettingsScreen } from '../screens/PrivacySettingsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { JobDetailsScreen } from '../screens/JobDetailsScreen';
import { ProviderApplicationsScreen } from '../screens/ProviderApplicationsScreen';
import { ReviewScreen } from '../screens/ReviewScreen';

export type RootStackParamList = {
  Auth: undefined;
  RoleSelection: undefined;
  SeekerDashboard: undefined;
  ProviderDashboard: undefined;
  JobPosting: undefined;
  Splash: undefined;
  SeekerApplications: undefined;
  EditProfile: undefined;
  Profile: undefined;
  SavedJobs: undefined;
  ProviderJobs: undefined;
  ProviderWorkers: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  SeekerApp: undefined;
  ProviderApp: undefined;
  Chat: { name?: string; role?: string; jobTitle?: string, jobId?: string, receiverId?: string };
  JobDetails: { job: any };
  ProviderApplications: undefined;
  Review: { applicationId: string, revieweeId: string, jobId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const SeekerStack = createNativeStackNavigator();
const ProviderStack = createNativeStackNavigator();

const SeekerApp = () => (
  <SeekerStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
    <SeekerStack.Screen name="SeekerDashboard" component={SeekerDashboard} />
    <SeekerStack.Screen name="SeekerApplications" component={SeekerApplicationsScreen} />
    <SeekerStack.Screen name="Profile" component={ProfileScreen} />
    <SeekerStack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: 'default' }} />
    <SeekerStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ animation: 'default' }} />
    <SeekerStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ animation: 'default' }} />
    <SeekerStack.Screen name="SavedJobs" component={SavedJobsScreen} />
    <SeekerStack.Screen name="Chat" component={ChatScreen} options={{ animation: 'default' }} />
    <SeekerStack.Screen name="JobDetails" component={JobDetailsScreen} options={{ animation: 'default' }} />
    <SeekerStack.Screen name="Review" component={ReviewScreen} options={{ animation: 'default' }} />
  </SeekerStack.Navigator>
);

const ProviderApp = () => (
  <ProviderStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
    <ProviderStack.Screen name="ProviderDashboard" component={ProviderDashboard} />
    <ProviderStack.Screen name="JobPosting" component={DynamicJobForm} options={{ headerShown: true, title: 'Post Job', animation: 'default' }} />
    <ProviderStack.Screen name="Profile" component={ProfileScreen} />
    <ProviderStack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: 'default' }} />
    <ProviderStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ animation: 'default' }} />
    <ProviderStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ animation: 'default' }} />
    <ProviderStack.Screen name="ProviderJobs" component={ProviderJobsScreen} />
    <ProviderStack.Screen name="ProviderWorkers" component={ProviderWorkersScreen} />
    <ProviderStack.Screen name="ProviderApplications" component={ProviderApplicationsScreen} />
    <ProviderStack.Screen name="Chat" component={ChatScreen} options={{ animation: 'default' }} />
    <ProviderStack.Screen name="Review" component={ReviewScreen} options={{ animation: 'default' }} />
  </ProviderStack.Navigator>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { role } = useRole();
  const { profile } = useProfile();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 
        Here we mock the auth logic. If we were really logging in, we check user. 
        For now, let's keep it simple: if no role is selected, show RoleSelection.
        If user is null in production, we show Auth. 
      */}
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : !profile?.isProfileComplete ? (
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      ) : !role ? (
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      ) : role === 'Seeker' ? (
        <Stack.Screen name="SeekerApp" component={SeekerApp} />
      ) : (
        <Stack.Screen name="ProviderApp" component={ProviderApp} />
      )}
    </Stack.Navigator>
  );
};
