"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@kononia/ui/components/sheet";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

const publicLinks = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

export function PublicNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If authenticated, show nothing (sidebar handles navigation)
  if (session) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-serif text-xl text-primary">
          ⲔⲞⲚⲞⲚⲒⲀ
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild>
            <Link href="/">Sign In</Link>
          </Button>
        </nav>

        {/* Mobile nav */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-4">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}