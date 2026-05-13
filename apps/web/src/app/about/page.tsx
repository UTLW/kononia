import { PublicNav } from "@/components/public-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@kononia/ui/components/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      
      <main className="container py-12 max-w-3xl">
        <h1 className="font-serif text-3xl mb-8 text-center">About ⲔⲞⲚⲞⲚⲒⲀ</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            ⲔⲞⲚⲞⲚⲒⲀ (KONONIA) is an Orthodox Christian family fasting companion app 
            designed to help families follow the traditional fasting practices of the 
            Coptic Orthodox Church.
          </p>

          <p>
            The word "KONONIA" (ⲔⲞⲚⲞⲚⲒⲀ) means communion or fellowship in Coptic - 
            representing our desire to be in communion with God and each other 
            through the practice of fasting.
          </p>

          <h2 className="font-serif text-xl text-foreground pt-4">Our Mission</h2>
          <p>
            We believe that fasting is a spiritual discipline that strengthens our 
            relationship with God. Our goal is to make it easier for families to 
            observe the traditional fasting days by providing:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Accurate liturgical calendar based on Coptic traditions</li>
            <li>Fasting-friendly recipes for all seasons</li>
            <li>A simple way to track fasting days</li>
            <li>Educational content about the meaning of fasting</li>
          </ul>

          <h2 className="font-serif text-xl text-foreground pt-4">The Fasting Tradition</h2>
          <p>
            The Coptic Orthodox Church observes several fasting periods throughout 
            the year, including Great Lent, Advent (Nativity Fast), the Apostles' 
            Fast, and the Dormition Fast. Each period has its own specific rules 
            and traditions.
          </p>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Join Our Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We welcome Orthodox Christians and anyone interested in learning more 
                about the fasting tradition. Sign up today to start your journey!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}