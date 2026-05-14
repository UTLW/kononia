import { protectedProcedure, publicProcedure, router } from "../index";
import { calendarRouter } from "./calendar";
import { mealsRouter } from "./meals";
import { seasonsRouter } from "./seasons";
import { userRouter } from "./user";
import { mealPlanRouter } from "./mealPlan";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  calendar: calendarRouter,
  meals: mealsRouter,
  seasons: seasonsRouter,
  user: userRouter,
  mealPlan: mealPlanRouter,
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});
export type AppRouter = typeof appRouter;
