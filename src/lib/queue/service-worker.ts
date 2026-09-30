"use client";

/**
 * The plumbing that turns an alert into a notification at the top of the
 * screen. A phone refuses the Notification constructor outright, so the worker
 * is the only route to that banner, and a desktop browser gets the constructor
 * as a fallback for the moments the worker is not ready.
 */

const WORKER_URL = "/sw.js";
const WORKER_ICON = "/icon-192.png";

/** A banner is only worth waiting a moment for, never worth blocking on. */
const READY_TIMEOUT_MS = 2000;

/** How long a banner the page raised itself stays up. */
const FALLBACK_LIFETIME_MS = 15_000;

type PalooNotificationOptions = NotificationOptions & {
  /** Android honours a vibration pattern on the banner itself. */
  vibrate?: number[];
};

let registration: Promise<ServiceWorkerRegistration | null> | null = null;

function workerSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

function register(): Promise<ServiceWorkerRegistration | null> {
  registration ??= navigator.serviceWorker
    .register(WORKER_URL, { scope: "/", updateViaCache: "none" })
    // A failed registration must never throw into the page that asked for an
    // alert, so every failure ends as "no worker" and the fallback takes over.
    .catch(() => null);

  return registration;
}

/**
 * Starts the worker as soon as a ticket is on screen, so the first alert does
 * not have to wait for an install that has only just begun. Safe to call on
 * every render, and safe to call never: the fallback covers a missing worker.
 */
export function registerAlertWorker(): void {
  if (!workerSupported()) return;
  void register();
}

/** The worker, once it is active, or null if it never turns up in time. */
async function activeWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!workerSupported()) return null;

  const registered = await register();
  if (!registered) return null;

  return Promise.race([
    registered.active ? Promise.resolve(registered) : navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), READY_TIMEOUT_MS)),
  ]);
}

/**
 * Raises a notification through the worker when there is one, so it shows at
 * the top of the screen even with this page in the background. Reports whether
 * the browser accepted it, like the rest of the alerts do.
 */
export async function showNotification(
  title: string,
  options: PalooNotificationOptions,
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const shared = { ...options, icon: options.icon ?? WORKER_ICON };

  const worker = await activeWorker();

  if (worker) {
    try {
      await worker.showNotification(title, shared);
      return true;
    } catch {
      // Some browsers only allow a worker notification while it is installed.
    }
  }

  try {
    const notification = new Notification(title, shared);
    setTimeout(() => notification.close(), FALLBACK_LIFETIME_MS);
    return true;
  } catch {
    return false;
  }
}
