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
    seasons: {
      id: "seasons.id", name: "seasons.name", startDate: "seasons.startDate",
      endDate: "seasons.endDate", fastingType: "seasons.fastingType",
      year: "seasons.year", description: "seasons.description",
      strictRules: "seasons.strictRules", regularRules: "seasons.regularRules",
    },
    fastDays: {
      id: "fastDays.id", date: "fastDays.date", fastingType: "fastDays.fastingType",
      fastNotes: "fastDays.fastNotes", seasonId: "fastDays.seasonId", isToday: "fastDays.isToday",
    },
    user: { id: "user.id", name: "user.name", email: "user.email" },
    mealPlans: { id: "mealPlans.id", userId: "mealPlans.userId", date: "mealPlans.date", mealId: "mealPlans.mealId", mealType: "mealPlans.mealType" },
    meals: { id: "meals.id", name: "meals.name" },
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

function makeCtx(overrides?: Partial<Context>): Context {
  return {
    auth: null,
    session: {
      user: { id: "test-user-1", email: "test@example.com", name: "Test User", emailVerified: true, createdAt: new Date(), updatedAt: new Date(), image: null, plan: "free" },
      session: { id: "test-session-1", userId: "test-user-1", expiresAt: new Date(Date.now() + 86400000), token: "test-token", createdAt: new Date(), updatedAt: new Date(), ipAddress: null, userAgent: null },
    },
    db: _db,
    ...overrides,
  };
}

const createCaller = createCallerFactory(appRouter);

describe("calendarRouter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("getSeason", () => {
    it("returns a season when found", async () => {
      const season = { id: "1", name: "Great Lent", startDate: "2026-03-02", endDate: "2026-04-18", fastingType: "strict", year: 2026 };
      (_db.query.seasons.findFirst as any).mockResolvedValue(season);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getSeason({ date: "2026-03-15" });

      expect(result).toEqual(season);
    });

    it("returns null when no season found", async () => {
      (_db.query.seasons.findFirst as any).mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getSeason({ date: "2026-01-01" });

      expect(result).toBeNull();
    });

    it("defaults to today when no date provided", async () => {
      (_db.query.seasons.findFirst as any).mockResolvedValue(null);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getSeason({});

      expect(result).toBeNull();
      expect(_db.query.seasons.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCurrentSeason", () => {
    it("returns the current season", async () => {
      const season = { id: "1", name: "Great Lent", startDate: "2026-03-02", endDate: "2026-04-18", fastingType: "strict", year: 2026 };
      (_db.query.seasons.findFirst as any).mockResolvedValue(season);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getCurrentSeason();

      expect(result).toEqual(season);
    });

    it("returns null when no current season", async () => {
      (_db.query.seasons.findFirst as any).mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getCurrentSeason();

      expect(result).toBeNull();
    });
  });

  describe("listSeasons", () => {
    it("returns all seasons", async () => {
      const seasons = [
        { id: "1", name: "Great Lent", startDate: "2026-03-02", endDate: "2026-04-18", fastingType: "strict", year: 2026 },
        { id: "2", name: "Nativity Fast", startDate: "2025-11-15", endDate: "2025-12-24", fastingType: "strict", year: 2025 },
      ];
      (_db.query.seasons.findMany as any).mockResolvedValue(seasons);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.listSeasons({});

      expect(result).toEqual(seasons);
    });

    it("filters by year when provided", async () => {
      (_db.query.seasons.findMany as any).mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      await caller.calendar.listSeasons({ year: 2026 });

      expect(_db.query.seasons.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("getFastDay", () => {
    it("returns a fast day when found", async () => {
      const fastDay = { id: "2026-03-15", date: "2026-03-15", fastingType: "strict", fastNotes: "Great Lent weekday" };
      (_db.query.fastDays.findFirst as any).mockResolvedValue(fastDay);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getFastDay({ date: "2026-03-15" });

      expect(result).toEqual(fastDay);
    });

    it("returns undefined when no fast day", async () => {
      (_db.query.fastDays.findFirst as any).mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getFastDay({ date: "2026-05-20" });

      expect(result).toBeUndefined();
    });
  });

  describe("getFastDaysInRange", () => {
    it("returns fast days in date range", async () => {
      const days = [
        { id: "2026-03-15", date: "2026-03-15", fastingType: "strict" },
        { id: "2026-03-16", date: "2026-03-16", fastingType: "strict" },
      ];
      (_db.query.fastDays.findMany as any).mockResolvedValue(days);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getFastDaysInRange({ startDate: "2026-03-01", endDate: "2026-03-31" });

      expect(result).toEqual(days);
    });
  });

  describe("getTodayFastDay", () => {
    it("returns today's fast day", async () => {
      const today = new Date().toISOString().split("T")[0];
      const fastDay = { id: today, date: today, fastingType: "strict" };
      (_db.query.fastDays.findFirst as any).mockResolvedValue(fastDay);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getTodayFastDay();

      expect(result).toEqual(fastDay);
    });
  });

  describe("getUpcomingFastDays", () => {
    it("returns upcoming fast days with default 7 day window", async () => {
      (_db.query.fastDays.findMany as any).mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      const result = await caller.calendar.getUpcomingFastDays({});

      expect(result).toEqual([]);
      expect(_db.query.fastDays.findMany).toHaveBeenCalledTimes(1);
    });

    it("respects custom day window", async () => {
      (_db.query.fastDays.findMany as any).mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      await caller.calendar.getUpcomingFastDays({ days: 30 });

      expect(_db.query.fastDays.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
