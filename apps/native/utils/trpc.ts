import type { AppRouter } from "@kononia/api/routers/index";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000"}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: Platform.OS === "web" ? "include" : "omit",
        });
      },
    }),
  ],
});

const createQueryHook = (path: string) => {
  return (opts?: any) => {
    return useQuery({
      queryKey: [path, opts?.input],
      queryFn: async () => {
        return trpcClient.query(path, opts?.input);
      },
      ...opts,
    });
  };
};

export const trpc = {
  calendar: {
    getTodayFastDay: createQueryHook("calendar.getTodayFastDay"),
    getFastDaysInRange: createQueryHook("calendar.getFastDaysInRange"),
    getSeason: createQueryHook("calendar.getSeason"),
  },
  seasons: {
    getCurrent: createQueryHook("seasons.getCurrent"),
  },
  meals: {
    list: createQueryHook("meals.list"),
    get: createQueryHook("meals.get"),
    getSnacks: createQueryHook("meals.getSnacks"),
  },
  user: {
    getProfile: createQueryHook("user.getProfile"),
  },
};
