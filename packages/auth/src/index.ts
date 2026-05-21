import { expo } from "@better-auth/expo";
import { createDb } from "@kononia/db";
import * as schema from "@kononia/db/schema/auth";
import { env } from "@kononia/env/server";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import { polarClient } from "./lib/payments";

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",

      schema: schema,
    }),
    trustedOrigins: [
      env.CORS_ORIGIN,
      "http://localhost:3000",
      "http://localhost:3001",
      "kononia://",
      ...(env.NODE_ENV === "development"
        ? ["exp://", "exp://**", "exp://192.168.*.*:*/**", "http://localhost:8081"]
        : []),
    ],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        httpOnly: true,
      },
    },
    plugins: [
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        enableCustomerPortal: true,
        use: [
          checkout({
            products: [
              {
                productId: "0d2c5a91-03ef-4ef3-ba7a-8a6faf08b2f1",
                slug: "Pro-(Annual)",
              },
            ],
            successUrl: `${env.POLAR_SUCCESS_URL}/settings?success=true`,
            authenticatedUsersOnly: true,
          }),
          portal(),
          webhooks({
            secret: env.POLAR_WEBHOOK_SECRET,
            onSubscriptionActive: async (payload: any) => {
              const externalId = payload.data?.customer?.externalId;
              if (externalId) {
                await db.update(schema.user)
                  .set({ plan: "annual", subscribedAt: new Date() })
                  .where(eq(schema.user.id, externalId));
              }
            },
            onSubscriptionRevoked: async (payload: any) => {
              const externalId = payload.data?.customer?.externalId;
              if (externalId) {
                await db.update(schema.user)
                  .set({ plan: "free", subscribedAt: null })
                  .where(eq(schema.user.id, externalId));
              }
            },
          }),
        ],
      }),
      expo(),
    ],
  });
}

export const auth = createAuth();
