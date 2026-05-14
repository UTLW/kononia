import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import { user, seasons, fastDays } from "@kononia/db";
import { eq } from "drizzle-orm";

const COPTC_API_BASE = "https://api.coptic.io/api";

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select()
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);
    
    return result[0] || null;
  }),

  syncCopticData: protectedProcedure.mutation(async ({ ctx }) => {
    const year = new Date().getFullYear();
    
    const fastingRes = await fetch(`${COPTC_API_BASE}/fasting/calendar/${year}`);
    const fastingData = await fastingRes.json();
    const fastingDays = fastingData.days || [];

    const seasonsRes = await fetch(`${COPTC_API_BASE}/season/year/${year}`);
    const seasonsData = await seasonsRes.json();
    const seasonsList = seasonsData.seasons || [];

    for (const day of fastingDays) {
      await ctx.db.insert(fastDays)
        .values({
          id: day.date,
          date: day.date,
          fastingType: day.fastingType,
          fastNotes: day.name || null,
        })
        .onConflictDoUpdate({
          target: fastDays.date,
          set: {
            fastingType: day.fastingType,
            fastNotes: day.name || null,
          },
        });
    }

    for (const season of seasonsList) {
      await ctx.db.insert(seasons)
        .values({
          id: season.id,
          name: season.name,
          description: season.description || season.name,
          startDate: season.startDate,
          endDate: season.endDate,
          fastingType: season.fastingType,
          strictRules: null,
          regularRules: null,
          year,
          copticMonth: season.copticMonth || null,
          copticStartDay: null,
        })
        .onConflictDoUpdate({
          target: seasons.id,
          set: {
            name: season.name,
            description: season.description || season.name,
            startDate: season.startDate,
            endDate: season.endDate,
            fastingType: season.fastingType,
          },
        });
    }

    return { 
      success: true, 
      fastingDaysCount: fastingDays.length,
      seasonsCount: seasonsList.length,
    };
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

  updatePantry: protectedProcedure
    .input(z.object({ ingredients: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(user)
        .set({ pantry: JSON.stringify(input.ingredients) as any })
        .where(eq(user.id, ctx.session.user.id));
      
      return { success: true };
    }),

  getPantry: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select({ pantry: user.pantry })
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);
    
    const pantryValue = result[0]?.pantry;
    if (!pantryValue) return [];
    try {
      const parsed = typeof pantryValue === 'string' ? JSON.parse(pantryValue) : pantryValue;
      return parsed as string[];
    } catch {
      return [];
    }
  }),
});