import {
  addSnoozeRequestedListener,
  cancelPendingSnooze,
  getPendingSnooze,
  snoozePendingAlarm,
} from "@/utils/alarmKit";
import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";

// Longest custom snooze allowed, in minutes (12 hours).
const MAX_SNOOZE_MINUTES = 720;

/**
 * Asks how long to snooze after an alarm's Snooze button is tapped. The native
 * side already scheduled a 5-minute backup snooze, so the reminder comes back
 * even if this prompt is never answered. Renders nothing.
 */
export default function SnoozePrompt() {
  const isShowing = useRef(false);

  useEffect(() => {
    async function snooze(minutes: number) {
      try {
        await snoozePendingAlarm(minutes);
        Alert.alert(
          "Snoozed",
          `Your alarm will ring again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
          [{ text: "OK", onPress: () => (isShowing.current = false) }]
        );
      } catch (error) {
        isShowing.current = false;
        Alert.alert(
          "Couldn't snooze",
          `${error instanceof Error ? error.message : error}\n\nYour alarm will still ring again in 5 minutes.`
        );
      }
    }

    function askCustomMinutes() {
      Alert.prompt(
        "Custom Snooze",
        "How many minutes?",
        [
          { text: "Back", style: "cancel", onPress: showSnoozeOptions },
          {
            text: "Snooze",
            onPress: (value?: string) => {
              const minutes = Number(value);
              if (Number.isInteger(minutes) && minutes >= 1 && minutes <= MAX_SNOOZE_MINUTES) {
                snooze(minutes);
              } else {
                Alert.alert(
                  "Invalid Time",
                  `Enter a whole number of minutes from 1 to ${MAX_SNOOZE_MINUTES}.`,
                  [{ text: "OK", onPress: askCustomMinutes }]
                );
              }
            },
          },
        ],
        "plain-text",
        "",
        "number-pad"
      );
    }

    // For when Snooze was tapped by mistake: turns the alarm off instead.
    function confirmCancelSnooze() {
      Alert.alert(
        "Cancel Snooze?",
        "The alarm won't ring again until its next scheduled time.",
        [
          { text: "Back", style: "cancel", onPress: showSnoozeOptions },
          {
            text: "Cancel Snooze",
            style: "destructive",
            onPress: async () => {
              try {
                await cancelPendingSnooze();
                isShowing.current = false;
              } catch (error) {
                isShowing.current = false;
                Alert.alert(
                  "Couldn't cancel snooze",
                  `${error instanceof Error ? error.message : error}\n\nYour alarm will still ring again in 5 minutes.`
                );
              }
            },
          },
        ]
      );
    }

    function showSnoozeOptions() {
      Alert.alert(
        "Snooze Alarm",
        "How long do you want to snooze?",
        [
          { text: "5 minutes", onPress: () => snooze(5) },
          { text: "10 minutes", onPress: () => snooze(10) },
          { text: "Custom", onPress: askCustomMinutes },
          { text: "Cancel", style: "cancel", onPress: confirmCancelSnooze },
        ],
        { cancelable: false }
      );
    }

    async function checkForPendingSnooze() {
      if (isShowing.current) return;
      const pending = await getPendingSnooze();
      if (!pending || isShowing.current) return;
      isShowing.current = true;
      showSnoozeOptions();
    }

    checkForPendingSnooze();
    const snoozeListener = addSnoozeRequestedListener(checkForPendingSnooze);
    const appStateListener = AppState.addEventListener("change", (state) => {
      if (state === "active") checkForPendingSnooze();
    });

    return () => {
      snoozeListener.remove();
      appStateListener.remove();
    };
  }, []);

  return null;
}
