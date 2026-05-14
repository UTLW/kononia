"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SidebarProvider } from "@kononia/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Spinner } from "@/components/spinner";

const publicPaths = ["/", "/about", "/pricing", "/signin", "/signup"];

export function ClientAuthCheck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isPending) {
      if (!session && pathname === "/dashboard") {
        router.push("/signin");
      }
      if (session && (pathname === "/signin" || pathname === "/signup")) {
        router.push("/dashboard");
      }
    }
  }, [mounted, isPending, session, pathname, router]);

  if (!mounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" text="Loading..." />
      </div>
    );
  }

  const isPublicPath = publicPaths.includes(pathname);
  const isAuthenticated = !!session;

  if (isAuthenticated && !isPublicPath) {
    return (
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarProvider>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}