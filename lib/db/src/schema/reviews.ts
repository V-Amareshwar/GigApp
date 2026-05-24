import { pgTable, text, varchar, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { applicationsTable } from "./applications";

export const reviewsTable = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicationId: text("application_id").references(() => applicationsTable.id),
  reviewerId: text("reviewer_id").notNull().references(() => usersTable.id),
  revieweeId: text("reviewee_id").notNull().references(() => usersTable.id),
  reviewerRole: varchar("reviewer_role", { length: 20 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.applicationId, t.reviewerId)]);

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
