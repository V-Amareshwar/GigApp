import { Router } from "express";
import { db, jobsTable, categoriesTable, usersTable, seekerProfilesTable, providerProfilesTable, applicationsTable } from "@workspace/db";
import { eq, and, desc, ilike, or, inArray } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { serializeUser } from "../lib/userSerializer";

const router: Router = Router();

function serializeJob(job: any, category: any, provider: any, hasApplied?: boolean) {
  return {
    id: job.id,
    provider_id: job.providerId,
    title: job.title,
    description: job.description,
    category_id: job.categoryId,
    category: category ? { id: category.id, name: category.name, name_hi: category.nameHi, icon_name: category.iconName, sort_order: category.sortOrder } : null,
    work_type: job.workType,
    hourly_rate: job.hourlyRate,
    total_hours: job.totalHours,
    shift_start_time: job.shiftStartTime,
    shift_end_time: job.shiftEndTime,
    same_day_payment: job.sameDayPayment,
    urgent_hiring: job.urgentHiring,
    daily_wage: job.dailyWage,
    num_working_days: job.numWorkingDays,
    food_included: job.foodIncluded,
    accommodation_included: job.accommodationIncluded,
    overtime_available: job.overtimeAvailable,
    monthly_salary: job.monthlySalary,
    joining_date: job.joiningDate,
    experience_required: job.experienceRequired,
    working_days_per_week: job.workingDaysPerWeek,
    pf_esi_included: job.pfEsiIncluded,
    salary_negotiable: job.salaryNegotiable,
    city: job.city,
    address: job.address,
    latitude: job.latitude ? parseFloat(job.latitude) : null,
    longitude: job.longitude ? parseFloat(job.longitude) : null,
    status: job.status,
    is_urgent: job.isUrgent,
    is_verified: job.isVerified,
    views_count: job.viewsCount,
    applications_count: job.applicationsCount,
    skills_required: job.skillsRequired ?? [],
    provider,
    expires_at: job.expiresAt?.toISOString() ?? null,
    created_at: job.createdAt.toISOString(),
    has_applied: hasApplied ?? null,
  };
}

router.get("/v1/jobs", requireAuth, async (req, res): Promise<void> => {
  const { city, category_id, work_type, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 20, 50);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [eq(jobsTable.status, "active")];
  if (city) conditions.push(ilike(jobsTable.city, `%${city}%`));
  if (category_id) conditions.push(eq(jobsTable.categoryId, parseInt(category_id)));
  if (work_type && ["hourly", "daily", "monthly"].includes(work_type)) {
    conditions.push(eq(jobsTable.workType, work_type));
  }

  const jobs = await db.select().from(jobsTable)
    .where(and(...conditions))
    .orderBy(desc(jobsTable.isUrgent), desc(jobsTable.createdAt))
    .limit(limitNum).offset(offset);

  const results = await Promise.all(jobs.map(async (job) => {
    const [cat] = job.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, job.categoryId)) : [null];
    const provider = await serializeUser(job.providerId);
    const [app] = await db.select({ id: applicationsTable.id })
      .from(applicationsTable)
      .where(and(eq(applicationsTable.jobId, job.id), eq(applicationsTable.seekerId, req.userId!)));
    return serializeJob(job, cat, provider, !!app);
  }));

  const totalResult = await db.select({ id: jobsTable.id }).from(jobsTable).where(and(...conditions));
  res.json({ jobs: results, total: totalResult.length, page: pageNum, limit: limitNum, has_more: offset + limitNum < totalResult.length });
});

router.get("/v1/jobs/search", requireAuth, async (req, res): Promise<void> => {
  const { q, city, page = "1" } = req.query as Record<string, string>;
  if (!q) { res.status(400).json({ error: "q is required" }); return; }
  const pageNum = parseInt(page) || 1;
  const limitNum = 20;
  const offset = (pageNum - 1) * limitNum;

  const conditions = [eq(jobsTable.status, "active"), or(ilike(jobsTable.title, `%${q}%`), ilike(jobsTable.description ?? "", `%${q}%`))!];
  if (city) conditions.push(ilike(jobsTable.city, `%${city}%`));

  const jobs = await db.select().from(jobsTable).where(and(...conditions)).orderBy(desc(jobsTable.createdAt)).limit(limitNum).offset(offset);
  const total = await db.select({ id: jobsTable.id }).from(jobsTable).where(and(...conditions));

  const results = await Promise.all(jobs.map(async (job) => {
    const [cat] = job.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, job.categoryId)) : [null];
    const provider = await serializeUser(job.providerId);
    return serializeJob(job, cat, provider);
  }));

  res.json({ jobs: results, total: total.length, page: pageNum, limit: limitNum, has_more: offset + limitNum < total.length });
});

router.get("/v1/jobs/my", requireAuth, async (req, res): Promise<void> => {
  const { status } = req.query as Record<string, string>;
  const conditions = [eq(jobsTable.providerId, req.userId!)];
  if (status && ["draft","active","paused","filled","expired","removed"].includes(status)) {
    conditions.push(eq(jobsTable.status, status));
  }

  const jobs = await db.select().from(jobsTable).where(and(...conditions)).orderBy(desc(jobsTable.createdAt));
  const results = await Promise.all(jobs.map(async (job) => {
    const [cat] = job.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, job.categoryId)) : [null];
    const provider = await serializeUser(job.providerId);
    return serializeJob(job, cat, provider);
  }));
  res.json(results);
});

router.get("/v1/jobs/:jobId", requireAuth, async (req, res): Promise<void> => {
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }

  await db.update(jobsTable).set({ viewsCount: (job.viewsCount ?? 0) + 1 }).where(eq(jobsTable.id, jobId));

  const [cat] = job.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, job.categoryId)) : [null];
  const provider = await serializeUser(job.providerId);
  const [app] = await db.select({ id: applicationsTable.id })
    .from(applicationsTable)
    .where(and(eq(applicationsTable.jobId, jobId), eq(applicationsTable.seekerId, req.userId!)));

  res.json(serializeJob(job, cat, provider, !!app));
});

router.post("/v1/jobs", requireAuth, async (req, res): Promise<void> => {
  if (req.userRole !== "provider") {
    res.status(403).json({ error: "Provider role required" });
    return;
  }
  const { title, work_type, city } = req.body;
  if (!title || !work_type || !city) {
    res.status(400).json({ error: "title, work_type, and city are required" });
    return;
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [job] = await db.insert(jobsTable).values({
    providerId: req.userId!,
    title,
    workType: work_type,
    city,
    categoryId: req.body.category_id ?? null,
    description: req.body.description ?? null,
    address: req.body.address ?? null,
    latitude: req.body.latitude ? String(req.body.latitude) : null,
    longitude: req.body.longitude ? String(req.body.longitude) : null,
    hourlyRate: req.body.hourly_rate ?? null,
    totalHours: req.body.total_hours ?? null,
    shiftStartTime: req.body.shift_start_time ?? null,
    shiftEndTime: req.body.shift_end_time ?? null,
    sameDayPayment: req.body.same_day_payment ?? false,
    urgentHiring: req.body.urgent_hiring ?? false,
    dailyWage: req.body.daily_wage ?? null,
    numWorkingDays: req.body.num_working_days ?? null,
    foodIncluded: req.body.food_included ?? false,
    accommodationIncluded: req.body.accommodation_included ?? false,
    overtimeAvailable: req.body.overtime_available ?? false,
    monthlySalary: req.body.monthly_salary ?? null,
    joiningDate: req.body.joining_date ?? null,
    experienceRequired: req.body.experience_required ?? 0,
    workingDaysPerWeek: req.body.working_days_per_week ?? null,
    pfEsiIncluded: req.body.pf_esi_included ?? false,
    salaryNegotiable: req.body.salary_negotiable ?? false,
    isUrgent: req.body.is_urgent ?? false,
    skillsRequired: req.body.skills_required ?? [],
    expiresAt,
  }).returning();

  // Increment total_jobs_posted
  const [pProf] = await db.select().from(providerProfilesTable).where(eq(providerProfilesTable.userId, req.userId!));
  if (pProf) {
    await db.update(providerProfilesTable)
      .set({ totalJobsPosted: String(parseInt(pProf.totalJobsPosted ?? "0") + 1) })
      .where(eq(providerProfilesTable.userId, req.userId!));
  }

  const [cat] = job.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, job.categoryId)) : [null];
  const provider = await serializeUser(job.providerId);
  res.status(201).json(serializeJob(job, cat, provider));
});

router.patch("/v1/jobs/:jobId", requireAuth, async (req, res): Promise<void> => {
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  if (job.providerId !== req.userId) { res.status(403).json({ error: "Not your job" }); return; }

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.daily_wage !== undefined) updates.dailyWage = req.body.daily_wage;
  if (req.body.hourly_rate !== undefined) updates.hourlyRate = req.body.hourly_rate;
  if (req.body.monthly_salary !== undefined) updates.monthlySalary = req.body.monthly_salary;
  if (req.body.is_urgent !== undefined) updates.isUrgent = req.body.is_urgent;
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.food_included !== undefined) updates.foodIncluded = req.body.food_included;
  if (req.body.accommodation_included !== undefined) updates.accommodationIncluded = req.body.accommodation_included;

  const [updated] = await db.update(jobsTable).set(updates).where(eq(jobsTable.id, jobId)).returning();
  const [cat] = updated.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, updated.categoryId)) : [null];
  const provider = await serializeUser(updated.providerId);
  res.json(serializeJob(updated, cat, provider));
});

router.delete("/v1/jobs/:jobId", requireAuth, async (req, res): Promise<void> => {
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const [job] = await db.select({ id: jobsTable.id, providerId: jobsTable.providerId }).from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  if (job.providerId !== req.userId) { res.status(403).json({ error: "Not your job" }); return; }
  await db.update(jobsTable).set({ status: "removed", updatedAt: new Date() }).where(eq(jobsTable.id, jobId));
  res.json({ message: "Job removed" });
});

router.post("/v1/jobs/:jobId/report", requireAuth, async (req, res): Promise<void> => {
  res.json({ message: "Report submitted" });
});

export default router;
