import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";

const COLORS = {
  primary: "#722F37",
  secondary: "#4A7C59",
  accent: "#C9A96E",
};

export default function TabLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

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
          borderTopColor: "#E8DFD5",
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
