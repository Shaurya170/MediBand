import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Sunday = 1 ... Saturday = 7, per expo-notifications' WeeklyTriggerInput.
const DAY_NAME_TO_WEEKDAY: Record<string, number> = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let androidChannelReady = false;

async function ensureAndroidChannel() {
  if (Platform.OS !== "android" || androidChannelReady) return;
  await Notifications.setNotificationChannelAsync("alarms", {
    name: "Medication Alarms",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: "alarm.wav",
  });
  androidChannelReady = true;
}

export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;

  const { status: newStatus } = await Notifications.requestPermissionsAsync();
  return newStatus === "granted";
}

type AlarmForNotification = {
  id: string;
  medication_name?: string;
  time: string; // "HH:MM"
  days: string[];
  enabled: boolean;
};

export async function cancelAlarmNotifications(alarmId: string) {
  await Promise.all(
    Object.values(DAY_NAME_TO_WEEKDAY).map((weekday) =>
      Notifications.cancelScheduledNotificationAsync(
        `${alarmId}-${weekday}`
      ).catch(() => {})
    )
  );
}

export async function scheduleAlarmNotifications(alarm: AlarmForNotification) {
  // Clear any previously scheduled times for this alarm before re-scheduling.
  await cancelAlarmNotifications(alarm.id);

  if (!alarm.enabled || alarm.days.length === 0) return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await ensureAndroidChannel();

  const [hour, minute] = alarm.time.split(":").map(Number);

  for (const day of alarm.days) {
    const weekday = DAY_NAME_TO_WEEKDAY[day];
    if (!weekday) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `${alarm.id}-${weekday}`,
      content: {
        title: "Medication Reminder",
        body: alarm.medication_name
          ? `Time to take ${alarm.medication_name}`
          : "Time to take your medication",
        sound: "alarm.wav",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId: "alarms",
      },
    });
  }
}
