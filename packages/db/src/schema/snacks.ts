import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const snacks = sqliteTable("snacks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  fastingType: text("fasting_type").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export type Snack = typeof snacks.$inferSelect;
export type NewSnack = typeof snacks.$inferInsert;