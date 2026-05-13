import { createContext } from "@kononia/api/context";
import { appRouter } from "@kononia/api/routers/index";
import { auth } from "@kononia/auth";
import { env } from "@kononia/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { db } from "@kononia/db";
import { user } from "@kononia/db/schema/auth";
import { seasons, fastDays } from "@kononia/db";
import { eq } from "drizzle-orm";
import { polarClient } from "@kononia/auth/lib/payments";
import { getYearFastingCalendar, getYearSeasons, getTodayCopticDate } from "./lib/coptic-api";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(express.json());

app.post("/webhooks/polar", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const body = req.body.toString();
    const signature = req.headers["polar-signature"];

    if (!signature) {
      return res.status(401).json({ error: "Missing signature" });
    }

    const event = JSON.parse(body);
    console.log("Polar webhook received:", event.type);

    switch (event.type) {
      case "order.created":
      case "subscription.created": {
        const customerId = event.data.attributes.customerId;
        const status = event.data.attributes.status;

        if (status === "completed" || status === "active") {
          const userRecord = await db
            .select()
            .from(user)
            .where(eq(user.id, customerId))
            .limit(1);

          if (userRecord[0]) {
            await db
              .update(user)
              .set({ 
                plan: "annual",
                subscribedAt: new Date(),
              })
              .where(eq(user.id, userRecord[0].id));
            console.log("User upgraded to annual plan:", userRecord[0].email);
          }
        }
        break;
      }
      case "subscription.canceled": {
        const customerId = event.data.attributes.customerId;
        const userRecord = await db
          .select()
          .from(user)
          .where(eq(user.id, customerId))
          .limit(1);

        if (userRecord[0]) {
          await db
            .update(user)
            .set({ plan: "free" })
            .where(eq(user.id, userRecord[0].id));
          console.log("User subscription canceled:", userRecord[0].email);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.post("/api/auth/polar-checkout", async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const productId = process.env.POLAR_PRODUCT_ID;
    if (!productId) {
      return res.status(500).json({ error: "Polar product not configured" });
    }

    const checkout = await polarClient.checkouts.create({
      productId,
      customerId: session.user.id,
      successUrl: `${env.CORS_ORIGIN}/settings?success=true`,
      cancelUrl: `${env.CORS_ORIGIN}/settings?cancelled=true`,
    });

    res.json({ url: checkout.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout" });
  }
});

app.post("/api/sync/coptic", async (_req, res) => {
  try {
    const year = new Date().getFullYear();
    
    const fastingDays = await getYearFastingCalendar(year);
    const seasonsData = await getYearSeasons(year);
    const copticDate = await getTodayCopticDate();

    for (const day of fastingDays) {
      await db.insert(fastDays).values({
        date: day.date,
        fastingType: day.fastingType,
        fastNotes: day.name || null,
      }).onConflictDoUpdate({
        target: fastDays.date,
        set: {
          fastingType: day.fastingType,
          fastNotes: day.name || null,
        },
      });
    }

    for (const season of seasonsData) {
      await db.insert(seasons).values({
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
      }).onConflictDoUpdate({
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

    res.json({ 
      success: true, 
      fastingDaysCount: fastingDays.length,
      seasonsCount: seasonsData.length,
      todayCoptic: copticDate,
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to sync Coptic data" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
