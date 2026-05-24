import { pgTable, text, varchar, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { applicationsTable } from "./applications";

export const chatRoomsTable = pgTable("chat_rooms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicationId: text("application_id").unique().references(() => applicationsTable.id),
  seekerId: text("seeker_id").notNull().references(() => usersTable.id),
  providerId: text("provider_id").notNull().references(() => usersTable.id),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  roomId: text("room_id").notNull().references(() => chatRoomsTable.id),
  senderId: text("sender_id").notNull().references(() => usersTable.id),
  messageType: varchar("message_type", { length: 20 }).default("text").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({ id: true, createdAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatRoom = typeof chatRoomsTable.$inferSelect;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
