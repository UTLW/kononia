import type { AppRouter } from "@kononia/api/routers/index";
import { env } from "@kononia/env/web";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { httpBatchLink } from "@trpc/client";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

const trpcClient = {
  query: async (path: string, input?: unknown) => {
    const url = `${env.NEXT_PUBLIC_SERVER_URL}/trpc/${path}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "include",
    });
    if (!response.ok) throw new Error(`TRPC error: ${response.statusText}`);
    const json = await response.json();
    return json.result?.data;
  },
};

const queryClient = getQueryClient();

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient as any,
  queryClient,
});

export { queryClient };