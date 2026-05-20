"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import { Button } from "@kononia/ui/components/button";
import { Badge } from "@kononia/ui/components/badge";
import { Checkbox } from "@kononia/ui/components/checkbox";
import { CardLoader } from "@/components/spinner";
import { ArrowLeft, Clock, Users, ChefHat } from "lucide-react";
import { Card, CardContent } from "@kononia/ui/components/card";

const FASTING_TYPE_LABELS: Record<string, string> = {
  strict: "Strict Fast",
  regular: "Regular Fast",
  both: "All Types",
};

const FASTING_TYPE_COLORS: Record<string, string> = {
  strict: "bg-[#722F37] text-white",
  regular: "bg-[#C9A96E] text-white",
  both: "bg-[#4A7C59] text-white",
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
  const fastingColor = FASTING_TYPE_COLORS[meal.fastingType] || "bg-secondary";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Link href="/meals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Meals
      </Link>

      {meal.imageUrl ? (
        <div className="relative w-full h-80 rounded-xl overflow-hidden mb-6">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mb-6">
          <ChefHat className="h-16 w-16 text-muted-foreground/30" />
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground">{meal.name}</h1>
          <Badge className={`text-sm w-fit ${fastingColor}`}>
            {fastingLabel}
          </Badge>
        </div>

        {meal.cuisineTag && (
          <p className="text-lg text-muted-foreground">{meal.cuisineTag}</p>
        )}
        
        {meal.description && (
          <p className="text-foreground leading-relaxed">{meal.description}</p>
        )}

        <div className="flex flex-wrap gap-6">
          {meal.prepTime && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>Prep: {meal.prepTime} min</span>
            </div>
          )}
          {meal.cookTime && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>Cook: {meal.cookTime} min</span>
            </div>
          )}
          {meal.servings && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{meal.servings} servings</span>
            </div>
          )}
        </div>

        {meal.ingredients && meal.ingredients.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-serif text-xl mb-4 text-foreground">Ingredients</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Checkbox id={`ing-${i}`} />
                    <label htmlFor={`ing-${i}`} className="text-foreground cursor-pointer hover:text-primary transition-colors">
                      {ing.ingredient}
                    </label>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {meal.steps && meal.steps.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-serif text-xl mb-4 text-foreground">Instructions</h2>
              <ol className="space-y-4">
                {meal.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {step.stepNumber}
                    </span>
                    <span className="text-foreground leading-relaxed pt-1">{step.instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {meal.tags && meal.tags.length > 0 && (
          <div>
            <h2 className="font-serif text-xl mb-3 text-foreground">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {meal.tags.map((tag, i) => (
                <span key={i} className="text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full">
                  {tag.tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}