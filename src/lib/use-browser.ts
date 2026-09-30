"use client";

/**
 * Reads for values the browser owns, such as the host name and the
 * notification permission.
 *
 * These come from the environment rather than from React, so they are read
 * through useSyncExternalStore. That keeps the first render free of a
 * correction in an effect.
 */

import { useSyncExternalStore } from "react";

import { notificationPermission } from "@/lib/queue/alerts";

/** These values do not change on their own, so nothing has to watch them. */
export function subscribeToNothing() {
  return () => undefined;
}

/** The host the app is running on, empty during server rendering. */
export function useOrigin(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () => window.location.origin,
    () => "",
  );
}

/** Notification permission for this site. */
export function useNotificationPermission(): NotificationPermission | "unsupported" {
  return useSyncExternalStore(subscribeToNothing, notificationPermission, () => "unsupported");
}
