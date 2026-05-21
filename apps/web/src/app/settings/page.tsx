"use client";

import { useState, useEffect, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kononia/ui/components/card";
import { Label } from "@kononia/ui/components/label";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";

function SuccessModal() {
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
    <Credenza open onOpenChange={() => {}}>
      <CredenzaContent>
        <CredenzaHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CredenzaTitle>Payment Successful!</CredenzaTitle>
          <CredenzaDescription>
            Thank you for subscribing to KONONIA Pro
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying subscription...</span>
            </div>
          ) : isSubscribed ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-primary font-medium">Pro Member</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your subscription is active
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Unlimited meal planning
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Weekly shopping list export
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Push notifications for fast days
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Unlimited calendar history
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Your subscription is being processed. Please check your email for confirmation.
            </p>
          )}
        </CredenzaBody>
        <CredenzaFooter>
          <CredenzaClose asChild>
            <Button variant="outline">Close</Button>
          </CredenzaClose>
          <Button onClick={() => authClient.customer.portal()}>
            Manage Subscription
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";
  const { data: session, isPending } = authClient.useSession();
  const { data: user } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!session,
  });
  const [customerState, setCustomerState] = useState<any>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (session) {
      setIsLoadingCustomer(true);
      authClient.customer
        .state()
        .then(({ data }) => {
          setCustomerState(data);
        })
        .catch(console.error)
        .finally(() => setIsLoadingCustomer(false));
    }
  }, [session]);

  const isSubscribed = customerState?.subscriptions?.some(
    (sub: { status: string }) => sub.status === "active"
  );

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sync/coptic`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Sync failed: ${res.status}`);
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Synced ${data.fastingDaysCount} fasting days and ${data.seasonsCount} seasons`);
    },
    onError: (error) => {
      console.error("Sync error:", error);
      toast.error(error.message || "Sync failed. Check server logs for details.");
    },
  });

  const handleUpgrade = async () => {
    if (!session) {
      window.location.href = "/signin";
      return;
    }
    setIsUpgrading(true);
    try {
      await authClient.checkout({
        slug: "Pro-(Annual)",
      });
    } catch (error) {
      console.error("Failed to create checkout:", error);
      toast.error("Failed to create checkout. Please try again.");
      setIsUpgrading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl mb-6 text-foreground">Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : session ? (
            <div className="space-y-3">
              <div>
                <Label>Email</Label>
                <p className="text-foreground">{user?.email || session.user.email}</p>
              </div>
              <div>
                <Label>Display Name</Label>
                <p className="text-foreground">{user?.displayName || user?.name || session.user.name}</p>
              </div>
              <div>
                <Label>Timezone</Label>
                <p className="text-foreground">{user?.timezone || "America/New_York"}</p>
              </div>
              <div>
                <Label>Plan</Label>
                <p className="text-foreground capitalize">{user?.plan || "free"}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">Not logged in</p>
              <Link href="/signin">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-secondary p-4">
            <h3 className="font-medium text-secondary-foreground">Free Plan</h3>
            <p className="text-sm text-secondary-foreground mt-1">
              Basic access to calendar and meals
            </p>
          </div>
          <div className="rounded-md border-2 border-primary p-4">
            <h3 className="font-medium text-foreground">Annual Plan - $9.99/year</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>✓ Unlimited meal planning</li>
              <li>✓ Weekly shopping list export</li>
              <li>✓ Push notifications for fast days</li>
              <li>✓ Unlimited calendar history</li>
            </ul>
            {isSubscribed ? (
              <div className="mt-3 space-y-2">
                <p className="text-primary font-medium">You are subscribed!</p>
                <Button 
                  variant="outline" 
                  onClick={() => authClient.customer.portal()}
                >
                  Manage Subscription
                </Button>
              </div>
            ) : (
              <Button 
                className="mt-3" 
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? "Creating Checkout..." : session ? "Upgrade to Annual" : "Sign in to Upgrade"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Sync liturgical calendar data from Coptic.io API
            </p>
            <Button 
              variant="outline" 
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? "Syncing..." : "Sync Coptic Data"}
            </Button>
            {syncMutation.isError && (
              <p className="text-xs text-red-500">
                Last sync failed. The API may be unavailable.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ⲔⲞⲚⲞⲚⲒⲀ - Orthodox Christian Family Fasting Companion
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Following the Coptic Orthodox tradition of fasting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <Suspense fallback={<div className="container mx-auto px-4 py-6">Loading...</div>}>
        <SettingsContent />
      </Suspense>
      <Suspense>
        <SuccessModalWrapper />
      </Suspense>
    </>
  );
}

function SuccessModalWrapper() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";
  
  if (!showSuccess) return null;
  
  return <SuccessModal />;
}