import { Router } from "express";
import { db, usersTable, seekerProfilesTable, providerProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, signToken, requireAuth } from "../lib/auth";
import { serializeUser } from "../lib/userSerializer";

const router: Router = Router();

router.post("/v1/auth/register", async (req, res): Promise<void> => {
  const { phone, name, password, city, role } = req.body;
  if (!phone || !name || !password || !role) {
    res.status(400).json({ error: "phone, name, password, and role are required" });
    return;
  }
  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.phone, phone));
  if (existing) {
    res.status(400).json({ error: "Phone number already registered" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    phone,
    name,
    passwordHash: hashPassword(password),
    city: city ?? null,
    currentRole: role === "provider" ? "provider" : "seeker",
    isPhoneVerified: true,
  }).returning();

  if (role === "provider") {
    await db.insert(providerProfilesTable).values({ userId: user.id }).onConflictDoNothing();
  } else {
    await db.insert(seekerProfilesTable).values({ userId: user.id }).onConflictDoNothing();
  }

  const token = signToken(user.id);
  const userData = await serializeUser(user.id);
  res.status(201).json({ access_token: token, is_new_user: true, user: userData });
});

router.post("/v1/auth/login", async (req, res): Promise<void> => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    res.status(400).json({ error: "phone and password are required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(400).json({ error: "Invalid phone or password" });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ error: "Account is banned" });
    return;
  }
  const token = signToken(user.id);
  const userData = await serializeUser(user.id);
  res.json({ access_token: token, is_new_user: false, user: userData });
});

router.post("/v1/auth/logout", requireAuth, async (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

export default router;
