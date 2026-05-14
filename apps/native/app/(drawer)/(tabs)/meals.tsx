import { useState } from "react";
import { useThemeColor } from "heroui-native";
import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
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

const FASTING_TYPES = [
  { value: "all", label: "All" },
  { value: "strict", label: "Strict" },
  { value: "regular", label: "Regular" },
  { value: "both", label: "Feast" },
];

export default function MealsTab() {
  const router = useRouter();
  const themeColorForeground = useThemeColor("foreground");
  const [selectedType, setSelectedType] = useState("all");

  const { data: fastDay } = trpc.calendar.getTodayFastDay.useQuery();
  const { data: meals } = trpc.meals.list.useQuery({ 
    fastingType: selectedType === "all" 
      ? (fastDay?.fastingType || "regular")
      : selectedType as any,
    limit: 50,
  });

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <Container className="p-4">
        <Text className="font-semibold text-xl mb-4" style={{ color: themeColorForeground }}>
          Meals
        </Text>

        <View className="flex-row gap-2 mb-4">
          {FASTING_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              className={`px-4 py-2 rounded-full ${
                selectedType === type.value ? "" : "border"
              }`}
              style={{
                backgroundColor: selectedType === type.value ? COLORS.primary : "transparent",
                borderColor: COLORS.primary,
              }}
              onPress={() => setSelectedType(type.value)}
            >
              <Text
                className={`text-sm ${
                  selectedType === type.value ? "text-white" : ""
                }`}
                style={{
                  color: selectedType === type.value ? "white" : COLORS.primary,
                }}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row flex-wrap gap-3">
          {meals?.map((meal) => (
            <TouchableOpacity 
              key={meal.id}
              className="rounded-lg border overflow-hidden"
              style={{ backgroundColor: COLORS.card, width: "47%" }}
              onPress={() => router.push(`/meal/${meal.id}`)}
            >
              {meal.imageUrl && (
                <Image 
                  source={{ uri: meal.imageUrl }} 
                  className="w-full h-28"
                  resizeMode="cover"
                />
              )}
              <View className="p-3">
                <Text className="font-medium text-sm" style={{ color: themeColorForeground }} numberOfLines={2}>
                  {meal.name}
                </Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <View 
                    className="px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: meal.fastingType === "strict" ? COLORS.secondary : 
                                       meal.fastingType === "regular" ? COLORS.accent : COLORS.primary 
                    }}
                  >
                    <Text className="text-white text-xs capitalize">{meal.fastingType}</Text>
                  </View>
                </View>
                {meal.cuisineTag && (
                  <Text className="text-xs opacity-70 mt-1">{meal.cuisineTag}</Text>
                )}
              </View>
            </TouchableOpacity>
          )) || (
            <View className="w-full py-8 text-center">
              <Text className="text-muted-foreground text-center">No meals found</Text>
            </View>
          )}
        </View>
      </Container>
    </ScrollView>
  );
}