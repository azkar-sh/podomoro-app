import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GlassButton, GlassCard } from "@/components/ui/glass-components";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useStatistics } from "@/hooks/use-statistics";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function StatisticsScreen() {
  const {
    dailyStats,
    weeklyStats,
    allTimeStats,
    isLoading,
    shareStats,
    resetStats,
    formatTime,
  } = useStatistics();

  const handleReset = () => {
    Alert.alert(
      "Reset Statistics",
      "This will permanently delete all your statistics. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetStats },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>
            Loading Statistics...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!dailyStats || !weeklyStats || !allTimeStats) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Unable to load statistics
          </ThemedText>
          <GlassButton onPress={() => window.location.reload()}>
            <ThemedText style={styles.buttonText}>Retry</ThemedText>
          </GlassButton>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Statistics
        </ThemedText>
        <Pressable style={styles.shareButton} onPress={shareStats}>
          <IconSymbol name="square.and.arrow.up" size={24} color="#007AFF" />
        </Pressable>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Stats */}
        <GlassCard style={styles.statSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📅 Today
          </ThemedText>
          <ThemedView style={styles.statGrid}>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formatTime(dailyStats.focusTime)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Focus Time</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {dailyStats.completedSessions}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Completed</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {dailyStats.sessions}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Sessions</ThemedText>
            </ThemedView>
          </ThemedView>
        </GlassCard>

        {/* Weekly Stats */}
        <GlassCard style={styles.statSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📊 This Week
          </ThemedText>
          <ThemedView style={styles.statGrid}>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formatTime(weeklyStats.totalFocusTime)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Focus Time</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {weeklyStats.completedSessions}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Completed</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {weeklyStats.activeDays}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Active Days</ThemedText>
            </ThemedView>
          </ThemedView>
        </GlassCard>

        {/* All Time Stats */}
        <GlassCard style={styles.statSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🏆 All Time
          </ThemedText>
          <ThemedView style={styles.statGrid}>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formatTime(allTimeStats.totalFocusTime)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Focus</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {allTimeStats.completedSessions}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Completed</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {allTimeStats.longestStreak}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Best Streak</ThemedText>
            </ThemedView>
          </ThemedView>
        </GlassCard>

        {/* Streak */}
        <GlassCard style={styles.statSection}>
          <ThemedView style={styles.streakCard}>
            <ThemedText style={styles.streakEmoji}>🔥</ThemedText>
            <ThemedView style={styles.streakContent}>
              <ThemedText style={styles.streakValue}>
                {allTimeStats.currentStreak} Days
              </ThemedText>
              <ThemedText style={styles.streakLabel}>Current Streak</ThemedText>
            </ThemedView>
          </ThemedView>
        </GlassCard>

        {/* Action Buttons */}
        <ThemedView style={styles.actionSection}>
          <GlassButton
            variant="primary"
            style={styles.actionButton}
            onPress={shareStats}
          >
            <ThemedText style={styles.buttonText}>📤 Share Stats</ThemedText>
          </GlassButton>

          <GlassButton
            variant="secondary"
            style={styles.actionButton}
            onPress={handleReset}
          >
            <ThemedText style={styles.buttonText}>🔄 Reset Data</ThemedText>
          </GlassButton>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  statGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  streakSection: {
    alignItems: "center",
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  streakContent: {
    flex: 1,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9500",
  },
  streakLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionSection: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
