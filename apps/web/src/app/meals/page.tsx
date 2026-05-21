"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Input } from "@kononia/ui/components/input";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent } from "@kononia/ui/components/card";
import { Badge } from "@kononia/ui/components/badge";
import { Label } from "@kononia/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kononia/ui/components/select";
import { Spinner, CardLoader } from "@/components/spinner";
import { toast } from "sonner";
import { Search, X, ChevronRight, ChefHat, Clock, Users, ExternalLink, SlidersHorizontal } from "lucide-react";
import { CUISINE_OPTIONS, FASTING_COLORS, QUERY_LIMITS } from "@kononia/ui/lib/constants";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
} from "@/components/credenza";

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
  const [pantryOpen, setPantryOpen] = useState(false);
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
  const [pantryInput, setPantryInput] = useState("");
  const [previewMealId, setPreviewMealId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingCuisine, setPendingCuisine] = useState("");
  const [pendingFastingType, setPendingFastingType] = useState("");
  const { data: previewMeal } = trpc.meals.get.useQuery(
    { id: previewMealId! },
    { enabled: !!previewMealId }
  );

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
    limit: QUERY_LIMITS.meals,
    cursor,
  }, {
    staleTime: 30000,
  });

  const { data: pantryMealsData, isLoading: pantryLoading } = trpc.meals.getWithIngredients.useQuery({
    ingredients: pantryIngredients,
    limit: QUERY_LIMITS.meals,
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
    setPendingCuisine("");
    setPendingFastingType("");
    setCursor(undefined);
  };

  const hasFilters = cuisine || fastingType || search;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Meals</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setPantryOpen(true)}
        >
          <ChefHat className="h-4 w-4 mr-2" />
          What's in your pantry?
        </Button>
      </div>

      <Credenza open={pantryOpen} onOpenChange={(open) => {
        if (!open) {
          setPantryOpen(false);
        }
      }}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>What's in your pantry?</CredenzaTitle>
            <CredenzaDescription>Add ingredients you have on hand to find matching meals</CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody className="space-y-4">
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
            {pantryIngredients.length > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {pantryMealsData?.matchCount || 0} matching meals found
                </p>
                <Button variant="ghost" size="sm" onClick={() => {
                  handleClearPantry();
                  setPantryOpen(false);
                }}>
                  Clear all
                </Button>
              </div>
            )}
          </CredenzaBody>
          <CredenzaFooter>
            <Button onClick={() => {
              setPantryOpen(false);
              if (pantryIngredients.length > 0) setShowPantry(true);
            }}>
              {pantryIngredients.length > 0 ? "Show Matching Meals" : "Close"}
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>

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
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setPendingCuisine(cuisine); setPendingFastingType(fastingType); setFilterOpen(true); }}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasFilters && (
            <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] w-4 h-4 flex items-center justify-center">
              {(cuisine ? 1 : 0) + (fastingType ? 1 : 0)}
            </span>
          )}
        </Button>

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
              <div
                key={meal.id}
                className="cursor-pointer"
                onClick={() => setPreviewMealId(meal.id)}
              >
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
                        meal.fastingType === "strict" ? `${FASTING_COLORS.strict.bg} ${FASTING_COLORS.strict.text}` :
                        meal.fastingType === "regular" ? `${FASTING_COLORS.regular.bg} ${FASTING_COLORS.regular.text}` :
                        `${FASTING_COLORS.feast.bg} ${FASTING_COLORS.feast.text}`
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
              </div>
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

      <Credenza open={filterOpen} onOpenChange={(open) => { if (!open) setFilterOpen(false); }}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Filters</CredenzaTitle>
            <CredenzaDescription>Filter meals by cuisine and fasting type</CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody className="space-y-4">
            <div className="space-y-2">
              <Label>Cuisine</Label>
              <Select value={pendingCuisine} onValueChange={setPendingCuisine}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Cuisines" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fasting Type</Label>
              <Select value={pendingFastingType} onValueChange={setPendingFastingType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Fasting Types" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FASTING_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CredenzaBody>
          <CredenzaFooter>
            <Button variant="ghost" onClick={() => { setPendingCuisine(""); setPendingFastingType(""); }}>
              Reset
            </Button>
            <Button onClick={() => {
              setCuisine(pendingCuisine);
              setFastingType(pendingFastingType);
              setCursor(undefined);
              setFilterOpen(false);
            }}>
              Apply Filters
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>

      <Credenza open={!!previewMealId} onOpenChange={(open) => { if (!open) setPreviewMealId(null); }}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>{previewMeal?.name || "Meal Preview"}</CredenzaTitle>
            {previewMeal?.cuisineTag && (
              <CredenzaDescription>{previewMeal.cuisineTag}</CredenzaDescription>
            )}
          </CredenzaHeader>
          <CredenzaBody>
            {previewMeal?.imageUrl && (
              <img
                src={previewMeal.imageUrl}
                alt={previewMeal.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            {previewMeal?.description && (
              <p className="text-sm text-muted-foreground mb-4">{previewMeal.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              {previewMeal?.prepTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Prep: {previewMeal.prepTime}m
                </span>
              )}
              {previewMeal?.cookTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Cook: {previewMeal.cookTime}m
                </span>
              )}
              {previewMeal?.servings && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {previewMeal.servings} servings
                </span>
              )}
            </div>
            {previewMeal?.fastingType && (
              <Badge className={`text-xs ${
                previewMeal.fastingType === "strict" ? `${FASTING_COLORS.strict.bg} ${FASTING_COLORS.strict.text}` :
                previewMeal.fastingType === "regular" ? `${FASTING_COLORS.regular.bg} ${FASTING_COLORS.regular.text}` :
                `${FASTING_COLORS.feast.bg} ${FASTING_COLORS.feast.text}`
              }`}>
                {previewMeal.fastingType === "strict" ? "Strict Fast" : previewMeal.fastingType === "regular" ? "Regular Fast" : "All Types"}
              </Badge>
            )}
          </CredenzaBody>
          <CredenzaFooter>
            <Button variant="outline" onClick={() => setPreviewMealId(null)}>
              Close
            </Button>
            {previewMealId && (
              <Link href={`/meal/${previewMealId}`}>
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Recipe
                </Button>
              </Link>
            )}
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </div>
  );
}