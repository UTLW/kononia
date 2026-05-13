"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kononia/ui/components/card";
import { Label } from "@kononia/ui/components/label";

export default function SettingsPage() {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const { data: user } = trpc.user.getProfile.useQuery();

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sync/coptic`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Sync failed");
      return res.json();
    },
  });

  const handleUpgrade = async () => {
    if (!session) {
      authClient.signIn.email();
      return;
    }
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/polar-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await result.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
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
          {session.data ? (
            <div className="space-y-3">
              <div>
                <Label>Email</Label>
                <p className="text-foreground">{user?.email || session.data.user.email}</p>
              </div>
              <div>
                <Label>Display Name</Label>
                <p className="text-foreground">{user?.displayName || user?.name || session.data.user.name}</p>
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
              <Button onClick={() => signIn()}>Sign In</Button>
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
              <Button className="mt-3" onClick={handleUpgrade}>
                {session ? "Upgrade to Annual" : "Sign in to Upgrade"}
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
            {syncMutation.isSuccess && (
              <p className="text-sm text-green-600">Sync completed!</p>
            )}
            {syncMutation.isError && (
              <p className="text-sm text-red-600">Sync failed. Try again.</p>
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