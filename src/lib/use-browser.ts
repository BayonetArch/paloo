"use client";

/**
 * Reads for values the browser owns, such as the host name and the
 * notification permission. These come from the environment rather than from
 * React, so they are read through useSyncExternalStore, which keeps the first
 * render free of a correction in an effect.
 */

import { useSyncExternalStore } from "react";

import { notificationPermission } from "@/lib/queue/alerts";

/** These values do not change on their own, so nothing has to watch them. */
export function subscribeToNothing() {
  return () => undefined;
}

export function useOrigin(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () => window.location.origin,
    () => "",
  );
}

export function useNotificationPermission(): NotificationPermission | "unsupported" {
  return useSyncExternalStore(subscribeToNothing, notificationPermission, () => "unsupported");
}

/**
 * True on an iPhone or iPad that is showing the page in a browser tab. iOS
 * withholds notifications from a page in that state and only shows them once
 * the app sits on the home screen.
 */
function needsHomeScreen(): boolean {
  if (typeof navigator === "undefined") return false;

  const apple =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // An iPad reports itself as a Mac, so the only tell is the touch screen.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (!apple) return false;

  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  return !standalone && !(navigator as Navigator & { standalone?: boolean }).standalone;
}

export function useNeedsHomeScreen(): boolean {
  return useSyncExternalStore(subscribeToNothing, needsHomeScreen, () => false);
}
