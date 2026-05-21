"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@kononia/ui/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@kononia/ui/components/button";
import { Loader2, Home, CalendarDays, UtensilsCrossed, Salad, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/snacks", label: "Snacks", icon: Salad },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  if (!session) return null;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="py-4">
        <Link href="/dashboard" className="px-2">
          <Logo size="md" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            
            return (
              <SidebarMenuItem key={item.href}>
                <Link 
                  href={item.href as any} 
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/");
                },
              },
            });
          }}
        >
          {signingOut ? (
            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5 mr-3" />
          )}
          {signingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}