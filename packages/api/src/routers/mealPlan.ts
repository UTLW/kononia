import { z } from "zod";
import { publicProcedure, router } from "../index";
import { mealPlans, meals } from "@kononia/db";
import { eq, and, gte, lte } from "drizzle-orm";

export const mealPlanRouter = router({
  create: publicProcedure
    .input(z.object({
      date: z.string(),
      mealId: z.string(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session?.user) {
        throw new Error("Not authenticated");
      }

      const id = `${session.user.id}-${input.date}-${input.mealId}-${input.mealType}`;
      
      await ctx.db.insert(mealPlans).values({
        id,
        userId: session.user.id,
        date: input.date,
        mealId: input.mealId,
        mealType: input.mealType,
      }).onConflictDoNothing();

      return { success: true, id };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session?.user) {
        throw new Error("Not authenticated");
      }

      await ctx.db.delete(mealPlans).where(
        and(
          eq(mealPlans.id, input.id),
          eq(mealPlans.userId, session.user.id)
        )
      );

      return { success: true };
    }),

  getByDate: publicProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session?.user) {
        return [];
      }

      const plans = await ctx.db.query.mealPlans.findMany({
        where: and(
          eq(mealPlans.userId, session.user.id),
          eq(mealPlans.date, input.date)
        ),
        with: {
          meal: true,
        },
      });

      return plans;
    }),

  getByDateRange: publicProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session?.user) {
        return [];
      }

      const plans = await ctx.db.query.mealPlans.findMany({
        where: and(
          eq(mealPlans.userId, session.user.id),
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