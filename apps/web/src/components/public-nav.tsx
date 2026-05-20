"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@kononia/ui/components/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";

const publicLinks = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

export function PublicNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (session) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link href="/dashboard">
              <Button size="sm">Open App</Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center px-4">
        <Link href="/">
          <Logo size="sm" />
        </Link>

        <nav className="hidden md:flex flex-1 justify-center gap-8">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Link href="/signin">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>

        <div className="flex items-center md:hidden ml-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="p-2 rounded-md hover:bg-accent">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    className="text-lg font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/signin" onClick={() => setMobileOpen(false)}>
                  <Button className="mt-4 w-full">Sign In</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}