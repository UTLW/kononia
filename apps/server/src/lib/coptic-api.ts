import { env } from "@kononia/env/server";

const COPTC_API_BASE = "https://api.coptic.io/api";

export interface CopticFastingDay {
  date: string;
  fastingType: "strict" | "regular" | "feast";
  name?: string;
}

export interface CopticSeason {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  fastingType: "strict" | "regular" | "feast";
  copticMonth?: string;
}

export interface CopticDate {
  date: string;
  coptic: {
    day: number;
    month: string;
    monthName: string;
    year: number;
  };
  feastDay?: string;
}

export async function getFastingStatus(date: string): Promise<CopticFastingDay | null> {
  try {
    const response = await fetch(`${COPTC_API_BASE}/fasting/${date}`);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      date,
      fastingType: data.fastingType || "regular",
      name: data.name,
    };
  } catch (error) {
    console.error("Failed to fetch fasting status:", error);
    return null;
  }
}

export async function getYearFastingCalendar(year: number): Promise<CopticFastingDay[]> {
  try {
    const response = await fetch(`${COPTC_API_BASE}/fasting/calendar/${year}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.days || [];
  } catch (error) {
    console.error("Failed to fetch fasting calendar:", error);
    return [];
  }
}

export async function getSeason(date: string): Promise<CopticSeason | null> {
  try {
    const response = await fetch(`${COPTC_API_BASE}/season/${date}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch season:", error);
    return null;
  }
}

export async function getYearSeasons(year: number): Promise<CopticSeason[]> {
  try {
    const response = await fetch(`${COPTC_API_BASE}/season/year/${year}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.seasons || [];
  } catch (error) {
    console.error("Failed to fetch seasons:", error);
    return [];
  }
}

export async function getCopticDate(gregorianDate: string): Promise<CopticDate | null> {
  try {
    const response = await fetch(`${COPTC_API_BASE}/calendar/${gregorianDate}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Failed to convert date:", error);
    return null;
  }
}

export async function getTodayCopticDate(): Promise<CopticDate | null> {
  try {
    const response = await fetch(`${COPTC_API_BASE}/calendar`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Failed to get today's Coptic date:", error);
    return null;
  }
}