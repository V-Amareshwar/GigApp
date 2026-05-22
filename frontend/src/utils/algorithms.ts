export interface Job {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  hourly_rate?: number;
  daily_rate?: number;
  monthly_rate?: number;
  provider_trust_score: number; // e.g. 0-5
  urgency_score: number;        // e.g. 0-10
  created_at: Date;
}

export interface UserPreferences {
  latitude: number;
  longitude: number;
  preferred_categories: string[];
  max_distance_km: number;
  // If true, prioritizing jobs offering instant gigs/urgent status
  needs_urgent?: boolean;
}

/**
 * Calculates the great-circle distance between two points on the Earth.
 * Very fast mathematical calculation optimized for V8/JSC.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Composite Ranking Algorithm
 * Combines Distance, Trust, Urgency, and Category Matching into a single score.
 * By computing this locally, we reduce expensive "ORDER BY" operations on the backend, Let Backend just send raw localized data.
 */
export function calculateMatchScore(job: Job, preferences: UserPreferences): number {
  let score = 0;

  // 1. Distance Score (Closer is exponentially better. Max weight 40)
  const distance = haversineDistance(
    preferences.latitude, 
    preferences.longitude, 
    job.latitude, 
    job.longitude
  );
  
  // If outside bound, score takes huge hit or we filter out immediately
  if (distance > preferences.max_distance_km) return -1; // -1 means filter out entirely
  
  // Normalize distance to 0-40 score.
  const distanceScore = Math.max(0, 40 - (distance / preferences.max_distance_km) * 40);
  score += distanceScore;

  // 2. Category Match (Weight: 20)
  if (preferences.preferred_categories.includes(job.category)) {
    score += 20;
  }

  // 3. Provider Trust Score (Weight: 20) - 5 stars = 20 pts
  score += (job.provider_trust_score / 5) * 20;

  // 4. Urgency Factor (Weight: 20)
  if (preferences.needs_urgent) {
    score += (job.urgency_score / 10) * 20;
  } else {
    // Regular users still prefer responsive gigs, but less weighted (10)
    score += (job.urgency_score / 10) * 10;
  }

  return score; // Max possible score ~100
}

/**
 * Sorts and filters an array of jobs efficiently.
 * Usage: O(N log N) complex, running completely client-side for "cost-efficiency".
 */
export function getOptimizedFeed(jobs: Job[], preferences: UserPreferences): Job[] {
  // We use functional chaining combining map/sort instead of double-iteration to save cycles.
  const scoredJobs = jobs.reduce((acc, job) => {
    const score = calculateMatchScore(job, preferences);
    if (score >= 0) { // filter out -1 distances
      acc.push({ job, score });
    }
    return acc;
  }, [] as { job: Job; score: number }[]);

  // Sort descending by score
  return scoredJobs
    .sort((a, b) => b.score - a.score)
    .map(scored => scored.job);
}
