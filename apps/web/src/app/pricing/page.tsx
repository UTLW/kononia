import { PublicNav } from "@/components/public-nav";
import { Button } from "@kononia/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@kononia/ui/components/card";
import { Check } from "lucide-react";

const freeFeatures = [
  "Fasting calendar access",
  "Basic meal recipes",
  "Coptic calendar integration",
  "Mobile web access",
];

const proFeatures = [
  ...freeFeatures,
  "Unlimited meal planning",
  "Weekly shopping list export",
  "Push notifications for fast days",
  "Unlimited calendar history",
  "Offline access",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      
      <main className="container mx-auto py-12 px-4">
        <h1 className="font-serif text-3xl text-center mb-4">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Choose the plan that works best for your family. All plans include access to our core fasting features.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For individuals and families just starting</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" variant="outline">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-primary">Annual</CardTitle>
              <CardDescription>For families who want the full experience</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/year</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6">
                Upgrade to Annual
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="font-serif text-xl mb-4">Questions?</h2>
          <p className="text-muted-foreground mb-4">
            Contact us at support@kononia.app if you have any questions about our pricing.
          </p>
        </div>
      </main>
    </div>
  );
}