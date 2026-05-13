import { useState } from "react";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const FASTING_TYPE_COLORS = {
  strict: COLORS.secondary,
  regular: COLORS.primary,
  feast: COLORS.accent,
};

export default function CalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const themeColorForeground = useThemeColor("foreground");
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
  
  const { data: fastDays } = trpc.calendar.getFastDaysInRange.useQuery({
    startDate,
    endDate,
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getFastDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return fastDays?.find(fd => fd.date === dateStr);
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <Container className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={prevMonth} className="p-2">
            <Text className="text-lg">←</Text>
          </TouchableOpacity>
          <Text className="font-semibold text-lg" style={{ color: themeColorForeground }}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} className="p-2">
            <Text className="text-lg">→</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <View key={i} className="flex-1 items-center py-2">
              <Text className="text-sm font-medium opacity-70">{day}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {Array(firstDay).fill(null).map((_, i) => (
            <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />
          ))}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const fastDay = getFastDay(day);
            const bgColor = fastDay 
              ? FASTING_TYPE_COLORS[fastDay.fasteningType as keyof typeof FASTING_TYPE_COLORS]
              : COLORS.card;
            
            return (
              <TouchableOpacity
                key={day}
                className="w-[14.28%] aspect-square items-center justify-center"
              >
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: fastDay ? bgColor : COLORS.card }}
                >
                  <Text className={`text-sm ${fastDay ? 'text-white' : ''}`}>
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-6 flex-row justify-center gap-6">
          <View className="flex-row items-center gap-2">
            <View className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.secondary }} />
            <Text className="text-sm">Strict</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.primary }} />
            <Text className="text-sm">Regular</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-4 h-4 rounded border" style={{ backgroundColor: COLORS.accent }} />
            <Text className="text-sm">Feast</Text>
          </View>
        </View>
      </Container>
    </ScrollView>
  );
}