import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { seasons } from "./seasons";

export const fastDays = sqliteTable("fast_days", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(),
  seasonId: text("season_id").references(() => seasons.id),
  fastingType: text("fasting_type").notNull(),
  isToday: integer("is_today", { mode: "boolean" }).default(false),
  fastNotes: text("fast_notes"),
}, (table) => ({
  dateIdx: index("fast_days_date_idx").on(table.date),
}));

export const fastDayRelations = relations(fastDays, ({ one }) => ({
  season: one(seasons, {
    fields: [fastDays.seasonId],
    references: [seasons.id],
  }),
}));

export type FastDay = typeof fastDays.$inferSelect;
export type NewFastDay = typeof fastDays.$inferInsert;