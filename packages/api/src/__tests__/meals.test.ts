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
    meals: {
      id: "meals.id", name: "meals.name", cuisine: "meals.cuisine",
      fastingType: "meals.fastingType", description: "meals.description",
      prepTime: "meals.prepTime", cookTime: "meals.cookTime",
      servings: "meals.servings", imageUrl: "meals.imageUrl", cuisineTag: "meals.cuisineTag",
    },
    mealIngredients: { id: "mealIngredients.id", mealId: "mealIngredients.mealId", ingredient: "mealIngredients.ingredient", orderIndex: "mealIngredients.orderIndex" },
    mealSteps: { id: "mealSteps.id", mealId: "mealSteps.mealId", stepNumber: "mealSteps.stepNumber", instruction: "mealSteps.instruction" },
    mealTags: { id: "mealTags.id", mealId: "mealTags.mealId", tag: "mealTags.tag" },
    snacks: { id: "snacks.id", name: "snacks.name", cuisine: "snacks.cuisine", fastingType: "snacks.fastingType", description: "snacks.description", imageUrl: "snacks.imageUrl" },
    user: { id: "user.id", name: "user.name" },
    seasons: { id: "seasons.id" },
    fastDays: { id: "fastDays.id" },
    mealPlans: { id: "mealPlans.id" },
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

describe("mealsRouter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("list", () => {
    const sampleMeals = [
      { id: "1", name: "Koshari", cuisine: "Egyptian", fastingType: "strict", description: "Lentils, rice, pasta" },
      { id: "2", name: "Ful Medames", cuisine: "Egyptian", fastingType: "strict", description: "Fava bean stew" },
      { id: "3", name: "Shakshuka", cuisine: "Middle Eastern", fastingType: "regular", description: "Eggs in tomato sauce" },
    ];

    it("returns meals with default limit", async () => {
      (_db.query.meals.findMany as any).mockResolvedValue(sampleMeals);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.list({});

      expect(result.meals).toEqual(sampleMeals);
      expect(result.nextCursor).toBeUndefined();
    });

    it("returns cursor when more results exist", async () => {
      const manyMeals = Array.from({ length: 21 }, (_, i) => ({
        id: String(i + 1), name: `Meal ${i + 1}`, cuisine: "Egyptian", fastingType: "strict", description: null,
      }));
      (_db.query.meals.findMany as any).mockResolvedValue(manyMeals);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.list({ limit: 20 });

      expect(result.meals).toHaveLength(20);
      expect(result.nextCursor).toBeDefined();
    });

    it("filters by cuisine", async () => {
      (_db.query.meals.findMany as any).mockResolvedValue(sampleMeals.filter(m => m.cuisine === "Egyptian"));

      const caller = createCaller(makeCtx());
      const result = await caller.meals.list({ cuisine: "Egyptian" });

      expect(result.meals).toHaveLength(2);
      expect(result.meals.every((m: any) => m.cuisine === "Egyptian")).toBe(true);
    });

    it("filters by fastingType", async () => {
      (_db.query.meals.findMany as any).mockResolvedValue(sampleMeals.filter(m => m.fastingType === "strict"));

      const caller = createCaller(makeCtx());
      const result = await caller.meals.list({ fastingType: "strict" });

      expect(result.meals).toHaveLength(2);
    });

    it("passes 'both' fastingType without filter", async () => {
      (_db.query.meals.findMany as any).mockResolvedValue(sampleMeals);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.list({ fastingType: "both" });

      expect(result.meals).toHaveLength(3);
    });

    it("combines search and cuisine filter", async () => {
      (_db.query.meals.findMany as any).mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.list({ cuisine: "Egyptian", search: "koshari" });

      expect(result.meals).toEqual([]);
    });

    it("returns empty array when no meals match", async () => {
      (_db.query.meals.findMany as any).mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.list({ cuisine: "Nonexistent", search: "xyz" });

      expect(result.meals).toEqual([]);
      expect(result.nextCursor).toBeUndefined();
    });
  });

  describe("getByFastingType", () => {
    it("returns meals matching fasting type", async () => {
      const meals = [{ id: "1", name: "Koshari", cuisine: "Egyptian", fastingType: "strict" }];
      (_db.query.meals.findMany as any).mockResolvedValue(meals);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.getByFastingType({ fastingType: "strict" });

      expect(result).toEqual(meals);
    });

    it("returns all meals when fastingType is 'both'", async () => {
      (_db.query.meals.findMany as any).mockResolvedValue([]);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.getByFastingType({ fastingType: "both" });

      expect(result).toEqual([]);
    });
  });

  describe("get", () => {
    it("returns meal with id", async () => {
      const meal = {
        id: "1", name: "Koshari", cuisine: "Egyptian", fastingType: "strict", description: "Lentils, rice, pasta",
        ingredients: [], steps: [], tags: [],
      };
      (_db.query.meals.findFirst as any).mockResolvedValue(meal);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.get({ id: "1" });

      expect(result).toBeDefined();
      expect(result?.id).toBe("1");
      expect(result?.name).toBe("Koshari");
    });

    it("returns null when meal not found", async () => {
      (_db.query.meals.findFirst as any).mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.get({ id: "nonexistent" });

      expect(result).toBeNull();
    });

    it("cleans multi-line ingredients in response", async () => {
      const meal = {
        id: "1", name: "Test", cuisine: "Egyptian", fastingType: "strict",
        ingredients: [{ id: "i1", mealId: "1", ingredient: "olive oil\nsalt", orderIndex: 0 }],
        steps: [],
        tags: [],
      };
      (_db.query.meals.findFirst as any).mockResolvedValue(meal);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.get({ id: "1" });

      expect(result).toBeDefined();
      expect(result!.ingredients).toHaveLength(2);
      expect(result!.ingredients[0]!.ingredient).toBe("olive oil");
      expect(result!.ingredients[1]!.ingredient).toBe("salt");
    });
  });

  describe("getSnacks", () => {
    it("returns all snacks when no filters", async () => {
      const snacks = [
        { id: "1", name: "Trail Mix", cuisine: "American", fastingType: "strict" },
        { id: "2", name: "Fruit Salad", cuisine: "American", fastingType: "regular" },
      ];
      (_db.query.snacks.findMany as any).mockResolvedValue(snacks);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.getSnacks({});

      expect(result).toEqual(snacks);
    });
  });

  describe("getAllSnacks", () => {
    it("returns all snacks", async () => {
      const snacks = [{ id: "1", name: "Trail Mix", cuisine: "American", fastingType: "strict" }];
      (_db.query.snacks.findMany as any).mockResolvedValue(snacks);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.getAllSnacks();

      expect(result).toEqual(snacks);
    });
  });

  describe("getSnackById", () => {
    it("returns snack by id", async () => {
      const snack = { id: "1", name: "Trail Mix", cuisine: "American", fastingType: "strict" };
      (_db.query.snacks.findFirst as any).mockResolvedValue(snack);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.getSnackById({ id: "1" });

      expect(result).toEqual(snack);
    });

    it("returns null for unknown snack", async () => {
      (_db.query.snacks.findFirst as any).mockResolvedValue(undefined);

      const caller = createCaller(makeCtx());
      const result = await caller.meals.getSnackById({ id: "nonexistent" });

      expect(result).toBeNull();
    });
  });
});
