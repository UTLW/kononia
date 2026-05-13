"use client";

import dynamic from "next/dynamic";
import { Toaster } from "@kononia/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { getQueryClient, TRPCProvider, trpcClient } from "@/utils/trpc";

const ThemeProvider = dynamic(
  () => import("./theme-provider").then((mod) => mod.ThemeProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider client={trpcClient} queryClient={queryClient}>
          {children}
          <ReactQueryDevtools />
        </TRPCProvider>
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
