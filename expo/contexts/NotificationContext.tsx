import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

const LAST_SCAN_KEY = "@kiwi_last_scan_time";
const NOTIFICATIONS_SETUP_KEY = "@kiwi_notifications_setup";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleDailyReminder() {
  // Cancel existing daily reminders before rescheduling
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if ((n.content.data as any)?.type === "daily_reminder") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Schedule daily at 10 AM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "What's in your food today?",
      body: "Take 5 seconds to scan a label — you might be surprised.",
      data: { type: "daily_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 10,
      minute: 0,
    },
  });
}

async function scheduleLapsedUserNudge() {
  // Cancel existing lapsed nudges
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if ((n.content.data as any)?.type === "lapsed_nudge") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Send a nudge 3 days from now
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your groceries aren't scanning themselves",
      body: "You haven't scanned in a few days. Your pantry might have some surprises.",
      data: { type: "lapsed_nudge" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3 * 24 * 60 * 60, // 3 days
    },
  });
}

async function scheduleWeeklyDigest() {
  // Cancel existing weekly digests
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if ((n.content.data as any)?.type === "weekly_digest") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Weekly on Sunday at 6 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your weekly scan recap",
      body: "See what you scanned this week and check for healthier swaps.",
      data: { type: "weekly_digest" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 18,
      minute: 0,
    },
  });
}

export async function setupNotifications() {
  if (Platform.OS === "web") return;

  const granted = await requestPermissions();
  if (!granted) return;

  const alreadySetup = await AsyncStorage.getItem(NOTIFICATIONS_SETUP_KEY);
  if (alreadySetup === "true") return;

  await scheduleDailyReminder();
  await scheduleLapsedUserNudge();
  await scheduleWeeklyDigest();

  await AsyncStorage.setItem(NOTIFICATIONS_SETUP_KEY, "true");
}

// Call this after each scan to reset the lapsed user timer
export async function recordScanForNotifications() {
  if (Platform.OS === "web") return;

  await AsyncStorage.setItem(LAST_SCAN_KEY, String(Date.now()));

  // Reschedule lapsed nudge (resets the 3-day timer)
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") {
    await scheduleLapsedUserNudge();
  }
}

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    setupNotifications();

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      // Could route to specific screens based on notification type
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {};
});
