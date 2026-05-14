"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kononia/ui/components/card";
import { Label } from "@kononia/ui/components/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const { data: user } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!session,
  });
  const [isUpgrading, setIsUpgrading] = useState(false);

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
      const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/checkout/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await result.json();
      console.log("Checkout response:", result.status, data);
      if (!result.ok) {
        toast.error(data.error || `Error: ${result.status}`);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
      toast.error("Failed to create checkout. Please try again.");
    } finally {
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
            {user?.plan === "annual" ? (
              <p className="mt-3 text-primary font-medium">You are subscribed!</p>
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