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

interface ApiFastDay {
  date: string;
  copticDate?: {
    dateString: string;
    day: number;
    month: number;
    year: number;
    monthString: string;
  };
  fastType: string;
  description: string;
}

interface ApiSeason {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isFasting: boolean;
  type: string;
}

function isWedOrFri(dateStr: string): boolean {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay();
  return day === 3 || day === 5; // Wednesday = 3, Friday = 5
}

function mapFastDescriptionToType(description: string | undefined): "strict" | "regular" {
  if (!description) return "regular";
  
  const desc = description.toLowerCase();
  
  if (desc.includes("great lent") || 
      desc.includes("holy week") || 
      desc.includes("nineveh") ||
      desc.includes("strict")) {
    return "strict";
  }
  
  return "regular";
}

function getSeasonForDate(seasons: ApiSeason[], dateStr: string): ApiSeason | null {
  for (const season of seasons) {
    if (dateStr >= season.startDate && dateStr <= season.endDate) {
      return season;
    }
  }
  return null;
}

async function getSeasonsForYear(year: number): Promise<ApiSeason[]> {
  try {
    const response = await fetch(`${COPTC_API_BASE}/season/year/${year}`);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data || !data.seasons) return [];
    return data.seasons as ApiSeason[];
  } catch {
    return [];
  }
}

export async function getYearFastingCalendar(year: number): Promise<CopticFastingDay[]> {
  try {
    const [fastResponse, seasons] = await Promise.all([
      fetch(`${COPTC_API_BASE}/fasting/calendar/${year}`),
      getSeasonsForYear(year),
    ]);

    if (!fastResponse.ok) {
      console.error("API returned:", fastResponse.status);
      return [];
    }

    const fastData = await fastResponse.json();
    
    if (!Array.isArray(fastData)) {
      console.error("Unexpected API response format:", fastData);
      return [];
    }

    const apiDays = fastData as ApiFastDay[];
    const fastDaysMap = new Map<string, CopticFastingDay>();
    
    for (const day of apiDays) {
      fastDaysMap.set(day.date, {
        date: day.date,
        fastingType: mapFastDescriptionToType(day.description),
        name: day.description,
      });
    }

    const result: CopticFastingDay[] = [];
    
    // Feast periods: Paschal Season (Easter to Pentecost) + Dec 25 - Jan 6
    const feastPeriods = [
      { start: `${year}-04-12`, end: `${year}-05-31` }, // Paschal Season
      { start: `${year}-12-25`, end: `${year + year < 2028 ? "-12-31" : "-12-31"}` }, // Dec 25 end of year
      { start: `${year + 1}-01-01`, end: `${year + 1}-01-06` }, // Jan 1-6
    ];
    
    // Adjust feast periods for 2027
    if (year === 2027) {
      feastPeriods[0] = { start: "2027-05-02", end: "2027-06-20" };
    }

    function isFeastDay(dateStr: string): boolean {
      for (const period of feastPeriods) {
        if (dateStr >= period.start && dateStr <= period.end) {
          return true;
        }
      }
      return false;
    }

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        
        // Check if this is a feast day
        if (isFeastDay(dateStr)) {
          result.push({
            date: dateStr,
            fastingType: "feast",
            name: dateStr >= "2026-12-25" && dateStr <= "2026-12-31" ? "Nativity Feast" :
                  dateStr >= "2027-01-01" && dateStr <= "2027-01-06" ? "Nativity Feast" :
                  "Paschal Season",
          });
          continue;
        }
        
        // Check if API says this is a fast day
        if (fastDaysMap.has(dateStr)) {
          const fastDay = fastDaysMap.get(dateStr)!;
          result.push(fastDay);
          continue;
        }
        
        // Check if Wednesday or Friday (strict fast)
        if (isWedOrFri(dateStr)) {
          result.push({
            date: dateStr,
            fastingType: "strict",
            name: undefined,
          });
          continue;
        }
        
        // Default - regular fast
        result.push({
          date: dateStr,
          fastingType: "regular",
          name: undefined,
        });
      }
    }
    
    return result;
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
    
    if (!data || !data.name) return null;
    
    return {
      id: `${data.name}-${date}`,
      name: data.name,
      description: data.description || data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      fastingType: data.isFasting ? "regular" : "feast",
    };
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
    
    if (!data || !data.seasons) return [];
    
    const apiSeasons = data.seasons as ApiSeason[];
    
    return apiSeasons.map((season, index) => ({
      id: `${season.name.toLowerCase().replace(/\s+/g, "-")}-${year}-${index}`,
      name: season.name,
      description: season.description,
      startDate: season.startDate,
      endDate: season.endDate,
      fastingType: season.isFasting ? 
        (season.name.toLowerCase().includes("lent") || 
         season.name.toLowerCase().includes("holy week") ||
         season.name.toLowerCase().includes("nineveh") ? "strict" : "regular") 
        : "feast",
    }));
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