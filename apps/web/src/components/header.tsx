"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  
  const publicLinks = [
    { to: "/", label: "ⲔⲞⲚⲞⲚⲒⲀ" },
  ] as const;

  const authLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/meals", label: "Meals" },
    { to: "/snacks", label: "Snacks" },
    { to: "/settings", label: "Settings" },
  ] as const;

  const links = session ? authLinks : publicLinks;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-4 py-2 bg-card border-b">
        <nav className="flex gap-6 text-md font-medium">
          {links.map(({ to, label }) => {
            return (
              <Link 
                key={to} 
                href={to}
                className="text-foreground hover:text-primary transition-colors"
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}