"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { Button } from "@kononia/ui/components/button";
import { Badge } from "@kononia/ui/components/badge";
import { Checkbox } from "@kononia/ui/components/checkbox";
import { CardLoader, Spinner } from "@/components/spinner";
import { ArrowLeft } from "lucide-react";

const FASTING_TYPE_LABELS: Record<string, string> = {
  strict: "Strict Fast",
  regular: "Regular Fast",
  both: "All Types",
};

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: meal, isLoading } = trpc.meals.get.useQuery({ id });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <CardLoader />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-muted-foreground mb-4">Meal not found</p>
        <Link href="/meals">
          <Button variant="outline">Back to Meals</Button>
        </Link>
      </div>
    );
  }

  const fastingLabel = FASTING_TYPE_LABELS[meal.fastingType] || meal.fastingType;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Link href="/meals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Meals
      </Link>

      {meal.imageUrl && (
        <img 
          src={meal.imageUrl} 
          alt={meal.name}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <div className="flex items-center gap-3 mb-4">
        <h1 className="font-serif text-3xl text-foreground">{meal.name}</h1>
        <Badge className={`text-sm ${
          meal.fastingType === "strict" ? "bg-[#722F37] text-white" :
          meal.fastingType === "regular" ? "bg-[#C9A96E] text-white" :
          "bg-[#4A7C59] text-white"
        }`}>
          {fastingLabel}
        </Badge>
      </div>

      <p className="text-muted-foreground mb-4">{meal.cuisineTag}</p>
      
      {meal.description && (
        <p className="text-foreground mb-6">{meal.description}</p>
      )}

      <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
        {meal.prepTime && <span>Prep: {meal.prepTime} min</span>}
        {meal.cookTime && <span>Cook: {meal.cookTime} min</span>}
        {meal.servings && <span>Servings: {meal.servings}</span>}
      </div>

      <section className="mb-8">
        <h2 className="font-serif text-xl mb-4 text-foreground">Ingredients</h2>
        <ul className="space-y-2">
          {meal.ingredients?.map((ing, i) => (
            <li key={i} className="flex items-center gap-2">
              <Checkbox id={`ing-${i}`} />
              <label htmlFor={`ing-${i}`} className="text-foreground cursor-pointer">
                {ing.ingredient}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-serif text-xl mb-4 text-foreground">Instructions</h2>
        <ol className="space-y-4">
          {meal.steps?.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                {step.stepNumber}
              </span>
              <span className="text-foreground">{step.instruction}</span>
            </li>
          ))}
        </ol>
      </section>

      {meal.tags && meal.tags.length > 0 && (
        <section>
          <h2 className="font-serif text-xl mb-4 text-foreground">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {meal.tags.map((tag, i) => (
              <span key={i} className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                {tag.tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}