"use client";

import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { Badge } from "@kononia/ui/components/badge";
import { CardLoader } from "@/components/spinner";

export default function SnacksPage() {
  const { data: snacks, isLoading } = trpc.meals.getSnacks.useQuery({});

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <CardLoader />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-serif text-2xl mb-6 text-foreground">Snack Guide</h1>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {snacks?.map((snack) => (
          <Link key={snack.id} href={`/snacks/${snack.id}`}>
            <div className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              {snack.imageUrl && (
                <img 
                  src={snack.imageUrl} 
                  alt={snack.name}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-medium text-card-foreground">{snack.name}</h3>
                <p className="text-sm text-muted-foreground">{snack.cuisine}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{snack.description}</p>
                <Badge className={`mt-2 text-xs ${
                  snack.fastingType === "strict" ? "bg-[#722F37] text-white" :
                  "bg-[#C9A96E] text-white"
                }`}>
                  {snack.fastingType === "strict" ? "Strict Fast" : "Regular Fast"}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
        {(!snacks || snacks.length === 0) && (
          <p className="col-span-full text-center py-8 text-muted-foreground">
            No snacks found
          </p>
        )}
      </div>
    </div>
  );
}