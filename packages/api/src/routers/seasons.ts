import { z } from "zod";
import { publicProcedure, router } from "../index";
import { seasons } from "@kononia/db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const seasonsRouter = router({
  getCurrent: publicProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().split("T")[0];
    
    const season = await ctx.db.query.seasons.findFirst({
      where: and(
        gte(seasons.startDate, today),
        lte(seasons.endDate, today)
      ),
      orderBy: [desc(seasons.startDate)],
    });
    
    return season;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.seasons.findFirst({
        where: eq(seasons.id, input.id),
      });
    }),

  list: publicProcedure
    .input(z.object({ year: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const year = input.year || new Date().getFullYear();
      return ctx.db.query.seasons.findMany({
        where: eq(seasons.year, year),
        orderBy: [desc(seasons.startDate)],
      });
    }),
});