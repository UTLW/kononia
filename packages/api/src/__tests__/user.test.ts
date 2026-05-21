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
    user: {
      id: "user.id", name: "user.name", email: "user.email", plan: "user.plan",
      pantry: "user.pantry", timezone: "user.timezone", subscribedAt: "user.subscribedAt",
      emailVerified: "user.emailVerified", createdAt: "user.createdAt",
      updatedAt: "user.updatedAt", image: "user.image",
    },
    seasons: {
      id: "seasons.id", name: "seasons.name", description: "seasons.description",
      startDate: "seasons.startDate", endDate: "seasons.endDate",
      fastingType: "seasons.fastingType", year: "seasons.year",
      strictRules: "seasons.strictRules", regularRules: "seasons.regularRules",
      copticMonth: "seasons.copticMonth", copticStartDay: "seasons.copticStartDay",
    },
    fastDays: {
      id: "fastDays.id", date: "fastDays.date", fastingType: "fastDays.fastingType",
      seasonId: "fastDays.seasonId", isToday: "fastDays.isToday", fastNotes: "fastDays.fastNotes",
    },
    mealPlans: { id: "mealPlans.id" },
    meals: { id: "meals.id" },
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

describe("userRouter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("getProfile", () => {
    it("returns user profile for authenticated user", async () => {
      const mockUser = { id: "test-user-1", name: "Test User", email: "test@example.com", plan: "free" };
      _db.select = vi.fn().mockReturnThis();
      _db.from = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockReturnThis();
      _db.limit = vi.fn().mockResolvedValue([mockUser]);

      const caller = createCaller(makeCtx());
      const result = await caller.user.getProfile();

      expect(result).toEqual(mockUser);
    });

    it("returns null when user not found", async () => {
      _db.select = vi.fn().mockReturnThis();
      _db.from = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockReturnThis();
      _db.limit = vi.fn().mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      const result = await caller.user.getProfile();

      expect(result).toBeNull();
    });
  });

  describe("updatePlan", () => {
    it("updates user plan to annual", async () => {
      _db.update = vi.fn().mockReturnThis();
      _db.set = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.user.updatePlan({ plan: "annual" });

      expect(result).toEqual({ success: true });
    });

    it("updates user plan to free", async () => {
      _db.update = vi.fn().mockReturnThis();
      _db.set = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.user.updatePlan({ plan: "free" });

      expect(result).toEqual({ success: true });
    });
  });

  describe("updateTimezone", () => {
    it("updates user timezone", async () => {
      _db.update = vi.fn().mockReturnThis();
      _db.set = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.user.updateTimezone({ timezone: "America/New_York" });

      expect(result).toEqual({ success: true });
    });
  });

  describe("updatePantry", () => {
    it("updates pantry ingredients", async () => {
      _db.update = vi.fn().mockReturnThis();
      _db.set = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.user.updatePantry({ ingredients: ["lentils", "rice", "onions"] });

      expect(result).toEqual({ success: true });
    });
  });

  describe("getPantry", () => {
    it("returns empty array when pantry is null", async () => {
      _db.select = vi.fn().mockReturnThis();
      _db.from = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockReturnThis();
      _db.limit = vi.fn().mockResolvedValue([{ pantry: null }]);

      const caller = createCaller(makeCtx());
      const result = await caller.user.getPantry();

      expect(result).toEqual([]);
    });

    it("parses JSON pantry string", async () => {
      _db.select = vi.fn().mockReturnThis();
      _db.from = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockReturnThis();
      _db.limit = vi.fn().mockResolvedValue([{ pantry: '["lentils","rice"]' }]);

      const caller = createCaller(makeCtx());
      const result = await caller.user.getPantry();

      expect(result).toEqual(["lentils", "rice"]);
    });

    it("returns empty array for invalid JSON", async () => {
      _db.select = vi.fn().mockReturnThis();
      _db.from = vi.fn().mockReturnThis();
      _db.where = vi.fn().mockReturnThis();
      _db.limit = vi.fn().mockResolvedValue([{ pantry: "not-json" }]);

      const caller = createCaller(makeCtx());
      const result = await caller.user.getPantry();

      expect(result).toEqual([]);
    });
  });
});
