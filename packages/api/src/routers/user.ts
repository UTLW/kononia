import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { user } from "@kononia/db/schema/auth";
import { eq } from "drizzle-orm";

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select()
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);
    
    return result[0] || null;
  }),

  updatePlan: protectedProcedure
    .input(z.object({ plan: z.enum(["free", "annual"]) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(user)
        .set({ 
          plan: input.plan,
          subscribedAt: input.plan === "annual" ? new Date() : null,
        })
        .where(eq(user.id, ctx.session.user.id));
      
      return { success: true };
    }),

  updateTimezone: protectedProcedure
    .input(z.object({ timezone: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(user)
        .set({ timezone: input.timezone })
        .where(eq(user.id, ctx.session.user.id));
      
      return { success: true };
    }),
});