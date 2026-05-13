"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";

const FASTING_TYPE_COLORS: Record<string, string> = {
  strict: "bg-fast-strict",
  regular: "bg-fast-regular", 
  feast: "bg-fast-feast",
};

const FASTING_TYPE_LABELS: Record<string, string> = {
  strict: "Strict Fast",
  regular: "Regular Fast",
  feast: "Feast Day",
};

export default function HomePage() {
  const trpc = useTRPC();
  const { data: session, isLoading: sessionLoading } = authClient.useSession();
  const hasSynced = useRef(false);
  
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sync/coptic`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Sync failed");
      return res.json();
    },
  });

  useEffect(() => {
    if (session && !hasSynced.current) {
      hasSynced.current = true;
      syncMutation.mutate();
    }
  }, [session]);

  const { data: fastDay } = useQuery(trpc.calendar.getTodayFastDay.queryOptions());
  const { data: season } = useQuery(trpc.seasons.getCurrent.queryOptions());
  const { data: meals } = useQuery(trpc.meals.list.queryOptions({ 
    fastingType: fastDay?.fastingType || "regular",
    limit: 3 
  }));

  if (sessionLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
        <section className="rounded-xl p-8 text-center bg-fast-regular text-white">
          <h1 className="font-serif text-4xl mb-4">ⲔⲞⲚⲞⲚⲒⲀ</h1>
          <p className="text-lg mb-4">Orthodox Christian Family Fasting Companion</p>
          <p className="text-white/80 mb-6">
            Track liturgical fasting days, find recipes, and follow the Coptic Orthodox tradition.
          </p>
          <Button 
            size="lg" 
            onClick={() => authClient.signIn.email()}
            className="bg-white text-primary hover:bg-white/90"
          >
            Sign In to Continue
          </Button>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-serif text-xl mb-4 text-card-foreground">Features</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>📅 Fasting calendar with Coptic seasons</li>
            <li>🍽️ Orthodox fasting recipes and meal ideas</li>
            <li>🥗 Snack guide for fasting days</li>
            <li>📱 Available on web and mobile</li>
          </ul>
        </section>
      </div>
    );
  }

  const fastingType = fastDay?.fastingType || "regular";
  const colorClass = FASTING_TYPE_COLORS[fastingType] || "bg-fast-regular";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
      <section className={`rounded-xl p-6 text-white ${colorClass}`}>
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-2">
            {FASTING_TYPE_LABELS[fastingType as keyof typeof FASTING_TYPE_LABELS]}
          </h1>
          <p className="text-white/90">
            {fastDay?.fastNotes || "Today is a day of fasting"}
          </p>
        </div>
      </section>

      {season && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="font-serif text-xl mb-2 text-card-foreground">Current Season</h2>
          <div className="space-y-1">
            <p className="font-medium">{season.name}</p>
            <p className="text-sm text-muted-foreground">
              {season.startDate} - {season.endDate}
            </p>
            <p className="text-sm text-muted-foreground">
              {season.copticMonth && `Coptic: ${season.copticMonth}`}
            </p>
          </div>
        </section>
      )}

      <section className="rounded-lg border bg-card p-4">
        <h2 className="font-serif text-xl mb-4 text-card-foreground">Today's Meals</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meals?.map((meal) => (
            <div key={meal.id} className="rounded-lg border bg-card overflow-hidden">
              {meal.imageUrl && (
                <img 
                  src={meal.imageUrl} 
                  alt={meal.name}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-3">
                <h3 className="font-medium text-card-foreground">{meal.name}</h3>
                <p className="text-xs text-muted-foreground">{meal.cuisineTag}</p>
                {meal.prepTime && meal.cookTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {meal.prepTime + meal.cookTime} min
                  </p>
                )}
              </div>
            </div>
          ))}
          {(!meals || meals.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-4">
              No meals found for today&apos;s fasting type
            </p>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="font-serif text-xl mb-2 text-card-foreground">Quick Links</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <a href="/calendar" className="rounded-md bg-secondary p-3 text-center text-secondary-foreground hover:bg-secondary/80">
            View Calendar
          </a>
          <a href="/meals" className="rounded-md bg-secondary p-3 text-center text-secondary-foreground hover:bg-secondary/80">
            Browse Meals
          </a>
          <a href="/snacks" className="rounded-md bg-secondary p-3 text-center text-secondary-foreground hover:bg-secondary/80">
            Snack Guide
          </a>
          <a href="/settings" className="rounded-md bg-secondary p-3 text-center text-secondary-foreground hover:bg-secondary/80">
            Settings
          </a>
        </div>
      </section>
    </div>
  );
}