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

export default function PricingPage() {
  const themeColorForeground = useThemeColor("foreground");

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <Container className="p-4">
        <Text className="font-serif text-2xl text-center mb-6" style={{ color: themeColorForeground }}>
          Pricing
        </Text>
        
        <View className="rounded-lg border p-4 mb-4" style={{ backgroundColor: COLORS.card }}>
          <Text className="font-medium text-lg" style={{ color: themeColorForeground }}>
            Free Plan
          </Text>
          <Text className="text-2xl font-bold mt-2" style={{ color: COLORS.primary }}>
            $0
          </Text>
          <Text className="text-sm opacity-70 mt-2">
            Forever free
          </Text>
          <View className="mt-4 space-y-2">
            <Text className="text-sm">✓ Basic calendar access</Text>
            <Text className="text-sm">✓ Browse fasting meals</Text>
            <Text className="text-sm">✓ Current season info</Text>
          </View>
        </View>

        <View className="rounded-lg border-2 p-4" style={{ borderColor: COLORS.primary }}>
          <Text className="font-medium text-lg" style={{ color: themeColorForeground }}>
            Annual Plan
          </Text>
          <Text className="text-2xl font-bold mt-2" style={{ color: COLORS.primary }}>
            $9.99/year
          </Text>
          <View className="mt-4 space-y-2">
            <Text className="text-sm">✓ Everything in Free</Text>
            <Text className="text-sm">✓ Unlimited meal planning</Text>
            <Text className="text-sm">✓ Weekly shopping lists</Text>
            <Text className="text-sm">✓ Push notifications for fast days</Text>
            <Text className="text-sm">✓ Unlimited calendar history</Text>
          </View>
        </View>

        <Text className="text-center text-sm opacity-70 mt-6">
          Subscription managed via Polar. Cancel anytime.
        </Text>
      </Container>
    </ScrollView>
  );
}