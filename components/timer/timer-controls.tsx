import React, { memo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GlassButton } from "@/components/ui/glass-components";

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onMainAction: () => void;
  onReset: () => void;
}

export const TimerControls = memo<TimerControlsProps>(function TimerControls({
  isRunning,
  isPaused,
  onMainAction,
  onReset,
}) {
  const getMainButtonText = () => {
    if (isRunning) return "Pause";
    if (isPaused) return "Resume";
    return "Start";
  };

  return (
    <ThemedView style={styles.container}>
      <GlassButton
        variant="primary"
        style={styles.mainButton}
        onPress={onMainAction}
        accessibilityLabel={`${getMainButtonText()} timer`}
      >
        <ThemedText style={styles.buttonText}>{getMainButtonText()}</ThemedText>
      </GlassButton>

      <GlassButton
        variant="secondary"
        style={styles.secondaryButton}
        onPress={onReset}
        accessibilityLabel="Reset timer"
      >
        <ThemedText style={styles.buttonText}>Reset</ThemedText>
      </GlassButton>
    </ThemedView>
  );
});

interface SessionSwitcherProps {
  currentSession: "focus" | "break" | "longBreak";
  onSwitchSession: (session: "focus" | "break" | "longBreak") => void;
}

export const SessionSwitcher = memo<SessionSwitcherProps>(
  function SessionSwitcher({ currentSession, onSwitchSession }) {
    const sessions: { key: "focus" | "break" | "longBreak"; label: string }[] =
      [
        { key: "focus", label: "Focus" },
        { key: "break", label: "Break" },
        { key: "longBreak", label: "Long Break" },
      ];

    return (
      <ThemedView style={styles.sessionContainer}>
        {sessions.map((session) => (
          <Pressable
            key={session.key}
            style={[
              styles.sessionButton,
              currentSession === session.key && styles.activeSessionButton,
            ]}
            onPress={() => onSwitchSession(session.key)}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${session.label}`}
          >
            <ThemedText
              style={[
                styles.sessionButtonText,
                currentSession === session.key &&
                  styles.activeSessionButtonText,
              ]}
            >
              {session.label}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  mainButton: {
    flex: 1,
    marginRight: 10,
  },
  secondaryButton: {
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  sessionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  sessionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  activeSessionButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  sessionButtonText: {
    fontSize: 14,
    opacity: 0.8,
  },
  activeSessionButtonText: {
    color: "white",
    opacity: 1,
  },
});
