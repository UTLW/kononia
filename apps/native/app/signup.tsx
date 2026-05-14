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

export default function SignUpPage() {
  const router = useRouter();
  const themeColorForeground = useThemeColor("foreground");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });
      
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to sign up");
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
          Create Account
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm mb-1">Name</Text>
            <TextInput
              className="border rounded-lg p-3"
              style={{ backgroundColor: COLORS.card }}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#999"
            />
          </View>

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
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-medium">
              {isLoading ? "Creating account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View className="text-center mt-4">
            <Text className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Text 
                className="text-[#722F37] font-medium"
                onPress={() => router.push("/signin")}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}