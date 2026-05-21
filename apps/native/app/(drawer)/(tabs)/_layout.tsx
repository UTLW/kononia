import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { RAW_COLORS } from "@kononia/ui/lib/constants";

const COLORS = RAW_COLORS;

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) {
        router.replace("/signin");
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: themeColorBackground,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          color: COLORS.primary,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: themeColorBackground,
          borderTopColor: RAW_COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: themeColorForeground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ⲔⲞⲚⲞⲚⲒⲀ",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="snacks"
        options={{
          title: "Snacks",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="nutrition" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
