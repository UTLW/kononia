"use client";

import dynamic from "next/dynamic";
import { Toaster } from "@kononia/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient, trpc, trpcClient } from "@/utils/trpc";

const ThemeProvider = dynamic(
  () => import("./theme-provider").then((mod) => mod.ThemeProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools />
        </QueryClientProvider>
        <Toaster richColors />
      </ThemeProvider>
    </trpc.Provider>
  );
}
