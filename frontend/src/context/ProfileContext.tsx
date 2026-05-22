import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  message: string;
  date: string;
}

export interface ProfileData {
  isProfileComplete: boolean;
  name: string;
  phone: string;
  city: string;
  languages: string[];
  gender: string;
  age: string;
  
  // Seeker Specific
  skills: string[];
  experience: string;
  preferredWorkType: string;
  preferredCategories: string[];
  salaryExpectation: string;
  availability: string;
  
  // Provider Specific
  businessName: string;
  
  // Stats & Trust
  rating: number;
  jobsCompleted: number;
  attendanceScore: string;
  cancellationRate: string;
  phoneVerified: boolean;
  idVerified: boolean;
  activeJobs: number;
  hiringSuccessRate: string;
  responseTime: string;
  reviews: Review[];
  
  // Activity
  totalApplications: number;
  responseRate: string;
  lastActive: string;
}

interface ProfileContextType {
  profile: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
  completeOnboarding: (data: Partial<ProfileData>) => void;
  setProfileStatus: (isComplete: boolean) => void;
}

const defaultProfile: ProfileData = {
  isProfileComplete: false, // Initially false to force onboarding
  name: 'New User',
  phone: '+91 98765 43210',
  city: 'Hyderabad',
  languages: ['English', 'Hindi', 'Telugu'],
  gender: 'Male',
  age: '28',
  skills: ['Driving', 'Packing', 'Delivery'],
  experience: '1-3 Years',
  preferredWorkType: 'Daily',
  preferredCategories: ['Delivery', 'Warehouse'],
  salaryExpectation: '₹800/day',
  availability: 'Available Now',
  businessName: 'FreshMart Logistics',
  rating: 4.8,
  jobsCompleted: 52,
  attendanceScore: '95%',
  cancellationRate: '2%',
  phoneVerified: true,
  idVerified: true,
  activeJobs: 8,
  hiringSuccessRate: '92%',
  responseTime: 'Replies within 10 mins',
  reviews: [
    { id: '1', reviewerName: 'Rahul T.', rating: 5, message: 'Good worker and arrived on time.', date: 'Oct 20, 2026' },
    { id: '2', reviewerName: 'Anita M.', rating: 4, message: 'Very polite and completed the job well.', date: 'Oct 15, 2026' }
  ],
  totalApplications: 120,
  responseRate: '98%',
  lastActive: 'Active 5 mins ago',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      fetchProfile(user.uid);
    }
  }, [user]);

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
        
      if (error) {
        console.error('Error fetching profile from Supabase:', error.message);
        return;
      }
      
      if (data) {
        setProfile({
          isProfileComplete: true, // We assume if it exists in DB, it's complete
          name: data.name || 'New User',
          phone: data.phone || '',
          city: data.city || '',
          languages: data.languages || [],
          gender: data.gender || '',
          age: data.age || '',
          skills: data.skills || [],
          experience: data.experience || '',
          preferredWorkType: data.preferred_work_type || '',
          preferredCategories: data.preferred_categories || [],
          salaryExpectation: data.salary_expectation || '',
          availability: data.availability || '',
          businessName: data.business_name || '',
          rating: Number(data.rating) || 5.0,
          jobsCompleted: data.jobs_completed || 0,
          attendanceScore: data.attendance_score || '100%',
          cancellationRate: data.cancellation_rate || '0%',
          phoneVerified: data.phone_verified || false,
          idVerified: data.id_verified || false,
          activeJobs: data.active_jobs || 0,
          hiringSuccessRate: data.hiring_success_rate || '100%',
          responseTime: data.response_time || '',
          totalApplications: data.total_applications || 0,
          responseRate: data.response_rate || '100%',
          lastActive: 'Active recently',
          reviews: [] // We can fetch reviews later
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    
    if (user?.uid) {
      // Map to db column names
      const dbData = {
        name: updated.name,
        phone: updated.phone,
        city: updated.city,
        languages: updated.languages,
        gender: updated.gender,
        age: updated.age,
        skills: updated.skills,
        experience: updated.experience,
        preferred_work_type: updated.preferredWorkType,
        preferred_categories: updated.preferredCategories,
        salary_expectation: updated.salaryExpectation,
        availability: updated.availability,
        business_name: updated.businessName
      };
      
      await supabase.from('profiles').update(dbData).eq('id', user.uid);
    }
  };

  const completeOnboarding = async (data: Partial<ProfileData>) => {
    const updated = { ...profile, ...data, isProfileComplete: true };
    setProfile(updated);
    
    if (user?.uid) {
      const dbData = {
        name: updated.name,
        phone: updated.phone,
        city: updated.city,
        languages: updated.languages,
        gender: updated.gender,
        age: updated.age,
        skills: updated.skills,
        experience: updated.experience,
        preferred_work_type: updated.preferredWorkType,
        preferred_categories: updated.preferredCategories,
        salary_expectation: updated.salaryExpectation,
        availability: updated.availability,
        business_name: updated.businessName
      };
      
      await supabase.from('profiles').update(dbData).eq('id', user.uid);
    }
  };

  const setProfileStatus = (isComplete: boolean) => {
    setProfile(prev => ({ ...prev, isProfileComplete: isComplete }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, completeOnboarding, setProfileStatus }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};
