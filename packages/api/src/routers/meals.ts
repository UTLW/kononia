import { z } from "zod";
import { publicProcedure, router } from "../index";
import { meals, mealIngredients, mealSteps, mealTags, snacks } from "@kononia/db";
import { eq, like, and, desc, asc, sql, inArray, or } from "drizzle-orm";

export const mealsRouter = router({
  list: publicProcedure
    .input(z.object({
      cuisine: z.string().optional(),
      fastingType: z.string().optional(),
      sortBy: z.enum(["name", "prepTime", "cookTime"]).default("name"),
      sortOrder: z.enum(["asc", "desc"]).default("asc"),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      
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

      const orderByClause = input.sortOrder === "desc" 
        ? [desc(meals.name)]
        : [asc(meals.name)];

      const result = await ctx.db.query.meals.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit: input.limit + 1,
        orderBy: orderByClause,
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
      const ingredientConditions = input.ingredients.map(ing => 
        like(mealIngredients.ingredient, `%${ing}%`)
      );
      
      const orCondition = or(...ingredientConditions);
      
      const matchingMeals = await ctx.db
        .selectDistinct({ mealId: mealIngredients.mealId })
        .from(mealIngredients)
        .where(orCondition);

      if (matchingMeals.length === 0) {
        return { meals: [], matchCount: 0 };
      }

      const mealIds = matchingMeals.map(m => m.mealId);
      
      const result = await ctx.db.query.meals.findMany({
        where: inArray(meals.id, mealIds),
        limit: input.limit,
      });

      const mealsWithMatchCount = await Promise.all(
        result.map(async (meal) => {
          const ingCount = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(mealIngredients)
            .where(and(
              eq(mealIngredients.mealId, meal.id),
              orCondition
            ));
          return { ...meal, matchCount: ingCount[0]?.count || 0 };
        })
      );

      return {
        meals: mealsWithMatchCount.sort((a, b) => b.matchCount - a.matchCount),
        matchCount: matchingMeals.length,
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
      
      return meal || null;
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

  getSnack: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const snack = await ctx.db.query.snacks.findFirst({
        where: eq(snacks.id, input.id),
      });
      
      return snack || null;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.meals.findMany({
        where: like(meals.name, `%${input.query}%`),
        limit: 20,
      });
    }),

  getCuisines: publicProcedure.query(async () => {
    return [
      "egyptian",
      "italian",
      "mexican",
      "lebanese",
      "american",
      "turkish",
      "chinese",
      "japanese",
      "greek",
      "middle-eastern",
      "spanish",
    ];
  }),
});