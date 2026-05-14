import { useState } from "react";
import { useThemeColor } from "heroui-native";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { Container } from "@/components/container";
import { trpc } from "@/utils/trpc";

const COLORS = {
  primary: "#722F37",
  secondary: "#4A7C59",
  accent: "#C9A96E",
  background: "#FDF8F3",
  card: "#FAF5ED",
};

export default function SnacksTab() {
  const router = useRouter();
  const themeColorForeground = useThemeColor("foreground");

  const { data: snacks, isLoading } = trpc.meals.getAllSnacks.useQuery();

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <Container className="p-4">
        <Text className="font-semibold text-xl mb-4" style={{ color: themeColorForeground }}>
          Snacks
        </Text>
        
        <Text className="text-sm opacity-70 mb-4">
          Quick fasting-friendly snacks for in-between meals
        </Text>

        {isLoading ? (
          <Text className="text-muted-foreground">Loading...</Text>
        ) : snacks && snacks.length > 0 ? (
          <View className="space-y-3">
            {snacks.map((snack) => (
              <TouchableOpacity 
                key={snack.id}
                className="rounded-lg border p-4"
                style={{ backgroundColor: COLORS.card }}
                onPress={() => router.push(`/meal/${snack.id}`)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium" style={{ color: themeColorForeground }}>
                      {snack.name}
                    </Text>
                    {snack.ingredients && (
                      <Text className="text-sm opacity-70 mt-1" numberOfLines={2}>
                        {snack.ingredients}
                      </Text>
                    )}
                  </View>
                  <View 
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: COLORS.accent }}
                  >
                    <Text className="text-white text-xs">{snack.fastingType}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text className="text-muted-foreground text-center py-8">
            No snacks available
          </Text>
        )}
      </Container>
    </ScrollView>
  );
}