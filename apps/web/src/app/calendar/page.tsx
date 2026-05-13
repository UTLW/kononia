"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Calendar } from "@kononia/ui/components/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@kononia/ui/components/card";
import { Button } from "@kononia/ui/components/button";
import { Badge } from "@kononia/ui/components/badge";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const FASTING_TYPE_STYLES: Record<string, { bg: string; label: string }> = {
  strict: { bg: "bg-fast-strict", label: "Strict Fast" },
  regular: { bg: "bg-fast-regular", label: "Regular Fast" },
  feast: { bg: "bg-fast-feast", label: "Feast Day" },
};

export default function CalendarPage() {
  const { data: session } = authClient.useSession();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
  
  const { data: fastDays } = useQuery(
    trpc.calendar.getFastDaysInRange.queryOptions({ startDate, endDate })
  );

  const { data: selectedDayData } = useQuery(
    selectedDate 
      ? trpc.calendar.getFastDay.queryOptions({ date: selectedDate.toISOString().split("T")[0] })
      : null
  );

  const { data: currentSeason } = useQuery(trpc.seasons.getCurrent.queryOptions());

  const getFastingTypeForDate = (date: Date) => {
    if (!fastDays) return null;
    const dateStr = date.toISOString().split("T")[0];
    const day = fastDays.find(d => d.date === dateStr);
    return day?.fastingType || null;
  };

  const handlePreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const modifiers = {
    fasting: (date: Date) => {
      const fastingType = getFastingTypeForDate(date);
      return fastingType !== null;
    },
    strictFast: (date: Date) => getFastingTypeForDate(date) === "strict",
    regularFast: (date: Date) => getFastingTypeForDate(date) === "regular",
    feast: (date: Date) => getFastingTypeForDate(date) === "feast",
  };

  const modifiersStyles = {
    fasting: { 
      backgroundColor: "#FDF8F3",
      border: "2px solid #4A7C59",
    },
    strictFast: { 
      backgroundColor: "#722F37", 
      color: "white",
    },
    regularFast: { 
      backgroundColor: "#C9A96E", 
    },
    feast: { 
      backgroundColor: "#4A7C59", 
      color: "white",
    },
  };

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6 text-center">
        <p className="text-muted-foreground">Please sign in to view the calendar.</p>
      </div>
    );
  }

  const selectedFastingType = selectedDayData?.fastingType;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Fasting Calendar</h1>
        {currentSeason && (
          <Badge variant="outline" className="bg-fast-regular text-white">
            {currentSeason.name}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>{MONTHS[month]} {year}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentDate}
            onMonthChange={setCurrentDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-fast-strict" />
          <span className="text-sm">Strict Fast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-fast-regular" />
          <span className="text-sm">Regular Fast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-fast-feast border" />
          <span className="text-sm">Feast</span>
        </div>
      </div>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate.toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFastingType ? (
              <div className="space-y-2">
                <div className={`inline-block px-3 py-1 rounded text-white ${
                  selectedFastingType === "strict" ? "bg-fast-strict" :
                  selectedFastingType === "regular" ? "bg-fast-regular" : "bg-fast-feast"
                }`}>
                  {FASTING_TYPE_STYLES[selectedFastingType]?.label || selectedFastingType}
                </div>
                {selectedDayData?.fastNotes && (
                  <p className="text-muted-foreground">{selectedDayData.fastNotes}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No fasting information for this day.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}