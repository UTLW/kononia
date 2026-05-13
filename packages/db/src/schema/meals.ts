import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const meals = sqliteTable("meals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  fastingType: text("fasting_type").notNull(),
  description: text("description"),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings").default(4),
  imageUrl: text("image_url"),
  cuisineTag: text("cuisine_tag"),
});

export const mealRelations = relations(meals, ({ many }) => ({
  ingredients: many(mealIngredients),
  steps: many(mealSteps),
  tags: many(mealTags),
}));

export const mealIngredients = sqliteTable("meal_ingredients", {
  id: text("id").primaryKey(),
  mealId: text("meal_id")
    .notNull()
    .references(() => meals.id, { onDelete: "cascade" }),
  ingredient: text("ingredient").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const mealIngredientRelations = relations(mealIngredients, ({ one }) => ({
  meal: one(meals, {
    fields: [mealIngredients.mealId],
    references: [meals.id],
  }),
}));

export const mealSteps = sqliteTable("meal_steps", {
  id: text("id").primaryKey(),
  mealId: text("meal_id")
    .notNull()
    .references(() => meals.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  instruction: text("instruction").notNull(),
});

export const mealStepRelations = relations(mealSteps, ({ one }) => ({
  meal: one(meals, {
    fields: [mealSteps.mealId],
    references: [meals.id],
  }),
}));

export const mealTags = sqliteTable("meal_tags", {
  id: text("id").primaryKey(),
  mealId: text("meal_id")
    .notNull()
    .references(() => meals.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
});

export const mealTagRelations = relations(mealTags, ({ one }) => ({
  meal: one(meals, {
    fields: [mealTags.mealId],
    references: [meals.id],
  }),
}));

export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;