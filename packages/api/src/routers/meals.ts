import { z } from "zod";
import { publicProcedure, router } from "../index";
import { meals, mealIngredients, mealTags, snacks } from "@kononia/db";
import { eq, and, or, like, asc, sql, inArray } from "drizzle-orm";

const INSTRUCTION_WORDS = /\b(for the|in a|to taste|optional|as needed|divided|such as|like|or until|until|enough)\b/i;

function cleanIngredient(raw: string): string[] {
  return raw
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !INSTRUCTION_WORDS.test(s));
}

export const mealsRouter = router({
  list: publicProcedure
    .input(z.object({
      cuisine: z.string().optional(),
      fastingType: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      
      if (input.search && input.search.length >= 2) {
        conditions.push(or(
          like(meals.name, `%${input.search}%`),
          like(meals.description, `%${input.search}%`)
        ));
      }
      if (input.cuisine) {
        conditions.push(eq(meals.cuisine, input.cuisine));
      }
      if (input.fastingType) {
        if (input.fastingType === "both") {
          // No filter - include all
        } else {
          conditions.push(eq(meals.fastingType, input.fastingType));
        }
      }

      const result = await ctx.db.query.meals.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit: input.limit + 1,
        orderBy: [asc(meals.name)],
      });

      let nextCursor: string | undefined;
      if (result.length > input.limit) {
        const nextItem = result.pop();
        nextCursor = nextItem?.id;
      }

      return {
        meals: result,
        nextCursor,
      };
    }),

  getByFastingType: publicProcedure
    .input(z.object({
      fastingType: z.string(),
      limit: z.number().default(6),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.meals.findMany({
        where: input.fastingType === "both" 
          ? undefined 
          : eq(meals.fastingType, input.fastingType),
        limit: input.limit,
        orderBy: [sql`RANDOM()`],
      });
    }),

  getWithIngredients: publicProcedure
    .input(z.object({
      ingredients: z.array(z.string()).min(1),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const words = input.ingredients.flatMap(ing =>
        ing.toLowerCase().trim().split(/[\s,]+/).filter(Boolean)
      );

      if (words.length === 0) {
        return { meals: [], matchCount: 0 };
      }

      const allMealIngredients = await ctx.db
        .select({ mealId: mealIngredients.mealId, ingredient: mealIngredients.ingredient })
        .from(mealIngredients);

      const matchingMealIds = new Set<string>();
      for (const mi of allMealIngredients) {
        const cleaned = cleanIngredient(mi.ingredient);
        for (const c of cleaned) {
          const lower = c.toLowerCase();
          if (words.some(w => lower.includes(w))) {
            matchingMealIds.add(mi.mealId);
          }
        }
      }

      if (matchingMealIds.size === 0) {
        return { meals: [], matchCount: 0 };
      }

      const mealIds = [...matchingMealIds];

      const result = await ctx.db.query.meals.findMany({
        where: inArray(meals.id, mealIds),
        limit: input.limit,
      });

      const mealsWithMatchCount = result.map(meal => ({
        ...meal,
        matchCount: mealIds.filter(id => id === meal.id).length,
      }));

      return {
        meals: mealsWithMatchCount.sort((a, b) => b.matchCount - a.matchCount),
        matchCount: mealIds.length,
      };
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const meal = await ctx.db.query.meals.findFirst({
        where: eq(meals.id, input.id),
        with: {
          ingredients: {
            orderBy: (ingredients, { asc }) => [asc(ingredients.orderIndex)],
          },
          steps: {
            orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
          },
          tags: true,
        },
      });
      
      if (!meal) return null;

      return {
        ...meal,
        ingredients: meal.ingredients.flatMap(ing =>
          cleanIngredient(ing.ingredient).map(cleaned => ({
            ...ing,
            ingredient: cleaned,
          }))
        ),
      };
    }),

  getSnacks: publicProcedure
    .input(z.object({
      cuisine: z.string().optional(),
      fastingType: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.cuisine) {
        conditions.push(eq(snacks.cuisine, input.cuisine));
      }
      if (input.fastingType) {
        conditions.push(eq(snacks.fastingType, input.fastingType));
      }
      
      return ctx.db.query.snacks.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
      });
    }),

  getAllSnacks: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.snacks.findMany({});
  }),

  getSnackById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const snack = await ctx.db.query.snacks.findFirst({
        where: eq(snacks.id, input.id),
      });
      return snack || null;
    }),
});