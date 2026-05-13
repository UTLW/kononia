"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@kononia/ui/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { 
  Home, 
  Calendar, 
  UtensilsCrossed, 
  Salad, 
  Settings, 
  LogOut,
  BookOpen
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/snacks", label: "Snacks", icon: Salad },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  if (!session) return null;

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="font-serif text-xl text-primary">
          ⲔⲞⲚⲞⲚⲒⲀ
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => authClient.signOut()}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}