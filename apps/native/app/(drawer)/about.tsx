import { useThemeColor } from "heroui-native";
import { Text, View, ScrollView } from "react-native";

import { Container } from "@/components/container";

const COLORS = {
  primary: "#722F37",
  secondary: "#4A7C59",
  accent: "#C9A96E",
  background: "#FDF8F3",
  card: "#FAF5ED",
};

export default function AboutPage() {
  const themeColorForeground = useThemeColor("foreground");

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <Container className="p-4">
        <Text className="font-serif text-2xl text-center mb-2" style={{ color: COLORS.primary }}>
          ⲔⲞⲚⲞⲚⲒⲀ
        </Text>
        <Text className="text-center text-muted-foreground mb-6">
          Orthodox Christian Family Fasting Companion
        </Text>

        <View className="space-y-4">
          <Text style={{ color: themeColorForeground }}>
            ⲔⲞⲚⲞⲚⲒⲀ (Kononia) is an app designed to help Orthodox Christian families 
            follow the traditional fasting practices of the Coptic Orthodox Church.
          </Text>

          <View className="rounded-lg border p-4" style={{ backgroundColor: COLORS.card }}>
            <Text className="font-medium mb-2" style={{ color: themeColorForeground }}>
              Features
            </Text>
            <View className="space-y-2">
              <Text className="text-sm">📅 Liturgical calendar with fasting days</Text>
              <Text className="text-sm">🍽️ Fasting-friendly recipes and meals</Text>
              <Text className="text-sm">🥗 Quick snacks for fasting periods</Text>
              <Text className="text-sm">📱 Available on web and mobile</Text>
            </View>
          </View>

          <View className="rounded-lg border p-4" style={{ backgroundColor: COLORS.card }}>
            <Text className="font-medium mb-2" style={{ color: themeColorForeground }}>
              Fasting Types
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#722F37]" />
                <Text className="text-sm">Strict Fast - No meat, dairy, eggs, oil, wine, nuts, seeds</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#C9A96E]" />
                <Text className="text-sm">Regular Fast - No meat, dairy, eggs, olive oil, wine</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#4A7C59]" />
                <Text className="text-sm">Feast Day - No fasting required</Text>
              </View>
            </View>
          </View>

          <Text className="text-sm text-muted-foreground text-center mt-4">
            Following the Coptic Orthodox tradition of fasting since time immemorial.
          </Text>
        </View>
      </Container>
    </ScrollView>
  );
}