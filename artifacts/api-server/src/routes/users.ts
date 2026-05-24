import { Router } from "express";
import { db, usersTable, seekerProfilesTable, providerProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { serializeUser } from "../lib/userSerializer";

const router: Router = Router();

router.get("/v1/users/me", requireAuth, async (req, res): Promise<void> => {
  const userData = await serializeUser(req.userId!);
  if (!userData) { res.status(404).json({ error: "User not found" }); return; }
  res.json(userData);
});

router.patch("/v1/users/me", requireAuth, async (req, res): Promise<void> => {
  const { name, city, profile_photo_url, bio, availability, preferred_work_type, salary_expectation, years_experience, skills, business_name, business_type } = req.body;
  const userId = req.userId!;

  await db.update(usersTable).set({
    ...(name !== undefined && { name }),
    ...(city !== undefined && { city }),
    ...(profile_photo_url !== undefined && { profilePhotoUrl: profile_photo_url }),
    updatedAt: new Date(),
  }).where(eq(usersTable.id, userId));

  const currentRole = req.userRole;
  if (currentRole === "seeker") {
    await db.insert(seekerProfilesTable).values({ userId }).onConflictDoNothing();
    await db.update(seekerProfilesTable).set({
      ...(bio !== undefined && { bio }),
      ...(availability !== undefined && { availability }),
      ...(preferred_work_type !== undefined && { preferredWorkType: preferred_work_type }),
      ...(salary_expectation !== undefined && { salaryExpectation: String(salary_expectation) }),
      ...(years_experience !== undefined && { yearsExperience: String(years_experience) }),
      ...(skills !== undefined && { skills }),
      updatedAt: new Date(),
    }).where(eq(seekerProfilesTable.userId, userId));
  } else {
    await db.insert(providerProfilesTable).values({ userId }).onConflictDoNothing();
    await db.update(providerProfilesTable).set({
      ...(business_name !== undefined && { businessName: business_name }),
      ...(business_type !== undefined && { businessType: business_type }),
      updatedAt: new Date(),
    }).where(eq(providerProfilesTable.userId, userId));
  }

  const userData = await serializeUser(userId);
  res.json(userData);
});

router.put("/v1/users/me/role", requireAuth, async (req, res): Promise<void> => {
  const { role } = req.body;
  if (!["seeker", "provider"].includes(role)) {
    res.status(400).json({ error: "role must be seeker or provider" });
    return;
  }
  const userId = req.userId!;
  await db.update(usersTable).set({ currentRole: role, updatedAt: new Date() }).where(eq(usersTable.id, userId));

  if (role === "seeker") {
    await db.insert(seekerProfilesTable).values({ userId }).onConflictDoNothing();
  } else {
    await db.insert(providerProfilesTable).values({ userId }).onConflictDoNothing();
  }

  const userData = await serializeUser(userId);
  res.json(userData);
});

router.get("/v1/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userData = await serializeUser(userId);
  if (!userData) { res.status(404).json({ error: "User not found" }); return; }
  res.json(userData);
});

export default router;
