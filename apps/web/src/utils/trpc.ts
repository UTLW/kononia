import type { AppRouter } from "@kononia/api/routers/index";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
