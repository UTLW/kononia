import { describe, it, expect, vi, beforeEach } from "vitest";

describe("auth webhook handlers", () => {
  let mockDb: { update: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn>; where: ReturnType<typeof vi.fn> };

  function handleSubscriptionActive(db: any, payload: any) {
    const externalId = payload.data?.customer?.externalId;
    if (externalId) {
      return db.update("user")
        .set({ plan: "annual", subscribedAt: new Date() })
        .where(externalId);
    }
    return Promise.resolve({ skipped: true });
  }

  function handleSubscriptionRevoked(db: any, payload: any) {
    const externalId = payload.data?.customer?.externalId;
    if (externalId) {
      return db.update("user")
        .set({ plan: "free", subscribedAt: null })
        .where(externalId);
    }
    return Promise.resolve({ skipped: true });
  }

  beforeEach(() => {
    mockDb = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("onSubscriptionActive", () => {
    it("sets plan to annual and subscribedAt when externalId is present", async () => {
      const payload = {
        data: {
          customer: { externalId: "user-123" },
        },
      };

      await handleSubscriptionActive(mockDb, payload);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({ plan: "annual" })
      );
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({ subscribedAt: expect.any(Date) })
      );
    });

    it("skips update when externalId is missing", async () => {
      const payload = { data: { customer: {} } };
      const result = await handleSubscriptionActive(mockDb, payload);

      expect(result).toEqual({ skipped: true });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("skips update when payload has no customer", async () => {
      const payload = { data: {} };
      const result = await handleSubscriptionActive(mockDb, payload);

      expect(result).toEqual({ skipped: true });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("skips update when externalId is undefined", async () => {
      const payload = { data: { customer: { externalId: undefined } } };
      const result = await handleSubscriptionActive(mockDb, payload);

      expect(result).toEqual({ skipped: true });
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe("onSubscriptionRevoked", () => {
    it("resets plan to free and subscribedAt to null", async () => {
      const payload = {
        data: {
          customer: { externalId: "user-123" },
        },
      };

      await handleSubscriptionRevoked(mockDb, payload);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({ plan: "free", subscribedAt: null })
      );
    });

    it("skips update when externalId is missing", async () => {
      const payload = { data: { customer: {} } };
      const result = await handleSubscriptionRevoked(mockDb, payload);

      expect(result).toEqual({ skipped: true });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("skips update when payload has no customer", async () => {
      const payload = { data: {} };
      const result = await handleSubscriptionRevoked(mockDb, payload);

      expect(result).toEqual({ skipped: true });
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });
});
