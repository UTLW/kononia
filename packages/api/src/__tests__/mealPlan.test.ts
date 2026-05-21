import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("drizzle-orm");

vi.mock("@kononia/db", () => {
  const m = {
    query: {
      meals: { findMany: vi.fn(), findFirst: vi.fn() },
      seasons: { findMany: vi.fn(), findFirst: vi.fn() },
      fastDays: { findMany: vi.fn(), findFirst: vi.fn() },
      mealPlans: { findMany: vi.fn(), findFirst: vi.fn() },
      snacks: { findMany: vi.fn(), findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn(),
    values: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    set: vi.fn(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn(),
    onConflictDoUpdate: vi.fn(),
  };
  return {
    mealPlans: {
      id: "mealPlans.id", userId: "mealPlans.userId", date: "mealPlans.date",
      mealId: "mealPlans.mealId", mealType: "mealPlans.mealType",
      createdAt: "mealPlans.createdAt",
    },
    user: { id: "user.id" },
    meals: { id: "meals.id" },
    seasons: { id: "seasons.id" },
    fastDays: { id: "fastDays.id" },
    mealIngredients: { id: "mealIngredients.id" },
    mealTags: { id: "mealTags.id" },
    snacks: { id: "snacks.id" },
    schema: {},
    db: m,
    createDb: () => m,
  };
});

vi.mock("@kononia/env/server", () => ({
  env: {
    DATABASE_URL: ":memory:",
    DATABASE_AUTH_TOKEN: "",
    BETTER_AUTH_SECRET: "test-secret-32-chars-long-minimum!!",
    BETTER_AUTH_URL: "http://localhost:3000",
    POLAR_ACCESS_TOKEN: "test-polar-token",
    POLAR_SUCCESS_URL: "http://localhost:3000/settings",
    POLAR_WEBHOOK_SECRET: "test-webhook-secret",
    CORS_ORIGIN: "http://localhost:3000",
    NODE_ENV: "test",
  },
}));

vi.mock("@kononia/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

import { db as _db } from "@kononia/db";
import { t } from "../index";
import { appRouter } from "../routers";
const createCallerFactory = t.createCallerFactory;

type Context = {
  auth: null;
  session: {
    user: { id: string; email: string; name: string; emailVerified: boolean; createdAt: Date; updatedAt: Date; image: string | null; plan: string };
    session: { id: string; userId: string; expiresAt: Date; token: string; createdAt: Date; updatedAt: Date; ipAddress: string | null; userAgent: string | null };
  } | null;
  db: typeof _db;
};

function makeCtx(session?: Context["session"]): Context {
  return {
    auth: null,
    session: session ?? {
      user: { id: "test-user-1", email: "test@example.com", name: "Test User", emailVerified: true, createdAt: new Date(), updatedAt: new Date(), image: null, plan: "free" },
      session: { id: "test-session-1", userId: "test-user-1", expiresAt: new Date(Date.now() + 86400000), token: "test-token", createdAt: new Date(), updatedAt: new Date(), ipAddress: null, userAgent: null },
    },
    db: _db,
  };
}

const createCaller = createCallerFactory(appRouter);

describe("mealPlanRouter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("create", () => {
    it("creates a meal plan entry", async () => {
      _db.insert = vi.fn().mockReturnThis();
      _db.values = vi.fn().mockReturnThis();
      _db.onConflictDoNothing = vi.fn().mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.mealPlan.create({ date: "2026-03-15", mealId: "meal-1", mealType: "lunch" });

      expect(result).toEqual({ success: true, id: "test-user-1-2026-03-15-meal-1-lunch" });
    });

    it("creates with different meal types", async () => {
      _db.insert = vi.fn().mockReturnThis();
      _db.values = vi.fn().mockReturnThis();
      _db.onConflictDoNothing = vi.fn().mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.mealPlan.create({ date: "2026-03-15", mealId: "meal-2", mealType: "dinner" });

      expect(result).toEqual({ success: true, id: "test-user-1-2026-03-15-meal-2-dinner" });
      expect(_db.values).toHaveBeenCalledWith(expect.objectContaining({ mealType: "dinner" }));
    });
  });

  describe("delete", () => {
    it("deletes a meal plan entry", async () => {
      _db.delete = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.mealPlan.delete({ id: "test-user-1-2026-03-15-meal-1-lunch" });

      expect(result).toEqual({ success: true });
    });
  });

  describe("update", () => {
    it("updates meal type", async () => {
      _db.update = vi.fn().mockReturnThis();
      _db.set = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.mealPlan.update({ id: "plan-id", mealType: "breakfast" });

      expect(result).toEqual({ success: true });
      expect(_db.set).toHaveBeenCalledWith({ mealType: "breakfast" });
    });
  });

  describe("getByDate", () => {
    it("returns meal plans for a date", async () => {
      const plans = [
        { id: "plan-1", userId: "test-user-1", date: "2026-03-15", mealId: "meal-1", mealType: "lunch", meal: { id: "meal-1", name: "Koshari" } },
      ];
      (_db.query.mealPlans.findMany as any).mockResolvedValue(plans);

      const caller = createCaller(makeCtx());
      const result = await caller.mealPlan.getByDate({ date: "2026-03-15" });

      expect(result).toEqual(plans);
    });

    it("returns empty array when no plans", async () => {
      (_db.query.mealPlans.findMany as any).mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      const result = await caller.mealPlan.getByDate({ date: "2026-03-15" });

      expect(result).toEqual([]);
    });
  });

  describe("getByDateRange", () => {
    it("returns meal plans in a date range", async () => {
      const plans = [
        { id: "plan-1", userId: "test-user-1", date: "2026-03-15", mealId: "meal-1", mealType: "lunch", meal: { id: "meal-1", name: "Koshari" } },
        { id: "plan-2", userId: "test-user-1", date: "2026-03-16", mealId: "meal-2", mealType: "dinner", meal: { id: "meal-2", name: "Ful" } },
      ];
      (_db.query.mealPlans.findMany as any).mockResolvedValue(plans);

      const caller = createCaller(makeCtx());
      const result = await caller.mealPlan.getByDateRange({ startDate: "2026-03-01", endDate: "2026-03-31" });

      expect(result).toEqual(plans);
      expect(result).toHaveLength(2);
    });

    it("returns empty array for empty range", async () => {
      (_db.query.mealPlans.findMany as any).mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      const result = await caller.mealPlan.getByDateRange({ startDate: "2025-01-01", endDate: "2025-01-01" });

      expect(result).toEqual([]);
    });
  });
});
