import React, { useCallback } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { QuoteCard } from "@/components/timer/quote-card";
import {
  SessionSwitcher,
  TimerControls,
} from "@/components/timer/timer-controls";
import { GlassTimerCircle } from "@/components/ui/glass-components";
import { useQuoteManager } from "@/hooks/use-quote-manager";
import { useTimerLogic } from "@/hooks/use-timer-logic";

export default function TimerScreen() {
  const {
    formattedTime,
    progress,
    sessionDisplayText,
    sessionColor,
    isRunning,
    isPaused,
    currentSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchSession,
  } = useTimerLogic();

  const {
    getCurrentQuoteBySession,
    fadeAnim,
    manuallyChangeQuote,
    toggleFavorite,
    isFavorite,
    shareQuote,
  } = useQuoteManager();

  const currentQuote = getCurrentQuoteBySession(currentSession);

  const handleMainAction = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      startTimer();
    }
  }, [isRunning, isPaused, pauseTimer, resumeTimer, startTimer]);

  const handleReset = useCallback(() => {
    Alert.alert("Reset Timer", "Are you sure you want to reset the timer?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: resetTimer },
    ]);
  }, [resetTimer]);

  const handleShare = useCallback(
    (quote: typeof currentQuote) => {
      const message = shareQuote(quote);
      Alert.alert("Share Quote", message);
    },
    [shareQuote]
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Focus Timer
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.timerContainer}>
          <GlassTimerCircle size={280} progress={progress} color={sessionColor}>
            <ThemedText type="title" style={styles.timerText}>
              {formattedTime}
            </ThemedText>
            <ThemedText style={[styles.sessionType, { color: sessionColor }]}>
              {sessionDisplayText}
            </ThemedText>
          </GlassTimerCircle>
        </ThemedView>

        <QuoteCard
          quote={currentQuote}
          fadeAnim={fadeAnim}
          onRefresh={manuallyChangeQuote}
          onToggleFavorite={toggleFavorite}
          onShare={handleShare}
          isFavorite={isFavorite(currentQuote.id)}
        />

        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          onMainAction={handleMainAction}
          onReset={handleReset}
        />

        <SessionSwitcher
          currentSession={currentSession}
          onSwitchSession={switchSession}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
  },
  sessionType: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  quoteContainer: {
    marginBottom: 40,
    marginHorizontal: 20,
  },
  quote: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  quoteControls: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 16,
  },
  quoteControlButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  quoteControlIcon: {
    fontSize: 18,
  },
  controlsContainer: {
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
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  sessionSwitchContainer: {
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
