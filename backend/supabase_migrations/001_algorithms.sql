-- ALGORITHMS DB SCHEMA / SUPABASE MIGRATIONS
-- COPY PASTE THIS INTO SUPABASE SQL EDITOR

-- 1. POSTGIS for Haversine Distance Filters
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
CREATE EXTENSION IF NOT EXISTS cube CASCADE;

-- 2. FULL TEXT SEARCH (GIN INDEX)
-- Automatically update search_vector based on Title, Category, and Description combinations
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C')
) STORED;

CREATE INDEX IF NOT EXISTS jobs_search_idx ON jobs USING GIN(search_vector);

-- 3. THE HAVERSINE + WEIGHTED MATCH RPC BUNDLE
CREATE OR REPLACE FUNCTION get_weighted_jobs(
  user_lat double precision,
  user_lng double precision,
  filter_city text,
  filter_category text,
  limit_val int
) RETURNS TABLE (
  id uuid,
  title text,
  category text,
  daily_rate numeric,
  distance_km double precision,
  trust_score numeric,
  match_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id, 
    j.title, 
    j.category, 
    j.daily_rate,
    -- Haversine calc locally in db
    (earth_distance(ll_to_earth(user_lat, user_lng), ll_to_earth(j.latitude, j.longitude)) / 1000)::double precision AS distance_km,
    j.provider_trust_score AS trust_score,
    -- Match Score Formula (Simulated Weights based on Distance and Trust)
    (
      (CASE WHEN j.category = filter_category THEN 40 ELSE 0 END) +
      (CASE WHEN (earth_distance(ll_to_earth(user_lat, user_lng), ll_to_earth(j.latitude, j.longitude)) / 1000) < 5 THEN 30 ELSE 0 END) +
      (j.provider_trust_score * 4) -- Max 20 points
    )::numeric AS match_score
  FROM jobs j
  WHERE j.city = filter_city AND j.is_active = true
  ORDER BY match_score DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql;

-- 4. TRUST REPORTING TRIGGER CALCULATION
CREATE OR REPLACE FUNCTION trigger_update_trust()
RETURNS trigger AS $$
BEGIN
  -- Equation: TrustScore = (Rating*0.4) + (CompletedJobs*0.25) + etc...
  UPDATE users 
  SET trust_score = (
    (NEW.rating * 0.4) + 
    (NEW.completed_tasks % 100 * 0.25) - 
    (NEW.reports_count * 0.15)
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;