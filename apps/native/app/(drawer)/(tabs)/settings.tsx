import { useThemeColor } from "heroui-native";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";

import { Container } from "@/components/container";
import { trpc } from "@/utils/trpc";

const COLORS = {
  primary: "#722F37",
  secondary: "#4A7C59",
  accent: "#C9A96E",
  background: "#FDF8F3",
  card: "#FAF5ED",
};

export default function SettingsTab() {
  const themeColorForeground = useThemeColor("foreground");
  
  const { data: user } = trpc.user.getProfile.useQuery(undefined, {
    retry: false,
  });

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <Container className="p-4">
        <Text className="font-semibold text-xl mb-4" style={{ color: themeColorForeground }}>
          Settings
        </Text>

        <View className="rounded-lg border p-4 mb-4" style={{ backgroundColor: COLORS.card }}>
          <Text className="font-medium text-lg mb-3" style={{ color: themeColorForeground }}>
            Account
          </Text>
          {user ? (
            <View className="space-y-2">
              <View>
                <Text className="text-sm opacity-70">Email</Text>
                <Text style={{ color: themeColorForeground }}>{user.email}</Text>
              </View>
              <View>
                <Text className="text-sm opacity-70">Timezone</Text>
                <Text style={{ color: themeColorForeground }}>{user.timezone}</Text>
              </View>
              <View>
                <Text className="text-sm opacity-70">Plan</Text>
                <Text style={{ color: themeColorForeground }} className="capitalize">{user.plan}</Text>
              </View>
            </View>
          ) : (
            <Text className="opacity-70">Not logged in</Text>
          )}
        </View>

        <View className="rounded-lg border p-4 mb-4" style={{ backgroundColor: COLORS.card }}>
          <Text className="font-medium text-lg mb-3" style={{ color: themeColorForeground }}>
            Subscription
          </Text>
          
          <View className="rounded-md bg-secondary/20 p-3 mb-3">
            <Text className="font-medium" style={{ color: themeColorForeground }}>Free Plan</Text>
            <Text className="text-sm opacity-70">Basic access to calendar and meals</Text>
          </View>

          <View className="rounded-md border-2 border-primary p-3">
            <Text className="font-medium" style={{ color: themeColorForeground }}>Annual - $9.99/year</Text>
            <Text className="text-sm opacity-70 mb-2">Unlimited meal planning, shopping lists, push notifications</Text>
            {user?.plan === "annual" ? (
              <Text className="text-primary font-medium">Subscribed!</Text>
            ) : (
              <TouchableOpacity 
                className="rounded-md px-4 py-2 self-start"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="text-white">Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="rounded-lg border p-4" style={{ backgroundColor: COLORS.card }}>
          <Text className="font-medium text-lg mb-2" style={{ color: themeColorForeground }}>
            About
          </Text>
          <Text className="opacity-70">ⲔⲞⲚⲞⲚⲒⲀ</Text>
          <Text className="text-sm opacity-70 mt-1">Orthodox Christian Family Fasting Companion</Text>
        </View>
      </Container>
    </ScrollView>
  );
}