import { Router } from "express";
import { db, jobsTable, applicationsTable, seekerProfilesTable, providerProfilesTable, reviewsTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { serializeUser } from "../lib/userSerializer";

const router: Router = Router();

router.get("/v1/stats/provider-dashboard", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;

  const myJobs = await db.select().from(jobsTable).where(eq(jobsTable.providerId, userId));
  const activeJobs = myJobs.filter(j => j.status === "active").length;

  const jobIds = myJobs.map(j => j.id);
  let allApps: any[] = [];
  if (jobIds.length > 0) {
    for (const jid of jobIds) {
      const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jid));
      allApps.push(...apps);
    }
  }
  const totalApplications = allApps.length;
  const pendingApplications = allApps.filter(a => a.status === "pending").length;
  const totalHires = allApps.filter(a => a.status === "accepted" || a.status === "completed").length;

  const [pProfile] = await db.select().from(providerProfilesTable).where(eq(providerProfilesTable.userId, userId));
  const avgRating = parseFloat(pProfile?.avgRating ?? "0");
  const hiringSuccessRate = myJobs.length > 0 ? (totalHires / myJobs.length) * 100 : 0;

  const statusCounts = ["active", "paused", "filled", "expired", "removed"].map(s => ({
    status: s,
    count: myJobs.filter(j => j.status === s).length,
  }));

  const recentAppsSerialized = await Promise.all(
    allApps.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime()).slice(0, 5).map(async (app) => {
      const seeker = await serializeUser(app.seekerId);
      return { id: app.id, job_id: app.jobId, seeker_id: app.seekerId, status: app.status, employer_note: app.employerNote, applied_at: app.appliedAt.toISOString(), responded_at: app.respondedAt?.toISOString() ?? null, completed_at: app.completedAt?.toISOString() ?? null, chat_room_id: null, job: null, seeker };
    })
  );

  res.json({
    active_jobs: activeJobs,
    total_applications: totalApplications,
    total_hires: totalHires,
    pending_applications: pendingApplications,
    avg_rating: avgRating,
    hiring_success_rate: hiringSuccessRate,
    jobs_by_status: statusCounts,
    recent_applications: recentAppsSerialized,
  });
});

router.get("/v1/stats/seeker-dashboard", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const myApps = await db.select().from(applicationsTable).where(eq(applicationsTable.seekerId, userId));
  const [sProfile] = await db.select().from(seekerProfilesTable).where(eq(seekerProfilesTable.userId, userId));

  res.json({
    total_applied: myApps.length,
    pending_count: myApps.filter(a => a.status === "pending").length,
    accepted_count: myApps.filter(a => a.status === "accepted").length,
    completed_count: myApps.filter(a => a.status === "completed").length,
    avg_rating: parseFloat(sProfile?.avgRating ?? "0"),
    trust_score: 0,
    total_jobs_completed: parseInt(sProfile?.totalJobsCompleted ?? "0"),
    attendance_score: parseFloat(sProfile?.attendanceScore ?? "5"),
  });
});

router.get("/v1/stats/job-activity/:jobId", requireAuth, async (req, res): Promise<void> => {
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }

  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jobId));

  const byDay: Record<string, number> = {};
  apps.forEach(a => {
    const day = a.appliedAt.toISOString().split("T")[0];
    byDay[day] = (byDay[day] ?? 0) + 1;
  });

  const statusBreakdown = ["pending", "accepted", "rejected", "withdrawn", "completed"].map(s => ({
    status: s,
    count: apps.filter(a => a.status === s).length,
  }));

  res.json({
    job_id: jobId,
    total_views: job.viewsCount ?? 0,
    total_applications: apps.length,
    applications_by_day: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    status_breakdown: statusBreakdown,
  });
});

export default router;
