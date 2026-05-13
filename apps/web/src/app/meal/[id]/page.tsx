"use client";

import { use } from "react";
import { useTRPC } from "@/utils/trpc";

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const trpc = useTRPC();
  const { id } = use(params);
  const { data: meal, isLoading } = trpc.meals.get.useQuery({ id });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-6">Loading...</div>;
  }

  if (!meal) {
    return <div className="container mx-auto px-4 py-6">Meal not found</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      {meal.imageUrl && (
        <img 
          src={meal.imageUrl} 
          alt={meal.name}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <div className="flex items-center gap-3 mb-4">
        <h1 className="font-serif text-3xl text-foreground">{meal.name}</h1>
        <span className={`text-sm px-2 py-1 rounded ${
          meal.fastingType === "strict" ? "bg-fast-strict text-white" :
          meal.fastingType === "regular" ? "bg-fast-regular text-white" :
          "bg-fast-feast text-foreground"
        }`}>
          {meal.fastingType}
        </span>
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
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-foreground">{ing.ingredient}</span>
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