import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
      initialRouteName="timer"
    >
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="timer" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: "Quotes",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="quote.bubble.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
