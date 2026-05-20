"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Input } from "@kononia/ui/components/input";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent } from "@kononia/ui/components/card";
import { Badge } from "@kononia/ui/components/badge";
import { Spinner, CardLoader } from "@/components/spinner";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ChefHat,
  Clock,
  Users
} from "lucide-react";

const CUISINE_OPTIONS = [
  "Egyptian",
  "Italian",
  "Mexican",
  "Lebanese",
  "American",
  "Turkish",
  "Chinese",
  "Japanese",
  "Greek",
  "Middle Eastern",
  "Spanish",
];

const FASTING_TYPE_LABELS: Record<string, string> = {
  strict: "Strict Fast",
  regular: "Regular Fast",
  both: "All Types",
};

export default function MealsPage() {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [fastingType, setFastingType] = useState("");
  const [cursor, setCursor] = useState<string | undefined>();
  const [showPantry, setShowPantry] = useState(false);
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
  const [pantryInput, setPantryInput] = useState("");

  const { data: pantryData } = trpc.user.getPantry.useQuery(undefined, {
    enabled: showPantry,
  });

  useEffect(() => {
    if (pantryData) {
      setPantryIngredients(pantryData);
    }
  }, [pantryData]);

  const { data: mealsData, isLoading, isFetching } = trpc.meals.list.useQuery({
    cuisine: cuisine || undefined,
    fastingType: fastingType || undefined,
    limit: 12,
    cursor,
  }, {
    staleTime: 30000,
  });

  const { data: pantryMealsData, isLoading: pantryLoading } = trpc.meals.getWithIngredients.useQuery({
    ingredients: pantryIngredients,
    limit: 12,
  }, {
    enabled: showPantry && pantryIngredients.length > 0,
  });

  const updatePantry = trpc.user.updatePantry.useMutation({
    onError: (err) => {
      toast.error("Failed to save pantry");
      console.error(err);
    },
  });

  const handleAddIngredient = (ingredient: string) => {
    if (ingredient.trim() && !pantryIngredients.includes(ingredient.trim())) {
      const newIngredients = [...pantryIngredients, ingredient.trim()];
      setPantryIngredients(newIngredients);
      updatePantry.mutate({ ingredients: newIngredients });
      setPantryInput("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = pantryIngredients.filter((_, idx) => idx !== index);
    setPantryIngredients(newIngredients);
    updatePantry.mutate({ ingredients: newIngredients });
  };

  const handleClearPantry = () => {
    setPantryIngredients([]);
    setShowPantry(false);
    updatePantry.mutate({ ingredients: [] });
  };

  const displayMeals = showPantry && pantryIngredients.length > 0 
    ? pantryMealsData?.meals || []
    : mealsData?.meals || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCursor(undefined);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCuisine("");
    setFastingType("");
    setCursor(undefined);
  };

  const hasFilters = cuisine || fastingType || search;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Meals</h1>
        <Button 
          variant={showPantry ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowPantry(!showPantry)}
        >
          <ChefHat className="h-4 w-4 mr-2" />
          What's in your pantry?
        </Button>
      </div>

      {showPantry && (
        <Card className="border-primary/50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add ingredients you have on hand to find matching meals
              </p>
              <div className="flex flex-wrap gap-2">
                {pantryIngredients.map((ing, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pl-2">
                    {ing}
                    <button 
                      onClick={() => handleRemoveIngredient(i)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddIngredient(pantryInput);
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Add ingredient..."
                  value={pantryInput}
                  onChange={(e) => setPantryInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Add
                </Button>
              </form>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {pantryMealsData?.matchCount || 0} matching meals found
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearPantry}
                >
                  Clear all
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={cuisine}
          onChange={(e) => { setCuisine(e.target.value); setCursor(undefined); }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Cuisines</option>
          {CUISINE_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={fastingType}
          onChange={(e) => { setFastingType(e.target.value); setCursor(undefined); }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Fasting Types</option>
          {Object.entries(FASTING_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <CardLoader />
      ) : displayMeals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No meals found</p>
          {hasFilters && (
            <Button variant="link" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayMeals.map((meal) => (
              <Link key={meal.id} href={`/meal/${meal.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
                  {meal.imageUrl ? (
                    <img 
                      src={meal.imageUrl} 
                      alt={meal.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center">
                      <ChefHat className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <CardContent className="p-3 space-y-2">
                    <h3 className="font-medium text-card-foreground line-clamp-1">{meal.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{meal.cuisineTag}</span>
                      <Badge className={`text-xs ${
                        meal.fastingType === "strict" ? "bg-[#722F37] text-white" :
                        meal.fastingType === "regular" ? "bg-[#C9A96E] text-white" :
                        "bg-[#4A7C59] text-white"
                      }`}>
                        {meal.fastingType === "both" ? "All" : meal.fastingType === "strict" ? "Strict" : "Regular"}
                      </Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {meal.prepTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meal.prepTime}m
                        </span>
                      )}
                      {meal.cookTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meal.cookTime}m
                        </span>
                      )}
                      {meal.servings && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {meal.servings}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {mealsData?.nextCursor && !showPantry && (
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline"
                onClick={() => setCursor(undefined)}
                disabled={!cursor}
              >
                First
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCursor(mealsData?.nextCursor)}
              >
                <ChevronRight className="h-4 w-4" />
                More
              </Button>
            </div>
          )}
        </>
      )}

      {isFetching && !isLoading && (
        <div className="text-center text-sm text-muted-foreground py-2">
          Updating...
        </div>
      )}
    </div>
  );
}