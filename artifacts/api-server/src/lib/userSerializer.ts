import { db, usersTable, seekerProfilesTable, providerProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function serializeUser(userId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return null;

  const [seekerProfile] = await db.select().from(seekerProfilesTable).where(eq(seekerProfilesTable.userId, userId));
  const [providerProfile] = await db.select().from(providerProfilesTable).where(eq(providerProfilesTable.userId, userId));

  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    profile_photo_url: user.profilePhotoUrl,
    city: user.city,
    current_role: user.currentRole,
    is_phone_verified: user.isPhoneVerified,
    is_id_verified: user.isIdVerified,
    trust_score: parseFloat(user.trustScore ?? "0"),
    is_banned: user.isBanned,
    created_at: user.createdAt.toISOString(),
    seeker_profile: seekerProfile ? {
      bio: seekerProfile.bio,
      availability: seekerProfile.availability,
      preferred_work_type: seekerProfile.preferredWorkType,
      salary_expectation: seekerProfile.salaryExpectation ? parseInt(seekerProfile.salaryExpectation) : null,
      years_experience: parseInt(seekerProfile.yearsExperience ?? "0"),
      total_jobs_completed: parseInt(seekerProfile.totalJobsCompleted ?? "0"),
      avg_rating: parseFloat(seekerProfile.avgRating ?? "0"),
      total_ratings: parseInt(seekerProfile.totalRatings ?? "0"),
      attendance_score: parseFloat(seekerProfile.attendanceScore ?? "5"),
      skills: seekerProfile.skills ?? [],
    } : null,
    provider_profile: providerProfile ? {
      business_name: providerProfile.businessName,
      business_type: providerProfile.businessType,
      total_jobs_posted: parseInt(providerProfile.totalJobsPosted ?? "0"),
      total_hires: parseInt(providerProfile.totalHires ?? "0"),
      avg_rating: parseFloat(providerProfile.avgRating ?? "0"),
      total_ratings: parseInt(providerProfile.totalRatings ?? "0"),
      avg_response_hours: providerProfile.avgResponseHours ? parseFloat(providerProfile.avgResponseHours) : null,
      hiring_success_rate: parseFloat(providerProfile.hiringSuccessRate ?? "0"),
    } : null,
  };
}
