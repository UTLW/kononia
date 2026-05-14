import { z } from "zod";
import { publicProcedure, router } from "../index";
import { seasons, fastDays } from "@kononia/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export const calendarRouter = router({
  getSeason: publicProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const targetDate = input.date || new Date().toISOString().split("T")[0];
      
      const season = await ctx.db.query.seasons.findFirst({
        where: and(
          gte(seasons.startDate, targetDate),
          lte(seasons.endDate, targetDate)
        ),
      });
      
      return season || null;
    }),

  getCurrentSeason: publicProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().split("T")[0];
    
    const season = await ctx.db.query.seasons.findFirst({
      where: and(
        gte(seasons.startDate, today),
        lte(seasons.endDate, today)
      ),
      orderBy: [desc(seasons.startDate)],
    });
    
    return season || null;
  }),

  listSeasons: publicProcedure
    .input(z.object({ year: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const conditions = input.year 
        ? eq(seasons.year, input.year)
        : undefined;
      
      return ctx.db.query.seasons.findMany({
        where: conditions,
        orderBy: [desc(seasons.startDate)],
      });
    }),

  getFastDay: publicProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.fastDays.findFirst({
        where: eq(fastDays.date, input.date),
      });
    }),

  getFastDaysInRange: publicProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.fastDays.findMany({
        where: and(
          gte(fastDays.date, input.startDate),
          lte(fastDays.date, input.endDate)
        ),
        orderBy: [fastDays.date],
      });
    }),

  getTodayFastDay: publicProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().split("T")[0];
    return ctx.db.query.fastDays.findFirst({
      where: eq(fastDays.date, today),
    });
  }),

  getUpcomingFastDays: publicProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const endDate = new Date(today.getTime() + input.days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      
      return ctx.db.query.fastDays.findMany({
        where: and(
          gte(fastDays.date, startDate),
          lte(fastDays.date, endDate)
        ),
        orderBy: [fastDays.date],
      });
    }),
});