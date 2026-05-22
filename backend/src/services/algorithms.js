import { supabase } from '../db/supabase.js';

/**
 * Distances algorithms using native PostgreSQL FTS and PostGIS / Haversine bounding boxes.
 * We're simulating this algorithm purely using Supabase native features to avoid loading heavy JSON responses on Node instances.
 */

// 1. MATCHING ALGORITHM (Weighted scoring)
export async function matchJobs(workerId, city, category, lat, lng, limit = 20) {
  // Rather than pulling 50k jobs to node, we instruct Supabase DB via RPC (Remote Procedure Call)
  // to run the equation: final_score = (skill*40) + (location*30) + (salary*20) + (availability*10)

  // Fast initial filter
  const { data, error } = await supabase
    .rpc('get_weighted_jobs', {
      user_lat: lat,
      user_lng: lng,
      filter_city: city,
      filter_category: category,
      limit_val: limit
    });
  
  if (error) throw error;
  return data;
}

// 2. SEARCH ALGORITHM (PostgreSQL FTS integration wrapper)
export async function searchJobsByText(keyword) {
  // Using native FTS GIN indexes created in Supabase:
  // "ts_rank(search_vector, plainto_tsquery('keyword')) -> DESC"
  const { data, error } = await supabase
     .rpc('fts_job_search', { search_term: keyword });
     
  if(error) throw error;
  return data;
}

// 3. RANKING & TRUST ALGORITHM SYSTEM
export async function recalculateUserTrust(userId) {
  // This logic is designed to be triggered via Database Webhooks natively, but this is the Node API execution.
  // Equation: TrustScore=(Rating*0.4)+(CompletedJobs*0.25)+(Verification*0.2)+(Attendance*0.1)-(Reports*0.15)
  // We simply kick off the RPC. DB handles math and UPDATE statement so it's instantaneous.
  const { data, error } = await supabase.rpc('update_trust_score', { target_user_id: userId });
  if (error) throw error;
  return data;
}

// 4. SCAM DETECTION SYSTEM
export function runFraudCheckPayload(payload) {
  const BANNED_WORDS = ['whatsapp me', 'telegram', 'send money', 'deposit fee'];
  const textCheck = (payload.title + " " + payload.description).toLowerCase();

  // Rule 1: High Salary Flag
  if (payload.daily_rate && payload.daily_rate > 50000) {
    return { isFraud: true, reason: 'unrealistic_salary' };
  }

  // Rule 2: Banned keywords (Scam Links)
  for (const word of BANNED_WORDS) {
    if (textCheck.includes(word)) {
      return { isFraud: true, reason: 'banned_keywords' };
    }
  }

  // Rule 3: Missing crucial fields
  if (!payload.latitude || !payload.longitude) {
    return { isFraud: true, reason: 'missing_location' };
  }

  return { isFraud: false };
}
