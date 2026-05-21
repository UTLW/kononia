"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import { Button } from "@kononia/ui/components/button";
import { Badge } from "@kononia/ui/components/badge";
import { CardLoader } from "@/components/spinner";
import { ArrowLeft, CalendarPlus, ChefHat } from "lucide-react";
import { FASTING_COLORS, MEAL_TYPES } from "@kononia/ui/lib/constants";
import { toast } from "sonner";
import { Input } from "@kononia/ui/components/input";
import { Label } from "@kononia/ui/components/label";
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
};

const FASTING_TYPE_COLORS: Record<string, string> = {
  strict: `${FASTING_COLORS.strict.bg} ${FASTING_COLORS.strict.text}`,
  regular: `${FASTING_COLORS.regular.bg} ${FASTING_COLORS.regular.text}`,
};

export default function SnackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: snack, isLoading } = trpc.meals.getSnackById.useQuery({ id });
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState(new Date().toISOString().split("T")[0]);
  const [planMealType, setPlanMealType] = useState("snack");

  const createMealPlan = trpc.mealPlan.create.useMutation({
    onSuccess: () => {
      setPlanOpen(false);
      toast.success("Snack added to your plan!");
    },
    onError: () => {
      toast.error("Failed to add snack to plan");
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <CardLoader />
      </div>
    );
  }

  if (!snack) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-muted-foreground mb-4">Snack not found</p>
        <Link href="/snacks">
          <Button variant="outline">Back to Snacks</Button>
        </Link>
      </div>
    );
  }

  const fastingLabel = FASTING_TYPE_LABELS[snack.fastingType] || snack.fastingType;
  const fastingColor = FASTING_TYPE_COLORS[snack.fastingType] || "bg-secondary";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Link href="/snacks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Snacks
      </Link>

      {snack.imageUrl ? (
        <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
          <Image
            src={snack.imageUrl}
            alt={snack.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
          />
      </div>
      {snack.description && (
        <p className="text-foreground leading-relaxed">{snack.description}</p>
      )}

      <Credenza open={planOpen} onOpenChange={setPlanOpen}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Plan This Snack</CredenzaTitle>
            <CredenzaDescription>
              Choose a date and meal type to add {snack.name} to your plan
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