import type { AppRouter } from "@kononia/api/routers/index";
import { env } from "@kononia/env/web";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
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

const queryClient = getQueryClient();

export const trpc = createTRPCReact<AppRouter>({
  config: () => ({
    links: [
      httpBatchLink({
        url: `${env.NEXT_PUBLIC_SERVER_URL}/trpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  }),
  queryClient,
});

export { queryClient };