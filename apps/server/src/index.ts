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
import { eq, sql } from "drizzle-orm";
import { polarClient } from "@kononia/auth/lib/payments";
import { getYearFastingCalendar, getYearSeasons, getTodayCopticDate } from "./lib/coptic-api";

async function syncCopticData() {
  const year = new Date().getFullYear();
  console.log(`Syncing Coptic data for ${year}...`);
  
  try {
    const fastingDays = await getYearFastingCalendar(year);
    const seasonsData = await getYearSeasons(year);

    for (const day of fastingDays) {
      await db.insert(fastDays).values({
        id: day.date,
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

    console.log(`Synced ${fastingDays.length} fasting days and ${seasonsData.length} seasons`);
  } catch (error) {
    console.error("Auto-sync failed:", error);
  }
}

async function checkAndSync() {
  const today = new Date().toISOString().split("T")[0];
  const existingDay = await db.select({ count: sql<number>`count(*)` }).from(fastDays).where(eq(fastDays.date, today));
  
  if (existingDay[0]?.count === 0) {
    await syncCopticData();
  } else {
    console.log("Coptic data already cached");
  }
}

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/api/auth", toNodeHandler(auth));

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
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (!signature) {
      return res.status(401).json({ error: "Missing signature" });
    }

    if (webhookSecret) {
      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");
      
      const signatureBuffer = Buffer.from(signature, "hex");
      const expectedBuffer = Buffer.from(expectedSignature, "hex");
      
      if (signatureBuffer.length !== expectedBuffer.length || 
          !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const event = JSON.parse(body);
    console.log("Polar webhook received:", event.type);

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.post("/api/sync/coptic", async (_req, res) => {
  try {
    const year = new Date().getFullYear();
    
    const fastingDays = await getYearFastingCalendar(year);
    const seasonsData = await getYearSeasons(year);
    const copticDate = await getTodayCopticDate();

    for (const day of fastingDays) {
      await db.insert(fastDays).values({
        id: day.date,
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
