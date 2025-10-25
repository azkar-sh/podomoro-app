import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  GlassButton,
  GlassCard,
  GlassTimerCircle,
} from "@/components/ui/glass-components";
import { useQuoteManager } from "@/hooks/use-quote-manager";
import { useTimerLogic } from "@/hooks/use-timer-logic";
import { Animated, Pressable, ScrollView, StyleSheet } from "react-native";

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

  const handleMainAction = () => {
    if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      startTimer();
    }
  };

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

        <GlassCard style={styles.quoteContainer}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <ThemedText style={styles.quote}>
              &quot;{currentQuote.text}&quot;
            </ThemedText>
            <ThemedText style={styles.quoteAuthor}>
              - {currentQuote.author}
            </ThemedText>
          </Animated.View>

          <ThemedView style={styles.quoteControls}>
            <Pressable
              style={styles.quoteControlButton}
              onPress={manuallyChangeQuote}
            >
              <ThemedText style={styles.quoteControlIcon}>🔄</ThemedText>
            </Pressable>

            <Pressable
              style={styles.quoteControlButton}
              onPress={() => toggleFavorite(currentQuote.id)}
            >
              <ThemedText style={styles.quoteControlIcon}>
                {isFavorite(currentQuote.id) ? "❤️" : "🤍"}
              </ThemedText>
            </Pressable>

            <Pressable
              style={styles.quoteControlButton}
              onPress={() => {
                // In a real app, this would use Share API or copy to clipboard
                console.log("Share:", shareQuote(currentQuote));
              }}
            >
              <ThemedText style={styles.quoteControlIcon}>📤</ThemedText>
            </Pressable>
          </ThemedView>
        </GlassCard>

        <ThemedView style={styles.controlsContainer}>
          <GlassButton
            variant="primary"
            style={styles.mainButton}
            onPress={handleMainAction}
          >
            <ThemedText style={styles.buttonText}>
              {isRunning ? "Pause" : isPaused ? "Resume" : "Start"}
            </ThemedText>
          </GlassButton>

          <GlassButton
            variant="secondary"
            style={styles.secondaryButton}
            onPress={resetTimer}
          >
            <ThemedText style={styles.buttonText}>Reset</ThemedText>
          </GlassButton>
        </ThemedView>

        {/* Session Switch Buttons */}
        <ThemedView style={styles.sessionSwitchContainer}>
          <Pressable
            style={[
              styles.sessionButton,
              currentSession === "focus" && styles.activeSessionButton,
            ]}
            onPress={() => switchSession("focus")}
          >
            <ThemedText
              style={[
                styles.sessionButtonText,
                currentSession === "focus" && styles.activeSessionButtonText,
              ]}
            >
              Focus
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.sessionButton,
              currentSession === "break" && styles.activeSessionButton,
            ]}
            onPress={() => switchSession("break")}
          >
            <ThemedText
              style={[
                styles.sessionButtonText,
                currentSession === "break" && styles.activeSessionButtonText,
              ]}
            >
              Break
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.sessionButton,
              currentSession === "longBreak" && styles.activeSessionButton,
            ]}
            onPress={() => switchSession("longBreak")}
          >
            <ThemedText
              style={[
                styles.sessionButtonText,
                currentSession === "longBreak" &&
                  styles.activeSessionButtonText,
              ]}
            >
              Long Break
            </ThemedText>
          </Pressable>
        </ThemedView>
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
