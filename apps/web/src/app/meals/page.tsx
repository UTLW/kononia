"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

const CUISINES = [
  "egyptian", "italian", "mexican", "lebanese", "american", 
  "turkish", "chinese", "japanese", "greek", "middle-eastern", "spanish"
];

const FASTING_TYPES = ["strict", "regular", "both"];

export default function MealsPage() {
  const [cuisine, setCuisine] = useState<string>("");
  const [fastingType, setFastingType] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: allMeals } = trpc.meals.list.useQuery({
    cuisine: cuisine || undefined,
    fastingType: fastingType || undefined,
    limit: 50,
  });

  const { data: searchResults } = trpc.meals.search.useQuery(
    { query: search },
    { enabled: search.length >= 2 }
  );

  const meals = search.length >= 2 ? searchResults : allMeals;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-serif text-2xl mb-6 text-foreground">Meals</h1>

      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Cuisines</option>
            {CUISINES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={fastingType}
            onChange={(e) => setFastingType(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Fasting Types</option>
            {FASTING_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meals?.map((meal) => (
          <Link 
            key={meal.id} 
            href={`/meal/${meal.id}`}
            className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
          >
            {meal.imageUrl && (
              <img 
                src={meal.imageUrl} 
                alt={meal.name}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-medium text-card-foreground">{meal.name}</h3>
              <p className="text-sm text-muted-foreground">{meal.cuisineTag}</p>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  meal.fastingType === "strict" ? "bg-fast-strict text-white" :
                  meal.fastingType === "regular" ? "bg-fast-regular text-white" :
                  "bg-fast-feast text-foreground"
                }`}>
                  {meal.fastingType}
                </span>
                {meal.prepTime !== null && meal.cookTime !== null && (
                  <span className="text-xs text-muted-foreground">
                    {meal.prepTime + meal.cookTime} min
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {(!meals || meals.length === 0) && (
          <p className="col-span-full text-center py-8 text-muted-foreground">
            No meals found
          </p>
        )}
      </div>
    </div>
  );
}