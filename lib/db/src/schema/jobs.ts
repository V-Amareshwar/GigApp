import { pgTable, text, varchar, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const jobsTable = pgTable("jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerId: text("provider_id").notNull().references(() => usersTable.id),
  title: varchar("title", { length: 200 }).notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  description: text("description"),
  workType: varchar("work_type", { length: 20 }).notNull(),

  // Hourly
  hourlyRate: integer("hourly_rate"),
  totalHours: integer("total_hours"),
  shiftStartTime: varchar("shift_start_time", { length: 10 }),
  shiftEndTime: varchar("shift_end_time", { length: 10 }),
  sameDayPayment: boolean("same_day_payment").default(false),
  urgentHiring: boolean("urgent_hiring").default(false),

  // Daily
  dailyWage: integer("daily_wage"),
  numWorkingDays: integer("num_working_days"),
  foodIncluded: boolean("food_included").default(false),
  accommodationIncluded: boolean("accommodation_included").default(false),
  overtimeAvailable: boolean("overtime_available").default(false),

  // Monthly
  monthlySalary: integer("monthly_salary"),
  joiningDate: varchar("joining_date", { length: 20 }),
  experienceRequired: integer("experience_required").default(0),
  workingDaysPerWeek: integer("working_days_per_week"),
  pfEsiIncluded: boolean("pf_esi_included").default(false),
  salaryNegotiable: boolean("salary_negotiable").default(false),

  // Location
  latitude: decimal("latitude", { precision: 9, scale: 6 }),
  longitude: decimal("longitude", { precision: 9, scale: 6 }),
  address: text("address"),
  city: varchar("city", { length: 100 }).notNull(),

  // Status
  status: varchar("status", { length: 20 }).default("active").notNull(),
  isUrgent: boolean("is_urgent").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),

  // Analytics
  scamScore: decimal("scam_score", { precision: 3, scale: 2 }).default("0.00").notNull(),
  flaggedCount: integer("flagged_count").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  applicationsCount: integer("applications_count").default(0).notNull(),

  skillsRequired: text("skills_required").array().default([]).notNull(),

  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
