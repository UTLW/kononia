"use client";

import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import { Button } from "@kononia/ui/components/button";
import { Badge } from "@kononia/ui/components/badge";
import { Checkbox } from "@kononia/ui/components/checkbox";
import { Input } from "@kononia/ui/components/input";
import { Label } from "@kononia/ui/components/label";
import { CardLoader } from "@/components/spinner";
import { ArrowLeft, Clock, Users, ChefHat, CalendarPlus } from "lucide-react";
import { Card, CardContent } from "@kononia/ui/components/card";
import { FASTING_COLORS, MEAL_TYPES } from "@kononia/ui/lib/constants";
import { toast } from "sonner";
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

const FASTING_TYPE_COLORS: Record<string, string> = {
  strict: `${FASTING_COLORS.strict.bg} ${FASTING_COLORS.strict.text}`,
  regular: `${FASTING_COLORS.regular.bg} ${FASTING_COLORS.regular.text}`,
  both: `${FASTING_COLORS.feast.bg} ${FASTING_COLORS.feast.text}`,
};

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: meal, isLoading } = trpc.meals.get.useQuery({ id });
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState(new Date().toISOString().split("T")[0]);
  const [planMealType, setPlanMealType] = useState("lunch");

  const createMealPlan = trpc.mealPlan.create.useMutation({
    onSuccess: () => {
      setPlanOpen(false);
      toast.success("Meal added to your plan!");
    },
    onError: () => {
      toast.error("Failed to add meal to plan");
    },
  });

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
          <div className="flex items-center gap-2">
            <Badge className={`text-sm w-fit ${fastingColor}`}>
              {fastingLabel}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setPlanOpen(true)}>
              <CalendarPlus className="h-4 w-4 mr-1" />
              Plan
            </Button>
          </div>
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

      <Credenza open={planOpen} onOpenChange={setPlanOpen}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Plan This Meal</CredenzaTitle>
            <CredenzaDescription>
              Choose a date and meal type to add {meal.name} to your plan
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Meal Type</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {MEAL_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={planMealType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPlanMealType(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </CredenzaBody>
          <CredenzaFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMealPlan.mutate({ date: planDate, mealId: id, mealType: planMealType as "breakfast" | "lunch" | "dinner" | "snack" })}>
              Add to Plan
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </div>
  );
}