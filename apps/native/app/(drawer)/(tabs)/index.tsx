import { useThemeColor } from "heroui-native";
import { Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
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

const FASTING_TYPE_COLORS = {
  strict: COLORS.secondary,
  regular: COLORS.primary,
  feast: COLORS.accent,
};

const FASTING_TYPE_LABELS = {
  strict: "Strict Fast",
  regular: "Regular Fast",
  feast: "Feast Day",
};

export default function Home() {
  const router = useRouter();
  const themeColorForeground = useThemeColor("foreground");
  
  const { data: fastDay } = trpc.calendar.getTodayFastDay.useQuery();
  const { data: season } = trpc.seasons.getCurrent.useQuery();
  const { data: meals } = trpc.meals.list.useQuery({ 
    fastingType: fastDay?.fastingType || "regular",
    limit: 3 
  });

  const fastingType = fastDay?.fastingType || "regular";
  const colorClass = FASTING_TYPE_COLORS[fastingType as keyof typeof FASTING_TYPE_COLORS] || COLORS.primary;

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <Container className="p-4">
        <View 
          className="rounded-xl p-6 mb-4"
          style={{ backgroundColor: colorClass }}
        >
          <Text className="text-white text-center text-2xl font-serif">
            {FASTING_TYPE_LABELS[fastingType as keyof typeof FASTING_TYPE_LABELS]}
          </Text>
          <Text className="text-white/80 text-center mt-2">
            {fastDay?.fastNotes || "Today is a day of fasting"}
          </Text>
        </View>

        {season && (
          <View className="rounded-lg border p-4 mb-4" style={{ backgroundColor: COLORS.card }}>
            <Text className="font-semibold text-lg mb-1" style={{ color: themeColorForeground }}>
              Current Season
            </Text>
            <Text style={{ color: themeColorForeground }}>{season.name}</Text>
            <Text className="text-sm opacity-70">
              {season.startDate} - {season.endDate}
            </Text>
          </View>
        )}

        <Text className="font-semibold text-lg mb-3" style={{ color: themeColorForeground }}>
          Today's Meals
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-4">
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
                  className="w-full h-24"
                  resizeMode="cover"
                />
              )}
              <View className="p-2">
                <Text className="font-medium text-sm" style={{ color: themeColorForeground }}>
                  {meal.name}
                </Text>
                <Text className="text-xs opacity-70">{meal.cuisineTag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="font-semibold text-lg mb-3" style={{ color: themeColorForeground }}>
          Quick Links
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity 
            className="rounded-md px-4 py-2"
            style={{ backgroundColor: COLORS.secondary }}
            onPress={() => router.push("/calendar")}
          >
            <Text className="text-white">Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="rounded-md px-4 py-2"
            style={{ backgroundColor: COLORS.secondary }}
            onPress={() => router.push("/meals")}
          >
            <Text className="text-white">Meals</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </ScrollView>
  );
}
