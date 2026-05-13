import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import React, { useCallback } from "react";
import { Pressable, Text } from "react-native";

import { ThemeToggle } from "@/components/theme-toggle";

const COLORS = {
  primary: "#722F37",
};

function DrawerLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

  return (
    <Drawer
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerStyle: { backgroundColor: themeColorBackground },
        headerTitleStyle: {
          fontWeight: "600",
          color: COLORS.primary,
        },
        headerRight: renderThemeToggle,
        drawerStyle: { backgroundColor: themeColorBackground },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: themeColorForeground,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "ⲔⲞⲚⲞⲚⲒⲀ",
          drawerLabel: ({ focused, color }) => (
            <Text style={{ color: focused ? COLORS.primary : color }}>Home</Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={focused ? COLORS.primary : color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "About",
          drawerLabel: ({ color }) => (
            <Text style={{ color }}>About</Text>
          ),
          drawerIcon: ({ size, color }) => (
            <Ionicons
              name="information-circle-outline"
              size={size}
              color={color}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable className="mr-4">
                <Ionicons name="add-outline" size={24} color={COLORS.primary} />
              </Pressable>
            </Link>
          ),
        }}
      />
    </Drawer>
  );
}

export default DrawerLayout;
