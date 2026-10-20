import { NativeEventEmitter, NativeModules, Platform } from "react-native";

// JavaScript side of native/ios/MediBandAlarmsModule.swift. AlarmKit alarms keep
// ringing until the person taps Stop or Snooze (iOS 26+ only).
const NativeAlarms = Platform.OS === "ios" ? NativeModules.MediBandAlarmsModule : undefined;

export type PendingSnooze = {
  alarmKey: string;
  title: string;
};

export async function isAlarmKitSupported(): Promise<boolean> {
  return NativeAlarms ? NativeAlarms.isSupported() : false;
}

export async function requestAlarmAuthorization(): Promise<boolean> {
  return NativeAlarms.requestAuthorization();
}

/** `weekdays` uses 1 = Sunday ... 7 = Saturday. */
export async function scheduleWeeklyAlarm(
  key: string,
  title: string,
  hour: number,
  minute: number,
  weekdays: number[]
): Promise<void> {
  await NativeAlarms.scheduleWeekly(key, title, hour, minute, weekdays);
}

/** Cancels the repeating alarm and any snoozes for this alarm. */
export async function cancelAlarmKitAlarm(key: string): Promise<void> {
  if (NativeAlarms) await NativeAlarms.cancelAlarm(key);
}

/** The alarm whose Snooze button was tapped, waiting for a snooze length. */
export async function getPendingSnooze(): Promise<PendingSnooze | null> {
  return NativeAlarms ? NativeAlarms.getPendingSnooze() : null;
}

/** Re-rings the pending alarm after `minutes`, replacing its 5-minute backup snooze. */
export async function snoozePendingAlarm(minutes: number): Promise<void> {
  await NativeAlarms.snooze(minutes);
}

/** Cancels the pending snooze (Snooze was tapped by mistake), so the alarm stays off. */
export async function cancelPendingSnooze(): Promise<void> {
  await NativeAlarms.cancelPendingSnooze();
}

/** Calls `listener` when an alarm's Snooze button is tapped while the app is running. */
export function addSnoozeRequestedListener(listener: () => void) {
  if (!NativeAlarms) return { remove() {} };
  return new NativeEventEmitter(NativeAlarms).addListener("snoozeRequested", listener);
}
