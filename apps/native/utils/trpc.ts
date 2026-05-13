import type { AppRouter } from "@kononia/api/routers/index";
import { createTRPCReact } from "@trpc/tanstack-react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

const EXPO_PUBLIC_SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${EXPO_PUBLIC_SERVER_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: Platform.OS === "web" ? "include" : "omit",
        });
      },
    }),
  ],
});
