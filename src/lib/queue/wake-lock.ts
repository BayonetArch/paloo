/**
 * Screen wake lock, so a phone does not dim while someone waits.
 *
 * The browser drops the lock whenever the tab is hidden, so it is taken again
 * each time the page comes back to the front.
 */

type Unlock = () => void;

let sentinel: WakeLockSentinel | null = null;
let wanted = false;

/** True when this browser can hold the screen awake. */
export function wakeLockSupported(): boolean {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

/** True when a lock is held right now. */
export function wakeLockHeld(): boolean {
  return sentinel !== null && !sentinel.released;
}

export async function acquireWakeLock(): Promise<void> {
  if (!wakeLockSupported()) return;
  wanted = true;
  try {
    sentinel = await navigator.wakeLock.request("screen");
  } catch {
    // Refused, for example when the device is low on battery.
    sentinel = null;
  }
}

export function releaseWakeLock(): void {
  wanted = false;
  if (!sentinel) return;
  const held = sentinel;
  sentinel = null;
  void held.release().catch(() => undefined);
}

/** Take the lock again after the tab was hidden, if it was wanted. */
export async function restoreWakeLock(): Promise<void> {
  if (wanted && !wakeLockHeld()) await acquireWakeLock();
}

/** Wire up the visibility handling. Returns a cleanup function. */
export function watchVisibility(): Unlock {
  if (!wakeLockSupported()) return () => undefined;

  const onVisible = () => {
    if (document.visibilityState === "visible") void restoreWakeLock();
  };

  document.addEventListener("visibilitychange", onVisible);
  return () => document.removeEventListener("visibilitychange", onVisible);
}
