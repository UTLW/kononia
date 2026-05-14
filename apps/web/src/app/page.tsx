"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent } from "@kononia/ui/components/card";
import { PublicNav } from "@/components/public-nav";
import { Logo } from "@/components/logo";

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen">
        <PublicNav />
        <div className="container mx-auto flex items-center justify-center py-20 px-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen">
        <PublicNav />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo size="xl" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Welcome to ⲔⲞⲚⲞⲚⲒⲀ</h1>
            <p className="text-muted-foreground mb-8">Your Orthodox fasting companion</p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline">View Calendar</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PublicNav />
      
      <main className="container mx-auto px-4">
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="xl" />
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Orthodox Christian Family Fasting Companion
          </p>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Track liturgical fasting days, find recipes for fasting periods, 
            and follow the Coptic Orthodox tradition of fasting.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signin">
              <Button>Get Started</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline">Learn More</Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <h2 className="font-serif text-2xl text-center mb-10">Features</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="font-medium mb-2">Fasting Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Track liturgical seasons and fasting days with Coptic calendar integration
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="font-medium mb-2">Fasting Recipes</h3>
                <p className="text-sm text-muted-foreground">
                  Browse Orthodox fasting-friendly meals and snacks for every fasting type
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-medium mb-2">Available Everywhere</h3>
                <p className="text-sm text-muted-foreground">
                  Access on web and mobile - your fasting data syncs across all devices
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center bg-fast-regular text-white rounded-xl mb-10 max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl mb-4">Start Your Fasting Journey</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Join families around the world who use ⲔⲞⲚⲞⲚⲒⲀ to follow the 
            Coptic Orthodox fasting tradition.
          </p>
          <Link href="/signin">
            <Button className="bg-white text-primary hover:bg-white/90">
              Sign Up Free
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 ⲔⲞⲚⲞⲚⲒⲀ. Following the Coptic Orthodox tradition.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}