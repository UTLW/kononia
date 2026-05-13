import { use } from "react";
import { useThemeColor } from "heroui-native";
import { Text, View, ScrollView, Image } from "react-native";
import { Stack } from "expo-router";

import { trpc } from "@/utils/trpc";

const COLORS = {
  primary: "#722F37",
  secondary: "#4A7C59",
  accent: "#C9A96E",
  background: "#FDF8F3",
  card: "#FAF5ED",
};

export default function MealDetailScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const themeColorForeground = useThemeColor("foreground");
  
  const { data: meal, isLoading } = trpc.meals.get.useQuery({ id });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!meal) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <Text>Meal not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {meal.imageUrl && (
        <Image 
          source={{ uri: meal.imageUrl }} 
          className="w-full h-48"
          resizeMode="cover"
        />
      )}
      
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-2xl font-serif" style={{ color: themeColorForeground }}>
            {meal.name}
          </Text>
          <View 
            className="px-2 py-1 rounded"
            style={{ 
              backgroundColor: meal.fastingType === "strict" ? COLORS.secondary : 
                meal.fastingType === "regular" ? COLORS.primary : COLORS.accent 
            }}
          >
            <Text className={`text-xs ${meal.fastingType === "feast" ? 'text-black' : 'text-white'}`}>
              {meal.fastingType}
            </Text>
          </View>
        </View>
        
        <Text className="opacity-70 mb-2">{meal.cuisineTag}</Text>
        
        {meal.description && (
          <Text className="mb-4" style={{ color: themeColorForeground }}>{meal.description}</Text>
        )}

        <View className="flex-row gap-4 mb-4 text-sm opacity-70">
          {meal.prepTime && <Text>Prep: {meal.prepTime} min</Text>}
          {meal.cookTime && <Text>Cook: {meal.cookTime} min</Text>}
          {meal.servings && <Text>Servings: {meal.servings}</Text>}
        </View>

        <Text className="font-semibold text-lg mb-2" style={{ color: themeColorForeground }}>
          Ingredients
        </Text>
        <View className="mb-4 space-y-1">
          {meal.ingredients?.map((ing, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
              <Text style={{ color: themeColorForeground }}>{ing.ingredient}</Text>
            </View>
          ))}
        </View>

        <Text className="font-semibold text-lg mb-2" style={{ color: themeColorForeground }}>
          Instructions
        </Text>
        <View className="space-y-3 mb-4">
          {meal.steps?.map((step, i) => (
            <View key={i} className="flex-row gap-3">
              <View 
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="text-white text-sm">{step.stepNumber}</Text>
              </View>
              <Text className="flex-1" style={{ color: themeColorForeground }}>{step.instruction}</Text>
            </View>
          ))}
        </View>

        {meal.tags && meal.tags.length > 0 && (
          <>
            <Text className="font-semibold text-lg mb-2" style={{ color: themeColorForeground }}>
              Tags
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {meal.tags.map((tag, i) => (
                <View key={i} className="rounded px-2 py-1" style={{ backgroundColor: COLORS.secondary }}>
                  <Text className="text-white text-xs">{tag.tag}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}