"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent } from "@kononia/ui/components/card";
import { PublicNav } from "@/components/public-nav";
import { ModeToggle } from "@/components/mode-toggle";

export default function HomePage() {
  const { data: session, isLoading } = authClient.useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PublicNav />
        <div className="container flex items-center justify-center py-20">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (session) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  return (
    <div className="min-h-screen">
      <PublicNav />
      
      <main className="container">
        {/* Hero */}
        <section className="py-20 text-center">
          <h1 className="font-serif text-5xl mb-4 text-foreground">ⲔⲞⲚⲞⲚⲒⲀ</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Orthodox Christian Family Fasting Companion
          </p>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Track liturgical fasting days, find recipes for fasting periods, 
            and follow the Coptic Orthodox tradition of fasting.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <h2 className="font-serif text-2xl text-center mb-10">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
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
        <section className="py-16 text-center bg-fast-regular text-white rounded-xl mb-10">
          <h2 className="font-serif text-2xl mb-4">Start Your Fasting Journey</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Join families around the world who use ⲔⲞⲚⲞⲚⲒⲀ to follow the 
            Coptic Orthodox fasting tradition.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/">Sign Up Free</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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