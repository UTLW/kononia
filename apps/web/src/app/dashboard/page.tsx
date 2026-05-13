"use client";

import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@kononia/ui/components/card";
import { Button } from "@kononia/ui/components/button";

export default function DashboardPage() {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const { data: fastDay } = trpc.calendar.getTodayFastDay.useQuery();
  const { data: season } = trpc.seasons.getCurrent.useQuery();
  const { data: meals } = trpc.meals.list.useQuery({ limit: 3 });

  if (!session) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6 text-center">
        <p>Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const fastingType = fastDay?.fastingType || "regular";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Welcome back!</h1>
        <Button variant="outline" asChild>
          <Link href="/settings">Settings</Link>
        </Button>
      </div>

      <Card className={fastingType === "strict" ? "bg-fast-strict text-white" : fastingType === "regular" ? "bg-fast-regular text-white" : "bg-fast-feast"}>
        <CardContent className="py-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl mb-2">
              {fastingType === "strict" ? "Strict Fast" : fastingType === "regular" ? "Regular Fast" : "Feast Day"}
            </h2>
            <p className="text-white/90">{fastDay?.fastNotes || "Today is a day of fasting"}</p>
          </div>
        </CardContent>
      </Card>

      {season && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Season</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{season.name}</p>
            <p className="text-sm text-muted-foreground">{season.startDate} - {season.endDate}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="py-4 text-center">
            <Link href="/calendar" className="block">
              <span className="text-2xl block mb-2">📅</span>
              <span className="font-medium">Calendar</span>
            </Link>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="py-4 text-center">
            <Link href="/meals" className="block">
              <span className="text-2xl block mb-2">🍽️</span>
              <span className="font-medium">Meals</span>
            </Link>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="py-4 text-center">
            <Link href="/snacks" className="block">
              <span className="text-2xl block mb-2">🥗</span>
              <span className="font-medium">Snacks</span>
            </Link>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="py-4 text-center">
            <Link href="/settings" className="block">
              <span className="text-2xl block mb-2">⚙️</span>
              <span className="font-medium">Settings</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {meals && meals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Meal Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {meals.map((meal) => (
                <Link key={meal.id} href={`/meal/${meal.id}`}>
                  <div className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
                    {meal.imageUrl && (
                      <img src={meal.imageUrl} alt={meal.name} className="w-full h-24 object-cover" />
                    )}
                    <div className="p-3">
                      <h3 className="font-medium text-sm">{meal.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}