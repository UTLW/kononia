import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { fastDays } from "./fast_days";

export const seasons = sqliteTable("seasons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  fastingType: text("fasting_type").notNull(),
  strictRules: text("strict_rules"),
  regularRules: text("regular_rules"),
  year: integer("year").notNull(),
  copticMonth: text("coptic_month"),
  copticStartDay: integer("coptic_start_day"),
});

export const seasonRelations = relations(seasons, ({ many }) => ({
  fastDays: many(fastDays),
}));