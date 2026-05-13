"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export default function SnacksPage() {
  const { data: snacks } = useQuery(trpc.meals.getSnacks.queryOptions({}));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-serif text-2xl mb-6 text-foreground">Snack Guide</h1>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {snacks?.map((snack) => (
          <div key={snack.id} className="rounded-lg border bg-card overflow-hidden">
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
              <p className="text-sm text-muted-foreground mt-1">{snack.description}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded mt-2 ${
                snack.fastingType === "strict" ? "bg-fast-strict text-white" :
                "bg-fast-regular text-white"
              }`}>
                {snack.fastingType}
              </span>
            </div>
          </div>
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