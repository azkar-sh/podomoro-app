import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useReducer } from "react";

// Types
export type SessionType = "focus" | "break" | "longBreak";

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentSession: SessionType;
  remainingTime: number; // in seconds
  sessionCount: number;
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // after how many focus sessions
  settings: {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
}

export type TimerAction =
  | { type: "START_TIMER" }
  | { type: "PAUSE_TIMER" }
  | { type: "RESUME_TIMER" }
  | { type: "STOP_TIMER" }
  | { type: "RESET_TIMER" }
  | { type: "TICK" }
  | { type: "COMPLETE_SESSION" }
  | { type: "SWITCH_SESSION"; payload: SessionType }
  | { type: "UPDATE_SETTINGS"; payload: Partial<TimerState["settings"]> }
  | {
      type: "SET_DURATION";
      payload: { type: "focus" | "break" | "longBreak"; duration: number };
    }
  | { type: "LOAD_STATE"; payload: Partial<TimerState> };

// Initial state
const initialState: TimerState = {
  isRunning: false,
  isPaused: false,
  currentSession: "focus",
  remainingTime: 25 * 60, // 25 minutes in seconds
  sessionCount: 0,
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4, // Long break after every 4 focus sessions
  settings: {
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

// Reducer
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "START_TIMER":
      return {
        ...state,
        isRunning: true,
        isPaused: false,
      };

    case "PAUSE_TIMER":
      return {
        ...state,
        isRunning: false,
        isPaused: true,
      };

    case "RESUME_TIMER":
      return {
        ...state,
        isRunning: true,
        isPaused: false,
      };

    case "STOP_TIMER":
      return {
        ...state,
        isRunning: false,
        isPaused: false,
      };

    case "RESET_TIMER":
      const duration =
        state.currentSession === "focus"
          ? state.focusDuration
          : state.currentSession === "break"
          ? state.breakDuration
          : state.longBreakDuration;

      return {
        ...state,
        isRunning: false,
        isPaused: false,
        remainingTime: duration * 60,
      };

    case "TICK":
      if (state.remainingTime <= 1) {
        // Timer completed
        return {
          ...state,
          remainingTime: 0,
          isRunning: false,
        };
      }
      return {
        ...state,
        remainingTime: state.remainingTime - 1,
      };

    case "COMPLETE_SESSION":
      let nextSession: SessionType;
      let newSessionCount = state.sessionCount;

      if (state.currentSession === "focus") {
        newSessionCount += 1;
        // Check if it's time for a long break
        if (newSessionCount % state.longBreakInterval === 0) {
          nextSession = "longBreak";
        } else {
          nextSession = "break";
        }
      } else {
        // After any break, go back to focus
        nextSession = "focus";
      }

      const nextDuration =
        nextSession === "focus"
          ? state.focusDuration
          : nextSession === "break"
          ? state.breakDuration
          : state.longBreakDuration;

      return {
        ...state,
        currentSession: nextSession,
        remainingTime: nextDuration * 60,
        sessionCount: newSessionCount,
        isRunning: false,
        isPaused: false,
      };

    case "SWITCH_SESSION":
      const switchDuration =
        action.payload === "focus"
          ? state.focusDuration
          : action.payload === "break"
          ? state.breakDuration
          : state.longBreakDuration;

      return {
        ...state,
        currentSession: action.payload,
        remainingTime: switchDuration * 60,
        isRunning: false,
        isPaused: false,
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case "SET_DURATION":
      const updatedState = {
        ...state,
        [action.payload.type === "focus"
          ? "focusDuration"
          : action.payload.type === "break"
          ? "breakDuration"
          : "longBreakDuration"]: action.payload.duration,
      };

      // Update remaining time if we're currently in this session type and not running
      if (
        !state.isRunning &&
        ((action.payload.type === "focus" &&
          state.currentSession === "focus") ||
          (action.payload.type === "break" &&
            state.currentSession === "break") ||
          (action.payload.type === "longBreak" &&
            state.currentSession === "longBreak"))
      ) {
        updatedState.remainingTime = action.payload.duration * 60;
      }

      return updatedState;

    case "LOAD_STATE":
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

// Context
interface TimerContextType {
  state: TimerState;
  dispatch: React.Dispatch<TimerAction>;
  // Helper functions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  switchSession: (session: SessionType) => void;
  completeSession: () => void;
  updateSettings: (settings: Partial<TimerState["settings"]>) => void;
  setDuration: (
    type: "focus" | "break" | "longBreak",
    duration: number
  ) => void;
  formatTime: (seconds: number) => string;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Storage keys
const TIMER_STATE_KEY = "@focusTimer:state";
const TIMER_SETTINGS_KEY = "@focusTimer:settings";

// Provider component
export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // Helper functions
  const startTimer = () => dispatch({ type: "START_TIMER" });
  const pauseTimer = () => dispatch({ type: "PAUSE_TIMER" });
  const resumeTimer = () => dispatch({ type: "RESUME_TIMER" });
  const stopTimer = () => dispatch({ type: "STOP_TIMER" });
  const resetTimer = () => dispatch({ type: "RESET_TIMER" });

  const switchSession = (session: SessionType) => {
    dispatch({ type: "SWITCH_SESSION", payload: session });
  };

  const completeSession = () => dispatch({ type: "COMPLETE_SESSION" });

  const updateSettings = (settings: Partial<TimerState["settings"]>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
  };

  const setDuration = (
    type: "focus" | "break" | "longBreak",
    duration: number
  ) => {
    dispatch({ type: "SET_DURATION", payload: { type, duration } });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Persistence functions
  const saveState = async () => {
    try {
      const stateToSave = {
        sessionCount: state.sessionCount,
        focusDuration: state.focusDuration,
        breakDuration: state.breakDuration,
        longBreakDuration: state.longBreakDuration,
        longBreakInterval: state.longBreakInterval,
      };

      await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(stateToSave));
      await AsyncStorage.setItem(
        TIMER_SETTINGS_KEY,
        JSON.stringify(state.settings)
      );
    } catch (error) {
      console.error("Failed to save timer state:", error);
    }
  };

  const loadState = async () => {
    try {
      const [savedState, savedSettings] = await Promise.all([
        AsyncStorage.getItem(TIMER_STATE_KEY),
        AsyncStorage.getItem(TIMER_SETTINGS_KEY),
      ]);

      let stateToLoad: Partial<TimerState> = {};

      if (savedState) {
        const parsedState = JSON.parse(savedState);
        stateToLoad = { ...stateToLoad, ...parsedState };
      }

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        stateToLoad.settings = { ...initialState.settings, ...parsedSettings };
      }

      if (Object.keys(stateToLoad).length > 0) {
        dispatch({ type: "LOAD_STATE", payload: stateToLoad });
      }
    } catch (error) {
      console.error("Failed to load timer state:", error);
    }
  };

  const contextValue: TimerContextType = {
    state,
    dispatch,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    switchSession,
    completeSession,
    updateSettings,
    setDuration,
    formatTime,
    saveState,
    loadState,
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
}

// Hook to use timer context
export function useTimer(): TimerContextType {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}

// Export for convenience
export default TimerContext;
