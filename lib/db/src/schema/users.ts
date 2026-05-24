import { pgTable, text, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  phone: varchar("phone", { length: 15 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 100 }),
  profilePhotoUrl: text("profile_photo_url"),
  city: varchar("city", { length: 100 }),
  latitude: decimal("latitude", { precision: 9, scale: 6 }),
  longitude: decimal("longitude", { precision: 9, scale: 6 }),
  isPhoneVerified: boolean("is_phone_verified").default(false).notNull(),
  isIdVerified: boolean("is_id_verified").default(false).notNull(),
  trustScore: decimal("trust_score", { precision: 3, scale: 2 }).default("0.00").notNull(),
  currentRole: varchar("current_role", { length: 20 }).default("seeker").notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow().notNull(),
});

export const seekerProfilesTable = pgTable("seeker_profiles", {
  userId: text("user_id").primaryKey().references(() => usersTable.id, { onDelete: "cascade" }),
  bio: text("bio"),
  availability: varchar("availability", { length: 30 }).default("immediate").notNull(),
  preferredWorkType: varchar("preferred_work_type", { length: 20 }).default("any").notNull(),
  salaryExpectation: decimal("salary_expectation"),
  yearsExperience: decimal("years_experience").default("0").notNull(),
  totalJobsCompleted: decimal("total_jobs_completed").default("0").notNull(),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  totalRatings: decimal("total_ratings").default("0").notNull(),
  attendanceScore: decimal("attendance_score", { precision: 3, scale: 2 }).default("5.00").notNull(),
  cancellationCount: decimal("cancellation_count").default("0").notNull(),
  noShowCount: decimal("no_show_count").default("0").notNull(),
  skills: text("skills").array().default([]).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const providerProfilesTable = pgTable("provider_profiles", {
  userId: text("user_id").primaryKey().references(() => usersTable.id, { onDelete: "cascade" }),
  businessName: varchar("business_name", { length: 200 }),
  businessType: varchar("business_type", { length: 50 }),
  totalJobsPosted: decimal("total_jobs_posted").default("0").notNull(),
  totalHires: decimal("total_hires").default("0").notNull(),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  totalRatings: decimal("total_ratings").default("0").notNull(),
  avgResponseHours: decimal("avg_response_hours", { precision: 5, scale: 2 }),
  hiringSuccessRate: decimal("hiring_success_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  paymentDisputeCount: decimal("payment_dispute_count").default("0").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true, lastActiveAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type SeekerProfile = typeof seekerProfilesTable.$inferSelect;
export type ProviderProfile = typeof providerProfilesTable.$inferSelect;
