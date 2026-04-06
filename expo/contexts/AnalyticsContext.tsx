import { PostHogProvider as PHProvider, usePostHog } from "posthog-react-native";
import React from "react";

// Set your PostHog API key here (get it from https://app.posthog.com/project/settings)
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "";
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

// Wrapper component that provides PostHog to the app
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_API_KEY) {
    // PostHog not configured — render children without analytics
    return <>{children}</>;
  }

  return (
    <PHProvider
      apiKey={POSTHOG_API_KEY}
      options={{
        host: POSTHOG_HOST,
        enableSessionReplay: true,
      }}
    >
      {children}
    </PHProvider>
  );
}

// Hook for tracking events throughout the app
export function useAnalytics() {
  let posthog: ReturnType<typeof usePostHog> | null = null;

  try {
    posthog = usePostHog();
  } catch {
    // PostHog not configured
  }

  const track = (event: string, properties?: Record<string, any>) => {
    try {
      posthog?.capture(event, properties);
    } catch {}
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    try {
      posthog?.identify(userId, properties);
    } catch {}
  };

  const screen = (screenName: string, properties?: Record<string, any>) => {
    try {
      posthog?.screen(screenName, properties);
    } catch {}
  };

  return { track, identify, screen };
}

// Pre-defined event names for consistency
export const AnalyticsEvents = {
  // Onboarding
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_STEP_VIEWED: "onboarding_step_viewed",
  ONBOARDING_SKIPPED: "onboarding_skipped",
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Paywall
  PAYWALL_VIEWED: "paywall_viewed",
  PAYWALL_PLAN_SELECTED: "paywall_plan_selected",
  PAYWALL_PURCHASE_TAPPED: "paywall_purchase_tapped",
  PAYWALL_PURCHASE_SUCCESS: "paywall_purchase_success",
  PAYWALL_PURCHASE_FAILED: "paywall_purchase_failed",
  PAYWALL_RESTORE_TAPPED: "paywall_restore_tapped",

  // Scanning
  SCAN_STARTED: "scan_started",
  SCAN_COMPLETED: "scan_completed",
  SCAN_FAILED: "scan_failed",
  SCAN_FROM_GALLERY: "scan_from_gallery",

  // Engagement
  RESULT_VIEWED: "result_viewed",
  RESULT_SHARED: "result_shared",
  HISTORY_VIEWED: "history_viewed",
  HISTORY_ITEM_DELETED: "history_item_deleted",
  HISTORY_ITEM_FAVORITED: "history_item_favorited",

  // Referral
  REFERRAL_CODE_COPIED: "referral_code_copied",
  REFERRAL_CODE_SHARED: "referral_code_shared",
  REFERRAL_CODE_REDEEMED: "referral_code_redeemed",

  // Cross-promo
  CROSS_PROMO_SHOWN: "cross_promo_shown",
  CROSS_PROMO_TAPPED: "cross_promo_tapped",
  CROSS_PROMO_DISMISSED: "cross_promo_dismissed",

  // Notifications
  NOTIFICATION_PERMISSION_GRANTED: "notification_permission_granted",
  NOTIFICATION_PERMISSION_DENIED: "notification_permission_denied",
} as const;
