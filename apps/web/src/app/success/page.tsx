"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent } from "@kononia/ui/components/card";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export default function SuccessPage() {
  const [customerState, setCustomerState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authClient.customer
      .state()
      .then(({ data }) => {
        setCustomerState(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const isSubscribed = customerState?.subscriptions?.some(
    (sub: { status: string }) => sub.status === "active"
  );

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <Card>
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="font-serif text-2xl text-foreground">Payment Successful!</h1>
            
            <p className="text-muted-foreground">
              Thank you for subscribing to KONONIA Pro. You now have full access to all premium features.
            </p>

            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying subscription...</span>
              </div>
            ) : isSubscribed ? (
              <div className="space-y-4 w-full pt-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-primary font-medium">Pro Member</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your subscription is active
                  </p>
                </div>
                
                <div className="space-y-2 text-left text-sm text-muted-foreground">
                  <p>✓ Unlimited meal planning</p>
                  <p>✓ Weekly shopping list export</p>
                  <p>✓ Push notifications for fast days</p>
                  <p>✓ Unlimited calendar history</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your subscription is being processed. Please check your email for confirmation.
              </p>
            )}
          </div>
        </CardContent>
        
        <div className="px-6 pb-6">
          <Link href="/settings" className="block">
            <Button className="w-full">
              Go to Settings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mt-6 text-center">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}