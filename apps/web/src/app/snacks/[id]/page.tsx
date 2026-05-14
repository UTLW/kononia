"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { Button } from "@kononia/ui/components/button";
import { Badge } from "@kononia/ui/components/badge";
import { CardLoader } from "@/components/spinner";
import { ArrowLeft } from "lucide-react";

export default function SnackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: snack, isLoading } = trpc.meals.getSnack.useQuery({ id });

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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Link href="/snacks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Snacks
      </Link>

      {snack.imageUrl && (
        <img 
          src={snack.imageUrl} 
          alt={snack.name}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <div className="flex items-center gap-3 mb-4">
        <h1 className="font-serif text-3xl text-foreground">{snack.name}</h1>
        <Badge className={`text-sm ${
          snack.fastingType === "strict" ? "bg-[#722F37] text-white" :
          "bg-[#C9A96E] text-white"
        }`}>
          {snack.fastingType === "strict" ? "Strict Fast" : "Regular Fast"}
        </Badge>
      </div>

      <p className="text-muted-foreground mb-4">{snack.cuisine}</p>
      
      {snack.description && (
        <p className="text-foreground">{snack.description}</p>
      )}
    </div>
  );
}