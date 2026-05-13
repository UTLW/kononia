import { z } from "zod";
import { publicProcedure, router } from "../index";
import { meals, mealIngredients, mealSteps, mealTags, snacks } from "@kononia/db/schema";
import { eq, like, and, desc } from "drizzle-orm";

export const mealsRouter = router({
  list: publicProcedure
    .input(z.object({
      cuisine: z.string().optional(),
      fastingType: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.cuisine) {
        conditions.push(eq(meals.cuisine, input.cuisine));
      }
      if (input.fastingType) {
        conditions.push(eq(meals.fastingType, input.fastingType));
      }
      
      return ctx.db.query.meals.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(meals.name)],
      });
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