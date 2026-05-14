import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { meals } from "./meals";

export const mealPlans = sqliteTable("meal_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  date: text("date").notNull(),
  mealId: text("meal_id").notNull().references(() => meals.id),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const mealPlanRelations = relations(mealPlans, ({ one }) => ({
  user: one(user, {
    fields: [mealPlans.userId],
    references: [user.id],
  }),
  meal: one(meals, {
    fields: [mealPlans.mealId],
    references: [meals.id],
  }),
}));

export type MealPlan = typeof mealPlans.$inferSelect;
export type NewMealPlan = typeof mealPlans.$inferInsert;