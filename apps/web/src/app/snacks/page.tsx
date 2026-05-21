"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { Badge } from "@kononia/ui/components/badge";
import { Button } from "@kononia/ui/components/button";
import { CardLoader } from "@/components/spinner";
import { FASTING_COLORS } from "@kononia/ui/lib/constants";
import { ExternalLink } from "lucide-react";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
} from "@/components/credenza";

export default function SnacksPage() {
  const { data: snacks, isLoading } = trpc.meals.getSnacks.useQuery({});
  const [previewSnackId, setPreviewSnackId] = useState<string | null>(null);
  const { data: previewSnack } = trpc.meals.getSnackById.useQuery(
    { id: previewSnackId! },
    { enabled: !!previewSnackId }
  );

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
          <div
            key={snack.id}
            className="cursor-pointer"
            onClick={() => setPreviewSnackId(snack.id)}
          >
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
                  snack.fastingType === "strict" ? `${FASTING_COLORS.strict.bg} ${FASTING_COLORS.strict.text}` :
                  `${FASTING_COLORS.regular.bg} ${FASTING_COLORS.regular.text}`
                }`}>
                  {snack.fastingType === "strict" ? "Strict Fast" : "Regular Fast"}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        {(!snacks || snacks.length === 0) && (
          <p className="col-span-full text-center py-8 text-muted-foreground">
            No snacks found
          </p>
        )}
      </div>

      <Credenza open={!!previewSnackId} onOpenChange={(open) => { if (!open) setPreviewSnackId(null); }}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>{previewSnack?.name || "Snack Preview"}</CredenzaTitle>
            {previewSnack?.cuisine && (
              <CredenzaDescription>{previewSnack.cuisine}</CredenzaDescription>
            )}
          </CredenzaHeader>
          <CredenzaBody>
            {previewSnack?.imageUrl && (
              <img
                src={previewSnack.imageUrl}
                alt={previewSnack.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            {previewSnack?.description && (
              <p className="text-sm text-muted-foreground mb-4">{previewSnack.description}</p>
            )}
            {previewSnack?.fastingType && (
              <Badge className={`text-xs ${
                previewSnack.fastingType === "strict" ? `${FASTING_COLORS.strict.bg} ${FASTING_COLORS.strict.text}` :
                `${FASTING_COLORS.regular.bg} ${FASTING_COLORS.regular.text}`
              }`}>
                {previewSnack.fastingType === "strict" ? "Strict Fast" : "Regular Fast"}
              </Badge>
            )}
          </CredenzaBody>
          <CredenzaFooter>
            <Button variant="outline" onClick={() => setPreviewSnackId(null)}>
              Close
            </Button>
            {previewSnackId && (
              <Link href={`/snacks/${previewSnackId}`}>
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Details
                </Button>
              </Link>
            )}
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </div>
  );
}