import { pgTable, text, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { jobsTable } from "./jobs";

export const applicationsTable = pgTable("applications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id").notNull().references(() => jobsTable.id),
  seekerId: text("seeker_id").notNull().references(() => usersTable.id),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  employerNote: text("employer_note"),
  appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (t) => [unique().on(t.jobId, t.seekerId)]);

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, appliedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
