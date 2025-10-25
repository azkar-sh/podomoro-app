import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const [focusDuration, setFocusDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  const [longBreakDuration, setLongBreakDuration] = useState(15); // minutes

  const handleTimerSetting = (
    type: "focus" | "break" | "longBreak",
    increment: boolean
  ) => {
    const step = 5; // 5-minute increments

    switch (type) {
      case "focus":
        const newFocus = increment
          ? Math.min(focusDuration + step, 60)
          : Math.max(focusDuration - step, 5);
        setFocusDuration(newFocus);
        break;
      case "break":
        const newBreak = increment
          ? Math.min(breakDuration + step, 30)
          : Math.max(breakDuration - step, 5);
        setBreakDuration(newBreak);
        break;
      case "longBreak":
        const newLongBreak = increment
          ? Math.min(longBreakDuration + step, 60)
          : Math.max(longBreakDuration - step, 10);
        setLongBreakDuration(newLongBreak);
        break;
    }
  };

  const handleThemeChange = () => {
    Alert.alert(
      "Theme",
      "Theme selection will be implemented with theme context"
    );
  };

  const handleSoundSelection = () => {
    Alert.alert("Sound Selection", "Sound picker will be implemented");
  };

  const SettingRow = ({
    title,
    subtitle,
    icon,
    rightComponent,
    onPress,
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Pressable style={styles.settingRow} onPress={onPress}>
      <ThemedView style={styles.settingLeft}>
        <IconSymbol
          name={icon as any}
          size={24}
          color={colorScheme === "dark" ? "#fff" : "#000"}
        />
        <ThemedView style={styles.settingText}>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
          )}
        </ThemedView>
      </ThemedView>
      {rightComponent}
    </Pressable>
  );

  const TimerSetting = ({
    title,
    value,
    onDecrease,
    onIncrease,
  }: {
    title: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
  }) => (
    <ThemedView style={styles.timerSetting}>
      <ThemedText style={styles.timerSettingTitle}>{title}</ThemedText>
      <ThemedView style={styles.timerControls}>
        <Pressable style={styles.timerButton} onPress={onDecrease}>
          <ThemedText style={styles.timerButtonText}>-</ThemedText>
        </Pressable>
        <ThemedText style={styles.timerValue}>{value}m</ThemedText>
        <Pressable style={styles.timerButton} onPress={onIncrease}>
          <ThemedText style={styles.timerButtonText}>+</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Settings */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Timer Settings
          </ThemedText>

          <TimerSetting
            title="Focus Duration"
            value={focusDuration}
            onDecrease={() => handleTimerSetting("focus", false)}
            onIncrease={() => handleTimerSetting("focus", true)}
          />

          <TimerSetting
            title="Break Duration"
            value={breakDuration}
            onDecrease={() => handleTimerSetting("break", false)}
            onIncrease={() => handleTimerSetting("break", true)}
          />

          <TimerSetting
            title="Long Break Duration"
            value={longBreakDuration}
            onDecrease={() => handleTimerSetting("longBreak", false)}
            onIncrease={() => handleTimerSetting("longBreak", true)}
          />
        </ThemedView>

        {/* Notifications */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Notifications
          </ThemedText>

          <SettingRow
            title="Push Notifications"
            subtitle="Get notified when timer completes"
            icon="bell.fill"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={notificationsEnabled ? "#f4f3f4" : "#f4f3f4"}
              />
            }
          />

          <SettingRow
            title="Sound"
            subtitle="Play sound when timer completes"
            icon="speaker.wave.2.fill"
            rightComponent={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={soundEnabled ? "#f4f3f4" : "#f4f3f4"}
              />
            }
          />

          <SettingRow
            title="Vibration"
            subtitle="Vibrate when timer completes"
            icon="iphone.radiowaves.left.and.right"
            rightComponent={
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: "#767577", true: "#007AFF" }}
                thumbColor={vibrationEnabled ? "#f4f3f4" : "#f4f3f4"}
              />
            }
          />
        </ThemedView>

        {/* Appearance */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Appearance
          </ThemedText>

          <SettingRow
            title="Theme"
            subtitle={`Currently: ${colorScheme === "dark" ? "Dark" : "Light"}`}
            icon="paintbrush.fill"
            rightComponent={
              <IconSymbol name="chevron.right" size={20} color="#999" />
            }
            onPress={handleThemeChange}
          />

          <SettingRow
            title="Notification Sound"
            subtitle="Choose your alert sound"
            icon="music.note"
            rightComponent={
              <IconSymbol name="chevron.right" size={20} color="#999" />
            }
            onPress={handleSoundSelection}
          />
        </ThemedView>

        {/* Data */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data
          </ThemedText>

          <SettingRow
            title="Export Statistics"
            subtitle="Share your focus data"
            icon="square.and.arrow.up"
            rightComponent={
              <IconSymbol name="chevron.right" size={20} color="#999" />
            }
            onPress={() =>
              Alert.alert("Export", "Statistics export coming soon!")
            }
          />

          <SettingRow
            title="Reset All Data"
            subtitle="Clear all statistics and settings"
            icon="trash.fill"
            rightComponent={
              <IconSymbol name="chevron.right" size={20} color="#FF3B30" />
            }
            onPress={() =>
              Alert.alert(
                "Reset Data",
                "Are you sure? This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Reset", style: "destructive" },
                ]
              )
            }
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  timerSetting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  timerSettingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  timerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  timerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  timerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  timerValue: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
});
