"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import { Button } from "@kononia/ui/components/button";
import { Badge } from "@kononia/ui/components/badge";
import { Card, CardContent } from "@kononia/ui/components/card";
import { CardLoader } from "@/components/spinner";
import { ArrowLeft, ChefHat } from "lucide-react";
import { FASTING_COLORS } from "@kononia/ui/lib/constants";

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
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mb-6">
          <ChefHat className="h-14 w-14 text-muted-foreground/30" />
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground">{snack.name}</h1>
          <Badge className={`text-sm w-fit ${fastingColor}`}>
            {fastingLabel}
          </Badge>
        </div>

        <p className="text-lg text-muted-foreground">{snack.cuisine}</p>
        
        {snack.description && (
          <p className="text-foreground leading-relaxed">{snack.description}</p>
        )}
      </div>
    </div>
  );
}