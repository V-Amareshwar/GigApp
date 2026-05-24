import { pgTable, serial, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameHi: varchar("name_hi", { length: 100 }),
  iconName: varchar("icon_name", { length: 50 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;
