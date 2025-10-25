import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderRadius?: number;
}

export function GlassContainer({
  children,
  style,
  intensity = 20,
  borderRadius = 16,
}: GlassContainerProps) {
  const colorScheme = useColorScheme();

  return (
    <BlurView
      intensity={intensity}
      tint={colorScheme === "dark" ? "dark" : "light"}
      style={[styles.glassContainer, { borderRadius }, style]}
    >
      <ThemedView style={[styles.glassOverlay, { borderRadius }]}>
        {children}
      </ThemedView>
    </BlurView>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 15,
  padding = 20,
}: GlassCardProps) {
  const colorScheme = useColorScheme();

  return (
    <BlurView
      intensity={intensity}
      tint={colorScheme === "dark" ? "dark" : "light"}
      style={[styles.glassCard, style]}
    >
      <ThemedView style={[styles.cardOverlay, { padding }]}>
        {children}
      </ThemedView>
    </BlurView>
  );
}

interface GlassButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  intensity?: number;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "destructive";
}

export function GlassButton({
  children,
  onPress,
  style,
  intensity = 25,
  disabled = false,
  variant = "primary",
}: GlassButtonProps) {
  const colorScheme = useColorScheme();

  const getVariantOverlay = () => {
    const baseOverlay = {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(0, 0, 0, 0.15)",
      borderColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(0, 0, 0, 0.3)",
    };

    switch (variant) {
      case "primary":
        return {
          ...baseOverlay,
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(0, 122, 255, 0.4)"
              : "rgba(0, 122, 255, 0.9)",
          borderColor: "rgba(0, 122, 255, 0.8)",
        };
      case "secondary":
        return baseOverlay;
      case "destructive":
        return {
          ...baseOverlay,
          backgroundColor: "rgba(255, 69, 58, 0.4)",
          borderColor: "rgba(255, 69, 58, 0.7)",
        };
      default:
        return baseOverlay;
    }
  };

  return (
    <BlurView
      intensity={intensity}
      tint={colorScheme === "dark" ? "dark" : "light"}
      style={[styles.glassButton, disabled && styles.disabledButton, style]}
    >
      <ThemedView
        style={[
          styles.buttonOverlay,
          getVariantOverlay(),
          disabled && styles.disabledOverlay,
        ]}
        onTouchEnd={disabled ? undefined : onPress}
      >
        {children}
      </ThemedView>
    </BlurView>
  );
}

interface GlassTimerCircleProps {
  children: React.ReactNode;
  size?: number;
  borderWidth?: number;
  progress?: number; // 0 to 1
  color?: string;
}

export function GlassTimerCircle({
  children,
  size = 280,
  borderWidth = 6,
  progress = 1,
  color = "#007AFF",
}: GlassTimerCircleProps) {
  const colorScheme = useColorScheme();
  const radius = size / 2;

  return (
    <ThemedView style={[styles.timerContainer, { width: size, height: size }]}>
      {/* Progress Ring Background */}
      <ThemedView
        style={[
          styles.progressRing,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: borderWidth,
            borderColor:
              colorScheme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
          },
        ]}
      />

      {/* Progress Ring Active - showing remaining time */}
      {progress > 0.75 && (
        <ThemedView
          style={[
            styles.progressSegment,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: borderWidth,
              borderColor: "transparent",
              borderLeftColor: color,
              transform: [{ rotate: "-90deg" }],
            },
          ]}
        />
      )}
      {progress > 0.5 && (
        <ThemedView
          style={[
            styles.progressSegment,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: borderWidth,
              borderColor: "transparent",
              borderBottomColor: color,
              transform: [{ rotate: "-90deg" }],
            },
          ]}
        />
      )}
      {progress > 0.25 && (
        <ThemedView
          style={[
            styles.progressSegment,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: borderWidth,
              borderColor: "transparent",
              borderRightColor: color,
              transform: [{ rotate: "-90deg" }],
            },
          ]}
        />
      )}
      {progress > 0 && (
        <ThemedView
          style={[
            styles.progressSegment,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: borderWidth,
              borderColor: "transparent",
              borderTopColor: color,
              transform: [{ rotate: "-90deg" }],
              opacity: progress > 0.01 ? 1 : 0.3,
            },
          ]}
        />
      )}

      {/* Glass Circle */}
      <BlurView
        intensity={30}
        tint={colorScheme === "dark" ? "dark" : "light"}
        style={[
          styles.timerCircle,
          {
            width: size - borderWidth * 2,
            height: size - borderWidth * 2,
            borderRadius: (size - borderWidth * 2) / 2,
            top: borderWidth,
            left: borderWidth,
          },
        ]}
      >
        <ThemedView
          style={[
            styles.timerContent,
            {
              borderRadius: (size - borderWidth * 2) / 2,
            },
          ]}
        >
          {children}
        </ThemedView>
      </BlurView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    overflow: "hidden",
  },
  glassOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  glassCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  cardOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
  },
  glassButton: {
    borderRadius: 25,
    overflow: "hidden",
    minHeight: 50,
  },
  buttonOverlay: {
    borderWidth: 1,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButton: {
    // Primary button styling handled by overlay
  },
  secondaryButton: {
    // Secondary button styling
  },
  destructiveButton: {
    // Destructive button styling
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledOverlay: {
    backgroundColor: "rgba(128, 128, 128, 0.3)",
  },
  timerContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    position: "absolute",
  },
  progressRingActive: {
    position: "absolute",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  progressSegment: {
    position: "absolute",
  },
  timerCircle: {
    position: "absolute",
    overflow: "hidden",
  },
  timerContent: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
});
