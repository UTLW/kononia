"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@kononia/ui/components/card";
import { Badge } from "@kononia/ui/components/badge";
import { FASTING_COLORS, QUERY_LIMITS } from "@kononia/ui/lib/constants";

const fastingColors: Record<string, string> = {
  strict: "from-[#5a252d] to-[var(--fast-strict)]",
  regular: "from-[#a8894f] to-[var(--fast-regular)]",
  feast: "from-[#3d6b4a] to-[var(--fast-feast)]",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "🌅";
  if (hour < 18) return "☀️";
  return "🌙";
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const { data: fastDay } = trpc.calendar.getTodayFastDay.useQuery();
  const { data: season } = trpc.seasons.getCurrent.useQuery();
  const { data: upcomingFasts } = trpc.calendar.getUpcomingFastDays.useQuery({ days: 7 });
  const { data: monthFasts } = trpc.calendar.getFastDaysInRange.useQuery({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  
  const fastingType = fastDay?.fastingType || "regular";
  const { data: mealsData } = trpc.meals.getByFastingType.useQuery({ 
    fastingType: fastingType === "feast" ? "both" : fastingType,
    limit: 4,
  });
  const meals = mealsData || [];

  const fastDaysThisMonth = monthFasts?.filter(f => f.fastingType !== "feast").length || 0;
  const name = session.user?.name || session.user?.email?.split("@")[0] || "Friend";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-1">{getGreeting()} {getGreetingEmoji()}</p>
        <h1 className="font-serif text-3xl text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground mt-1">May this day bring you closer to God</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className={`bg-gradient-to-br ${fastingColors[fastingType]} text-white overflow-hidden`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Today&apos;s Fasting</p>
                  <h2 className="font-serif text-2xl mt-1">
                    {fastingType === "strict" ? "Strict Fast" : fastingType === "regular" ? "Regular Fast" : "Feast Day"}
                  </h2>
                  <p className="text-white/80 text-sm mt-2">{fastDay?.fastNotes || "A day of prayer and fasting"}</p>
                </div>
                <div className="text-6xl opacity-50">
                  {fastingType === "strict" ? "⛪" : fastingType === "regular" ? "🕯️" : "🎉"}
                </div>
              </div>
              {fastingType === "strict" && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/70">No meat, dairy, eggs, oil, wine, nuts, or seeds</p>
                </div>
              )}
              {fastingType === "regular" && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/70">No meat, dairy, eggs, olive oil, wine, avocado, nuts, seeds</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-serif text-[var(--fast-strict)]">{fastDaysThisMonth}</p>
              <p className="text-xs text-muted-foreground">Fasting days this month</p>
            </CardContent>
          </Card>
          
          {season && (
            <Card className="bg-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Current Season</p>
                <p className="font-medium text-foreground">{season.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{season.startDate} - {season.endDate}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {upcomingFasts && upcomingFasts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Fast Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {upcomingFasts.filter(f => f.fastingType !== "feast").slice(0, 5).map((fast) => (
                <div key={fast.id} className="flex-shrink-0 text-center px-4 py-3 rounded-lg bg-muted min-w-[80px]">
                  <p className="text-xs text-muted-foreground">{new Date(fast.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                  <p className="text-lg font-medium">{new Date(fast.date).getDate()}</p>
                  <Badge 
                    className="mt-1 text-[10px]"
                    style={{ backgroundColor: fast.fastingType === "strict" ? "var(--fast-strict)" : "var(--fast-regular)" }}
                  >
                    {fast.fastingType === "strict" ? "Strict" : "Regular"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/calendar" className="block group">
          <Card className="cursor-pointer hover:shadow-lg hover:border-[var(--fast-strict)]/30 transition-all h-full border-2 border-transparent">
            <CardContent className="py-6 text-center">
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">📅</span>
              <span className="font-medium">Calendar</span>
              <p className="text-xs text-muted-foreground mt-1">View schedule</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/meals" className="block group">
          <Card className="cursor-pointer hover:shadow-lg hover:border-[var(--fast-strict)]/30 transition-all h-full border-2 border-transparent">
            <CardContent className="py-6 text-center">
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">🍽️</span>
              <span className="font-medium">Meals</span>
              <p className="text-xs text-muted-foreground mt-1">Browse recipes</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/snacks" className="block group">
          <Card className="cursor-pointer hover:shadow-lg hover:border-[var(--fast-strict)]/30 transition-all h-full border-2 border-transparent">
            <CardContent className="py-6 text-center">
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">🥗</span>
              <span className="font-medium">Snacks</span>
              <p className="text-xs text-muted-foreground mt-1">Quick foods</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings" className="block group">
          <Card className="cursor-pointer hover:shadow-lg hover:border-[var(--fast-strict)]/30 transition-all h-full border-2 border-transparent">
            <CardContent className="py-6 text-center">
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">⚙️</span>
              <span className="font-medium">Settings</span>
              <p className="text-xs text-muted-foreground mt-1">Account</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {meals.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Today&apos;s Meal Ideas</CardTitle>
            <Link href="/meals" className="text-sm text-[var(--fast-strict)] hover:underline">View All →</Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {meals.map((meal) => (
                <Link key={meal.id} href={`/meal/${meal.id}`}>
                  <div className="rounded-lg border bg-card overflow-hidden hover:shadow-lg hover:border-[var(--fast-strict)]/30 transition-all group">
                    {meal.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">{meal.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1 capitalize text-[var(--fast-strict)] border-[var(--fast-strict)]">{meal.fastingType}</Badge>
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