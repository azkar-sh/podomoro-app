import { useTimer } from "@/contexts/timer-context";
import { useStatistics } from "@/hooks/use-statistics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

const BACKGROUND_TIMER_TASK = "background-timer-task";

// Background task definition
TaskManager.defineTask(BACKGROUND_TIMER_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background timer task error:", error);
    return;
  }

  try {
    // Get timer state from AsyncStorage
    const timerState = await AsyncStorage.getItem("timer_background_state");
    if (timerState) {
      const state = JSON.parse(timerState);

      // Check if timer should have completed while in background
      const now = Date.now();
      const backgroundTime = (data as any)?.backgroundTime || now;
      const timeInBackground = Math.floor((now - backgroundTime) / 1000);

      if (state.isRunning && timeInBackground >= state.remainingTime) {
        // Timer completed in background - send notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${
              state.currentSession === "focus" ? "Focus" : "Break"
            } Complete!`,
            body:
              state.currentSession === "focus"
                ? "Time for a break!"
                : "Ready for focus!",
            sound: true,
          },
          trigger: null, // Immediate notification
        });
      }
    }

    console.log("Background timer task executed successfully");
  } catch (bgError) {
    console.error("Background task execution error:", bgError);
  }
});

export function useTimerLogic() {
  const { state, dispatch, formatTime, saveState } = useTimer();
  const { recordSessionStart, recordSessionComplete } = useStatistics();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const appState = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number>(Date.now());

  // Load completion sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/ding.mp3") // We'll need to add this sound file
        );
        soundRef.current = sound;
      } catch (error) {
        console.warn("Could not load sound:", error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Define callback functions before using them in effects
  const playCompletionSound = useCallback(async () => {
    if (state.settings.soundEnabled && soundRef.current) {
      try {
        await soundRef.current.replayAsync();
      } catch (error) {
        console.warn("Could not play sound:", error);
      }
    }
  }, [state.settings.soundEnabled]);

  const handleTimerComplete = useCallback(() => {
    // Calculate session duration in minutes
    const sessionDuration = {
      focus: state.focusDuration,
      break: state.breakDuration,
      longBreak: state.longBreakDuration,
    }[state.currentSession];

    playCompletionSound();
    recordSessionComplete(state.currentSession, sessionDuration);
    dispatch({ type: "COMPLETE_SESSION" });

    // Cancel scheduled notification since we're in foreground
    Notifications.cancelAllScheduledNotificationsAsync();
  }, [
    playCompletionSound,
    dispatch,
    recordSessionComplete,
    state.currentSession,
    state.focusDuration,
    state.breakDuration,
    state.longBreakDuration,
  ]);

  const scheduleNotification = useCallback(async () => {
    if (!state.settings.notificationsEnabled) return;

    try {
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      const sessionTypeText =
        state.currentSession === "focus"
          ? "Focus"
          : state.currentSession === "break"
          ? "Break"
          : "Long Break";

      const nextSessionText =
        state.currentSession === "focus" ? "Break time!" : "Focus time!";

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${sessionTypeText} Complete!`,
          body: nextSessionText,
          sound: state.settings.soundEnabled,
          vibrate: state.settings.vibrationEnabled
            ? [0, 250, 250, 250]
            : undefined,
        },
        trigger: {
          type: "timeInterval",
          seconds: state.remainingTime,
        } as any,
      });
    } catch (error) {
      console.error("Failed to schedule notification:", error);
    }
  }, [
    state.settings.notificationsEnabled,
    state.settings.soundEnabled,
    state.settings.vibrationEnabled,
    state.currentSession,
    state.remainingTime,
  ]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App came to foreground
        if (state.isRunning) {
          const timeInBackground = Math.floor(
            (Date.now() - backgroundTimeRef.current) / 1000
          );
          const newRemainingTime = Math.max(
            0,
            state.remainingTime - timeInBackground
          );

          if (newRemainingTime === 0) {
            // Timer completed while in background
            handleTimerComplete();
          } else {
            // Update remaining time
            dispatch({
              type: "LOAD_STATE",
              payload: { remainingTime: newRemainingTime },
            });
          }
        }
      } else if (nextAppState.match(/inactive|background/) && state.isRunning) {
        // App went to background while timer is running
        backgroundTimeRef.current = Date.now();
        scheduleNotification();

        // Save current state for background task
        AsyncStorage.setItem(
          "timer_background_state",
          JSON.stringify({
            ...state,
            backgroundTime: backgroundTimeRef.current,
          })
        ).catch((storageError) => {
          console.warn("Could not save background state:", storageError);
        });
      }

      appState.current = nextAppState;
    };
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [state, dispatch, handleTimerComplete, scheduleNotification]);

  // Main timer logic
  useEffect(() => {
    if (state.isRunning && state.remainingTime > 0) {
      timerRef.current = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (state.remainingTime === 0 && !state.isPaused) {
        handleTimerComplete();
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    state.isRunning,
    state.remainingTime,
    state.isPaused,
    dispatch,
    handleTimerComplete,
  ]);

  // Save state when important changes happen
  useEffect(() => {
    saveState();
  }, [
    state.focusDuration,
    state.breakDuration,
    state.longBreakDuration,
    state.settings,
    saveState,
  ]);

  const startTimer = useCallback(() => {
    dispatch({ type: "START_TIMER" });
    recordSessionStart(state.currentSession);
    if (AppState.currentState !== "active") {
      scheduleNotification();
    }
  }, [
    dispatch,
    recordSessionStart,
    state.currentSession,
    scheduleNotification,
  ]);

  const pauseTimer = () => {
    dispatch({ type: "PAUSE_TIMER" });
    Notifications.cancelAllScheduledNotificationsAsync();
  };

  const resumeTimer = () => {
    dispatch({ type: "RESUME_TIMER" });
    if (AppState.currentState !== "active") {
      scheduleNotification();
    }
  };

  const stopTimer = () => {
    dispatch({ type: "STOP_TIMER" });
    Notifications.cancelAllScheduledNotificationsAsync();
  };

  const resetTimer = () => {
    dispatch({ type: "RESET_TIMER" });
    Notifications.cancelAllScheduledNotificationsAsync();
  };

  const switchSession = (sessionType: "focus" | "break" | "longBreak") => {
    dispatch({ type: "SWITCH_SESSION", payload: sessionType });
    Notifications.cancelAllScheduledNotificationsAsync();
  };

  // Progress calculation (0 to 1) - shows remaining time
  const getProgress = (): number => {
    const totalDuration =
      state.currentSession === "focus"
        ? state.focusDuration * 60
        : state.currentSession === "break"
        ? state.breakDuration * 60
        : state.longBreakDuration * 60;

    // Return remaining time as progress (full ring = full time remaining)
    return state.remainingTime / totalDuration;
  };

  // Session type display
  const getSessionDisplayText = (): string => {
    switch (state.currentSession) {
      case "focus":
        return "Focus Session";
      case "break":
        return "Break Time";
      case "longBreak":
        return "Long Break";
      default:
        return "Session";
    }
  };

  // Session color
  const getSessionColor = (): string => {
    switch (state.currentSession) {
      case "focus":
        return "#007AFF";
      case "break":
        return "#34C759";
      case "longBreak":
        return "#FF9500";
      default:
        return "#007AFF";
    }
  };

  return {
    // State
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    currentSession: state.currentSession,
    remainingTime: state.remainingTime,
    sessionCount: state.sessionCount,

    // Computed values
    formattedTime: formatTime(state.remainingTime),
    progress: getProgress(),
    sessionDisplayText: getSessionDisplayText(),
    sessionColor: getSessionColor(),

    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    switchSession,

    // Settings
    settings: state.settings,
    focusDuration: state.focusDuration,
    breakDuration: state.breakDuration,
    longBreakDuration: state.longBreakDuration,
  };
}
