import { Router } from "express";
import { db, applicationsTable, jobsTable, chatRoomsTable, notificationsTable, categoriesTable, seekerProfilesTable, providerProfilesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { serializeUser } from "../lib/userSerializer";

const router: Router = Router();

async function serializeApplication(app: any) {
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  const [cat] = job?.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, job.categoryId)) : [null];
  const seeker = await serializeUser(app.seekerId);
  const provider = job ? await serializeUser(job.providerId) : null;

  const [room] = await db.select({ id: chatRoomsTable.id }).from(chatRoomsTable)
    .where(eq(chatRoomsTable.applicationId, app.id));

  return {
    id: app.id,
    job_id: app.jobId,
    seeker_id: app.seekerId,
    status: app.status,
    employer_note: app.employerNote,
    applied_at: app.appliedAt.toISOString(),
    responded_at: app.respondedAt?.toISOString() ?? null,
    completed_at: app.completedAt?.toISOString() ?? null,
    chat_room_id: room?.id ?? null,
    job: job ? {
      id: job.id,
      title: job.title,
      work_type: job.workType,
      daily_wage: job.dailyWage,
      hourly_rate: job.hourlyRate,
      monthly_salary: job.monthlySalary,
      city: job.city,
      status: job.status,
      is_urgent: job.isUrgent,
      is_verified: job.isVerified,
      applications_count: job.applicationsCount,
      views_count: job.viewsCount,
      skills_required: job.skillsRequired ?? [],
      description: job.description,
      category_id: job.categoryId,
      category: cat ? { id: cat.id, name: cat.name, name_hi: cat.nameHi, icon_name: cat.iconName, sort_order: cat.sortOrder } : null,
      provider_id: job.providerId,
      provider: provider,
      address: job.address,
      food_included: job.foodIncluded,
      accommodation_included: job.accommodationIncluded,
      created_at: job.createdAt.toISOString(),
      expires_at: job.expiresAt?.toISOString() ?? null,
    } : null,
    seeker,
  };
}

router.post("/v1/jobs/:jobId/apply", requireAuth, async (req, res): Promise<void> => {
  if (req.userRole !== "seeker") {
    res.status(403).json({ error: "Seeker role required" });
    return;
  }
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job || job.status !== "active") {
    res.status(400).json({ error: "Job is not active" });
    return;
  }
  const [existing] = await db.select({ id: applicationsTable.id }).from(applicationsTable)
    .where(and(eq(applicationsTable.jobId, jobId), eq(applicationsTable.seekerId, req.userId!)));
  if (existing) {
    res.status(400).json({ error: "Already applied to this job" });
    return;
  }
  const [app] = await db.insert(applicationsTable).values({
    jobId, seekerId: req.userId!, status: "pending",
  }).returning();

  await db.update(jobsTable).set({ applicationsCount: (job.applicationsCount ?? 0) + 1 }).where(eq(jobsTable.id, jobId));

  await db.insert(notificationsTable).values({
    userId: job.providerId,
    type: "app_received",
    title: "New Application",
    body: "Someone applied to your job posting",
    jobId: job.id,
    applicationId: app.id,
  }).catch(() => {});

  res.status(201).json(await serializeApplication(app));
});

router.get("/v1/jobs/:jobId/applications", requireAuth, async (req, res): Promise<void> => {
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const [job] = await db.select({ id: jobsTable.id, providerId: jobsTable.providerId }).from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  if (job.providerId !== req.userId) { res.status(403).json({ error: "Not your job" }); return; }

  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jobId)).orderBy(desc(applicationsTable.appliedAt));
  const results = await Promise.all(apps.map(serializeApplication));
  res.json(results);
});

router.get("/v1/applications/mine", requireAuth, async (req, res): Promise<void> => {
  const { status } = req.query as Record<string, string>;
  const conditions = [eq(applicationsTable.seekerId, req.userId!)];
  if (status && ["pending","accepted","rejected","withdrawn","completed"].includes(status)) {
    conditions.push(eq(applicationsTable.status, status));
  }

  const apps = await db.select().from(applicationsTable).where(and(...conditions)).orderBy(desc(applicationsTable.appliedAt));
  const results = await Promise.all(apps.map(serializeApplication));
  res.json(results);
});

router.put("/v1/applications/:applicationId/accept", requireAuth, async (req, res): Promise<void> => {
  const applicationId = Array.isArray(req.params.applicationId) ? req.params.applicationId[0] : req.params.applicationId;
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, applicationId));
  if (!app) { res.status(404).json({ error: "Application not found" }); return; }

  const [job] = await db.select({ providerId: jobsTable.providerId }).from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || job.providerId !== req.userId) { res.status(403).json({ error: "Not your job" }); return; }

  const [updated] = await db.update(applicationsTable).set({ status: "accepted", respondedAt: new Date() })
    .where(eq(applicationsTable.id, applicationId)).returning();

  const [room] = await db.insert(chatRoomsTable).values({
    applicationId, seekerId: app.seekerId, providerId: req.userId!,
  }).onConflictDoNothing().returning();

  await db.insert(notificationsTable).values({
    userId: app.seekerId, type: "app_accepted", title: "Application Accepted!",
    body: "Your application was accepted. You can now chat with the employer.",
    applicationId,
  }).catch(() => {});

  res.json(await serializeApplication(updated));
});

router.put("/v1/applications/:applicationId/reject", requireAuth, async (req, res): Promise<void> => {
  const applicationId = Array.isArray(req.params.applicationId) ? req.params.applicationId[0] : req.params.applicationId;
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, applicationId));
  if (!app) { res.status(404).json({ error: "Application not found" }); return; }

  const [job] = await db.select({ providerId: jobsTable.providerId }).from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || job.providerId !== req.userId) { res.status(403).json({ error: "Not your job" }); return; }

  const [updated] = await db.update(applicationsTable).set({
    status: "rejected",
    respondedAt: new Date(),
    employerNote: req.body.employer_note ?? null,
  }).where(eq(applicationsTable.id, applicationId)).returning();

  await db.insert(notificationsTable).values({
    userId: app.seekerId, type: "app_rejected", title: "Application Update",
    body: "Your application was not selected this time.",
    applicationId,
  }).catch(() => {});

  res.json(await serializeApplication(updated));
});

router.put("/v1/applications/:applicationId/withdraw", requireAuth, async (req, res): Promise<void> => {
  const applicationId = Array.isArray(req.params.applicationId) ? req.params.applicationId[0] : req.params.applicationId;
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, applicationId));
  if (!app) { res.status(404).json({ error: "Application not found" }); return; }
  if (app.seekerId !== req.userId) { res.status(403).json({ error: "Not your application" }); return; }

  const [updated] = await db.update(applicationsTable).set({ status: "withdrawn" })
    .where(eq(applicationsTable.id, applicationId)).returning();
  res.json(await serializeApplication(updated));
});

export default router;
