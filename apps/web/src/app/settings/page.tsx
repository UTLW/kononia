"use client";

import { trpc } from "@/utils/trpc";

export default function SettingsPage() {
  const { data: user } = trpc.user.getProfile.useQuery();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-serif text-2xl mb-6 text-foreground">Settings</h1>

      <section className="rounded-lg border bg-card p-4 mb-6">
        <h2 className="font-serif text-xl mb-4 text-card-foreground">Account</h2>
        {user ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-foreground">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Display Name</label>
              <p className="text-foreground">{user.displayName || user.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Timezone</label>
              <p className="text-foreground">{user.timezone}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Plan</label>
              <p className="text-foreground capitalize">{user.plan}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Not logged in</p>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4 mb-6">
        <h2 className="font-serif text-xl mb-4 text-card-foreground">Subscription</h2>
        <div className="space-y-4">
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
              <button className="mt-3 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                Upgrade to Annual
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="font-serif text-xl mb-4 text-card-foreground">About</h2>
        <p className="text-muted-foreground">
          ⲔⲞⲚⲞⲚⲒⲀ - Orthodox Christian Family Fasting Companion
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Following the Coptic Orthodox tradition of fasting.
        </p>
      </section>
    </div>
  );
}