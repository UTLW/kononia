"use client";

import { trpc } from "@/utils/trpc";

const FASTING_TYPE_COLORS = {
  strict: "bg-fast-strict",
  regular: "bg-fast-regular", 
  feast: "bg-fast-feast",
};

const FASTING_TYPE_LABELS = {
  strict: "Strict Fast",
  regular: "Regular Fast",
  feast: "Feast Day",
};

export default function HomePage() {
  const { data: fastDay } = trpc.calendar.getTodayFastDay.useQuery();
  const { data: season } = trpc.seasons.getCurrent.useQuery();
  const { data: meals } = trpc.meals.list.useQuery({ 
    fastingType: fastDay?.fastingType || "regular",
    limit: 3 
  });

  const fastingType = fastDay?.fastingType || "regular";
  const colorClass = FASTING_TYPE_COLORS[fastingType as keyof typeof FASTING_TYPE_COLORS] || "bg-fast-regular";

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