import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert, Share } from "react-native";

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  focusTime: number; // minutes
  breakTime: number; // minutes
  sessions: number;
  completedSessions: number;
}

export interface WeeklyStats {
  week: string; // YYYY-WW format
  totalFocusTime: number;
  totalBreakTime: number;
  totalSessions: number;
  completedSessions: number;
  activeDays: number;
}

export interface AllTimeStats {
  totalFocusTime: number;
  totalBreakTime: number;
  totalSessions: number;
  completedSessions: number;
  currentStreak: number;
  longestStreak: number;
  firstUseDate: string;
}

const STORAGE_KEYS = {
  DAILY_STATS: "focus_timer_daily_stats",
  WEEKLY_STATS: "focus_timer_weekly_stats",
  ALL_TIME_STATS: "focus_timer_all_time_stats",
  LAST_UPDATE: "focus_timer_last_update",
};

export function useStatistics() {
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [allTimeStats, setAllTimeStats] = useState<AllTimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current date strings
  const getCurrentDateString = () => {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const getCurrentWeekString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const onejan = new Date(year, 0, 1);
    const week = Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
    return `${year}-${week.toString().padStart(2, "0")}`;
  };

  // Initialize stats if they don't exist
  const initializeStats = useCallback(async () => {
    const today = getCurrentDateString();
    const thisWeek = getCurrentWeekString();

    // Initialize daily stats
    const defaultDaily: DailyStats = {
      date: today,
      focusTime: 0,
      breakTime: 0,
      sessions: 0,
      completedSessions: 0,
    };

    // Initialize weekly stats
    const defaultWeekly: WeeklyStats = {
      week: thisWeek,
      totalFocusTime: 0,
      totalBreakTime: 0,
      totalSessions: 0,
      completedSessions: 0,
      activeDays: 0,
    };

    // Initialize all-time stats
    const defaultAllTime: AllTimeStats = {
      totalFocusTime: 0,
      totalBreakTime: 0,
      totalSessions: 0,
      completedSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
      firstUseDate: today,
    };

    try {
      // Check if we need to initialize or update for new day/week
      const existingDaily = await AsyncStorage.getItem(
        STORAGE_KEYS.DAILY_STATS
      );
      const existingWeekly = await AsyncStorage.getItem(
        STORAGE_KEYS.WEEKLY_STATS
      );
      const existingAllTime = await AsyncStorage.getItem(
        STORAGE_KEYS.ALL_TIME_STATS
      );

      let currentDaily = existingDaily
        ? JSON.parse(existingDaily)
        : defaultDaily;
      let currentWeekly = existingWeekly
        ? JSON.parse(existingWeekly)
        : defaultWeekly;
      let currentAllTime = existingAllTime
        ? JSON.parse(existingAllTime)
        : defaultAllTime;

      // Reset daily stats if it's a new day
      if (currentDaily.date !== today) {
        // Calculate streak before resetting
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split("T")[0];

        if (
          currentDaily.date === yesterdayString &&
          currentDaily.completedSessions > 0
        ) {
          currentAllTime.currentStreak += 1;
          currentAllTime.longestStreak = Math.max(
            currentAllTime.longestStreak,
            currentAllTime.currentStreak
          );
        } else if (currentDaily.date !== yesterdayString) {
          // Streak broken
          currentAllTime.currentStreak = 0;
        }

        currentDaily = { ...defaultDaily, date: today };
      }

      // Reset weekly stats if it's a new week
      if (currentWeekly.week !== thisWeek) {
        currentWeekly = { ...defaultWeekly, week: thisWeek };
      }

      setDailyStats(currentDaily);
      setWeeklyStats(currentWeekly);
      setAllTimeStats(currentAllTime);

      // Save initialized/updated stats
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.DAILY_STATS, JSON.stringify(currentDaily)],
        [STORAGE_KEYS.WEEKLY_STATS, JSON.stringify(currentWeekly)],
        [STORAGE_KEYS.ALL_TIME_STATS, JSON.stringify(currentAllTime)],
        [STORAGE_KEYS.LAST_UPDATE, today],
      ]);
    } catch (error) {
      console.error("Failed to initialize statistics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Record a session (when timer starts)
  const recordSessionStart = useCallback(
    async (sessionType: "focus" | "break" | "longBreak") => {
      if (!dailyStats || !weeklyStats || !allTimeStats) return;

      const updatedDaily = { ...dailyStats, sessions: dailyStats.sessions + 1 };
      const updatedWeekly = {
        ...weeklyStats,
        totalSessions: weeklyStats.totalSessions + 1,
      };
      const updatedAllTime = {
        ...allTimeStats,
        totalSessions: allTimeStats.totalSessions + 1,
      };

      setDailyStats(updatedDaily);
      setWeeklyStats(updatedWeekly);
      setAllTimeStats(updatedAllTime);

      try {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.DAILY_STATS, JSON.stringify(updatedDaily)],
          [STORAGE_KEYS.WEEKLY_STATS, JSON.stringify(updatedWeekly)],
          [STORAGE_KEYS.ALL_TIME_STATS, JSON.stringify(updatedAllTime)],
        ]);
      } catch (error) {
        console.error("Failed to record session start:", error);
      }
    },
    [dailyStats, weeklyStats, allTimeStats]
  );

  // Record completed session (when timer finishes)
  const recordSessionComplete = useCallback(
    async (
      sessionType: "focus" | "break" | "longBreak",
      duration: number // in minutes
    ) => {
      if (!dailyStats || !weeklyStats || !allTimeStats) return;

      const isFocusSession = sessionType === "focus";

      const updatedDaily: DailyStats = {
        ...dailyStats,
        completedSessions: dailyStats.completedSessions + 1,
        focusTime: dailyStats.focusTime + (isFocusSession ? duration : 0),
        breakTime: dailyStats.breakTime + (!isFocusSession ? duration : 0),
      };

      const updatedWeekly: WeeklyStats = {
        ...weeklyStats,
        completedSessions: weeklyStats.completedSessions + 1,
        totalFocusTime:
          weeklyStats.totalFocusTime + (isFocusSession ? duration : 0),
        totalBreakTime:
          weeklyStats.totalBreakTime + (!isFocusSession ? duration : 0),
        activeDays:
          weeklyStats.activeDays + (dailyStats.completedSessions === 0 ? 1 : 0),
      };

      const updatedAllTime: AllTimeStats = {
        ...allTimeStats,
        completedSessions: allTimeStats.completedSessions + 1,
        totalFocusTime:
          allTimeStats.totalFocusTime + (isFocusSession ? duration : 0),
        totalBreakTime:
          allTimeStats.totalBreakTime + (!isFocusSession ? duration : 0),
      };

      setDailyStats(updatedDaily);
      setWeeklyStats(updatedWeekly);
      setAllTimeStats(updatedAllTime);

      try {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.DAILY_STATS, JSON.stringify(updatedDaily)],
          [STORAGE_KEYS.WEEKLY_STATS, JSON.stringify(updatedWeekly)],
          [STORAGE_KEYS.ALL_TIME_STATS, JSON.stringify(updatedAllTime)],
        ]);
      } catch (error) {
        console.error("Failed to record completed session:", error);
      }
    },
    [dailyStats, weeklyStats, allTimeStats]
  );

  // Format time helper
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Share statistics
  const shareStats = useCallback(async () => {
    if (!dailyStats || !weeklyStats || !allTimeStats) return;

    const message = `🎯 My FocusTimer Stats:

📅 Today: ${formatTime(dailyStats.focusTime)} (${
      dailyStats.completedSessions
    } sessions)
📊 This Week: ${formatTime(weeklyStats.totalFocusTime)} (${
      weeklyStats.completedSessions
    } sessions)
🔥 Current Streak: ${allTimeStats.currentStreak} days
🏆 Total Focus Time: ${formatTime(allTimeStats.totalFocusTime)}

Stay focused! 💪 #FocusTimer`;

    try {
      await Share.share({
        message,
        title: "My Focus Timer Statistics",
      });
    } catch {
      Alert.alert("Share Statistics", message);
    }
  }, [dailyStats, weeklyStats, allTimeStats]);

  // Reset all statistics (for debugging/testing)
  const resetStats = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DAILY_STATS,
        STORAGE_KEYS.WEEKLY_STATS,
        STORAGE_KEYS.ALL_TIME_STATS,
        STORAGE_KEYS.LAST_UPDATE,
      ]);
      await initializeStats();
    } catch (error) {
      console.error("Failed to reset statistics:", error);
    }
  }, [initializeStats]);

  // Load stats on mount
  useEffect(() => {
    initializeStats();
  }, [initializeStats]);

  return {
    // Data
    dailyStats,
    weeklyStats,
    allTimeStats,
    isLoading,

    // Actions
    recordSessionStart,
    recordSessionComplete,
    shareStats,
    resetStats,

    // Utilities
    formatTime,
  };
}
