import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import { mealPlans, meals } from "@kononia/db";
import { eq, and, gte, lte } from "drizzle-orm";

export const mealPlanRouter = router({
  create: protectedProcedure
    .input(z.object({
      date: z.string(),
      mealId: z.string(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = `${ctx.session.user.id}-${input.date}-${input.mealId}-${input.mealType}`;
      
      await ctx.db.insert(mealPlans).values({
        id,
        userId: ctx.session.user.id,
        date: input.date,
        mealId: input.mealId,
        mealType: input.mealType,
      }).onConflictDoNothing();

      return { success: true, id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(mealPlans).where(
        and(
          eq(mealPlans.id, input.id),
          eq(mealPlans.userId, ctx.session.user.id)
        )
      );

      return { success: true };
    }),

  getByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const plans = await ctx.db.query.mealPlans.findMany({
        where: and(
          eq(mealPlans.userId, ctx.session.user.id),
          eq(mealPlans.date, input.date)
        ),
        with: {
          meal: true,
        },
      });

      return plans;
    }),

  getByDateRange: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const plans = await ctx.db.query.mealPlans.findMany({
        where: and(
          eq(mealPlans.userId, ctx.session.user.id),
          gte(mealPlans.date, input.startDate),
          lte(mealPlans.date, input.endDate)
        ),
        with: {
          meal: true,
        },
        orderBy: [mealPlans.date, mealPlans.mealType],
      });

      return plans;
    }),
});