-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role text NOT NULL DEFAULT 'Seeker',
  name text,
  phone text,
  city text,
  languages text[] DEFAULT '{}',
  gender text,
  age text,
  
  -- Seeker Specific
  skills text[] DEFAULT '{}',
  experience text,
  preferred_work_type text,
  preferred_categories text[] DEFAULT '{}',
  salary_expectation text,
  availability text,
  
  -- Provider Specific
  business_name text,
  
  -- Stats
  rating numeric DEFAULT 5.0,
  jobs_completed integer DEFAULT 0,
  attendance_score text DEFAULT '100%',
  cancellation_rate text DEFAULT '0%',
  phone_verified boolean DEFAULT false,
  id_verified boolean DEFAULT false,
  active_jobs integer DEFAULT 0,
  hiring_success_rate text DEFAULT '100%',
  response_time text DEFAULT 'Replies within 10 mins',
  
  -- Activity
  total_applications integer DEFAULT 0,
  response_rate text DEFAULT '100%',
  last_active timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  latitude double precision,
  longitude double precision,
  location_name text,
  description text,
  requirements text[],
  hourly_rate numeric,
  daily_rate numeric,
  monthly_rate numeric,
  start_date text,
  start_time text,
  end_time text,
  urgency_score numeric DEFAULT 5.0,
  created_at timestamp with time zone DEFAULT now()
);

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  seeker_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'Pending', -- 'Pending', 'Accepted', 'Rejected', 'Completed'
  created_at timestamp with time zone DEFAULT now()
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating integer NOT NULL,
  message text,
  date text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS POLICIES (For now, allow all for prototyping, since we are doing dummy auth)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on jobs" ON public.jobs FOR ALL USING (true);
CREATE POLICY "Allow all operations on applications" ON public.applications FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on reviews" ON public.reviews FOR ALL USING (true);
