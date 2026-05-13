"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import { Button } from "@kononia/ui/components/button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const FASTING_TYPE_COLORS: Record<string, string> = {
  strict: "bg-fast-strict text-white",
  regular: "bg-fast-regular text-white",
  feast: "bg-fast-feast text-foreground",
};

const FASTING_TYPE_LABELS: Record<string, string> = {
  strict: "Strict",
  regular: "Regular",
  feast: "Feast",
};

export default function CalendarPage() {
  const trpc = useTRPC();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
  
  const { data: fastDays } = useQuery(trpc.calendar.getFastDaysInRange.queryOptions({
    startDate,
    endDate,
  }));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getFastDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return fastDays?.find(fd => fd.date === dateStr);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-foreground">Fasting Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            ←
          </Button>
          <span className="font-medium min-w-[120px] text-center">
            {MONTHS[month]} {year}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const fastDay = getFastDay(day);
          const fastingType = fastDay?.fastingType as string;
          const colorClass = fastingType && FASTING_TYPE_COLORS[fastingType] 
            ? FASTING_TYPE_COLORS[fastingType]
            : "bg-background";
          
          return (
            <button
              key={day}
              className={`aspect-square rounded-md border p-1 text-sm transition-colors hover:bg-secondary ${colorClass}`}
            >
              <span className="block">{day}</span>
              {fastDay && fastingType && (
                <span className="text-[10px] block opacity-80">
                  {FASTING_TYPE_LABELS[fastingType] || fastingType}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-4 justify-center">
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
    </div>
  );
}