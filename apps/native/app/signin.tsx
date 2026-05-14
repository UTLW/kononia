import { useState } from "react";
import { useThemeColor } from "heroui-native";
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { authClient } from "@/lib/auth-client";

const COLORS = {
  primary: "#722F37",
  secondary: "#4A7C59",
  accent: "#C9A96E",
  background: "#FDF8F3",
  card: "#FAF5ED",
};

export default function SignInPage() {
  const router = useRouter();
  const themeColorForeground = useThemeColor("foreground");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <View className="flex-1 justify-center p-6">
        <Text className="font-serif text-3xl text-center mb-2" style={{ color: COLORS.primary }}>
          ⲔⲞⲚⲞⲚⲒⲀ
        </Text>
        <Text className="text-center text-muted-foreground mb-8">
          Orthodox Fasting Companion
        </Text>

        <Text className="text-xl font-semibold mb-6" style={{ color: themeColorForeground }}>
          Sign In
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm mb-1">Email</Text>
            <TextInput
              className="border rounded-lg p-3"
              style={{ backgroundColor: COLORS.card }}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              placeholderTextColor="#999"
            />
          </View>

          <View>
            <Text className="text-sm mb-1">Password</Text>
            <TextInput
              className="border rounded-lg p-3"
              style={{ backgroundColor: COLORS.card }}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            className="rounded-lg p-4"
            style={{ backgroundColor: COLORS.primary }}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-medium">
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <View className="text-center mt-4">
            <Text className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Text 
                className="text-[#722F37] font-medium"
                onPress={() => router.push("/signup")}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}