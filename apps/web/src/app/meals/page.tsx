"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Input } from "@kononia/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@kononia/ui/components/select";
import { Card, CardContent } from "@kononia/ui/components/card";

const CUISINE_LABELS: Record<string, string> = {
  "": "All Cuisines",
  "egyptian": "Egyptian",
  "italian": "Italian",
  "mexican": "Mexican",
  "lebanese": "Lebanese",
  "american": "American",
  "turkish": "Turkish",
  "chinese": "Chinese",
  "japanese": "Japanese",
  "greek": "Greek",
  "middle-eastern": "Middle Eastern",
  "spanish": "Spanish",
};

const FASTING_TYPE_LABELS: Record<string, string> = {
  "": "All Fasting Types",
  "strict": "Strict Fast",
  "regular": "Regular Fast",
  "both": "Both",
};

const CUISINES = Object.keys(CUISINE_LABELS).filter(k => k !== "");
const FASTING_TYPES = Object.keys(FASTING_TYPE_LABELS).filter(k => k !== "");

export default function MealsPage() {
  const trpc = useTRPC();
  const [cuisine, setCuisine] = useState<string>("");
  const [fastingType, setFastingType] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: allMeals, isLoading } = useQuery(
    trpc.meals.list.queryOptions({
      limit: 50,
    })
  );

  const { data: searchResults } = useQuery(
    trpc.meals.search.queryOptions(
      { query: search },
      { enabled: search.length >= 2 }
    )
  );

  const meals = search.length >= 2 ? (searchResults || []) : (allMeals || []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-serif text-2xl mb-6 text-foreground">Meals</h1>

      <div className="space-y-4 mb-6">
        <Input
          type="text"
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <Select value={cuisine} onValueChange={setCuisine}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Cuisines" />
            </SelectTrigger>
            <SelectContent>
              {CUISINES.map(c => (
                <SelectItem key={c} value={c}>{CUISINE_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fastingType} onValueChange={setFastingType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Fasting Types" />
            </SelectTrigger>
            <SelectContent>
              {FASTING_TYPES.map(t => (
                <SelectItem key={t} value={t}>{FASTING_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meals?.map((meal) => (
          <Link key={meal.id} href={`/meal/${meal.id}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              {meal.imageUrl && (
                <img 
                  src={meal.imageUrl} 
                  alt={meal.name}
                  className="w-full h-40 object-cover"
                />
              )}
              <CardContent className="p-4">
                <h3 className="font-medium text-card-foreground">{meal.name}</h3>
                <p className="text-sm text-muted-foreground">{meal.cuisineTag}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    meal.fastingType === "strict" ? "bg-fast-strict text-white" :
                    meal.fastingType === "regular" ? "bg-fast-regular text-white" :
                    "bg-fast-feast text-foreground"
                  }`}>
                    {meal.fastingType === "strict" ? "Strict Fast" : meal.fastingType === "regular" ? "Regular Fast" : "Both"}
                  </span>
                  {meal.prepTime !== null && meal.cookTime !== null && (
                    <span className="text-xs text-muted-foreground">
                      {meal.prepTime + meal.cookTime} min
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
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