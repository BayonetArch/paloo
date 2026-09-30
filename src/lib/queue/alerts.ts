/**
 * Alerts for the person waiting, getting louder as the turn comes closer: get
 * ready at five ahead, come back at three ahead, then your turn. Every function
 * reports whether the browser allowed it, so the page can be honest about it.
 */

import { showNotification } from "./service-worker";
import type { TicketView } from "./types";

export type AlertKind = "ready" | "approaching" | "serving";

/** The kinds that raise a banner, as opposed to only making a sound. */
type NotifyingKind = "ready" | "serving";

type Support = {
  vibrate: boolean;
  sound: boolean;
  notify: boolean;
};

type Recipe = {
  /** Frequencies played in turn, in hertz. */
  notes: number[];
  /** Pause and buzz pattern handed to the vibration motor. */
  pattern: number[];
};

const RECIPES: Record<AlertKind, Recipe> = {
  ready: { notes: [587.33], pattern: [80] },
  approaching: { notes: [659.25, 880], pattern: [90, 60, 90] },
  serving: { notes: [880, 1174.66], pattern: [140, 70, 140] },
};

/**
 * The two moments worth interrupting for, and nothing in between. A browser
 * counts the banners a site raises from the background and warns about it, so
 * the middle of the queue is left audible rather than posted.
 */
const BANNERS: Record<NotifyingKind, string> = {
  ready: "Get ready, your turn is close at the account section",
  serving: "It is your turn at the account section",
};

let audio: AudioContext | null = null;

/** What this browser can do. Checked after mount, so call it from an effect. */
export function alertSupport(): Support {
  if (typeof window === "undefined") return { vibrate: false, sound: false, notify: false };
  return {
    vibrate: typeof navigator.vibrate === "function",
    sound: typeof window.AudioContext === "function",
    notify: "Notification" in window,
  };
}

/**
 * Browsers hold sound back until the page has been touched, and an audio
 * context built outside a tap stays suspended for good. So the first touch
 * anywhere builds the context inside the gesture that unlocked it, and the
 * notes play later without a prompt of their own.
 */
export function primeAudio(): boolean {
  if (typeof window === "undefined") return false;

  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
    return true;
  } catch {
    return false;
  }
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** Guards the request that fires on arrival, so several readers ask only once. */
let askedOnArrival = false;

export async function requestNotificationPermissionOnce(): Promise<
  NotificationPermission | "unsupported"
> {
  if (askedOnArrival) return notificationPermission();
  askedOnArrival = true;
  return requestNotificationPermission();
}

function playNotes(notes: number[]): boolean {
  if (typeof window === "undefined") return false;
  if (!primeAudio() || !audio) return false;

  const start = audio.currentTime + 0.02;

  notes.forEach((frequency, index) => {
    const at = start + index * 0.2;
    const oscillator = audio!.createOscillator();
    const gain = audio!.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);

    oscillator.connect(gain).connect(audio!.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.2);
  });

  return true;
}

function vibrate(pattern: number[]): boolean {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

function bodyFor(kind: NotifyingKind, ticket: TicketView): string {
  if (kind === "serving") {
    return `Token ${ticket.token}. Please go to the account desk.`;
  }

  return `Token ${ticket.token}. You are number ${ticket.position}. Get ready to move to the account section.`;
}

/** True for the kinds that raise a banner, and narrows the kind for the caller. */
function raisesBanner(kind: AlertKind): kind is NotifyingKind {
  return kind in BANNERS;
}

/**
 * The banner at the top of the screen. This goes through the service worker
 * rather than the Notification constructor, because on a phone the constructor
 * is illegal and the worker is the only way to get a real notification.
 */
function notify(kind: NotifyingKind, ticket: TicketView): Promise<boolean> {
  return showNotification(BANNERS[kind], {
    body: bodyFor(kind, ticket),
    // The tag keeps one notification per token instead of a pile up.
    tag: `palo-${ticket.token}`,
    // Tapping the banner should reopen the ticket it is about.
    data: { url: `/ticket/${ticket.token}` },
    vibrate: RECIPES[kind].pattern,
  });
}

export async function fireTurnAlert(kind: AlertKind, ticket: TicketView): Promise<Support> {
  const recipe = RECIPES[kind];
  return {
    vibrate: vibrate(recipe.pattern),
    sound: playNotes(recipe.notes),
    notify: raisesBanner(kind) ? await notify(kind, ticket) : false,
  };
}

/**
 * Lets the holder see the banner once, before they are relying on it to catch
 * their turn. It carries no sound, since the point is only the notification,
 * and it shares the ticket's tag, so trying it never leaves a second banner
 * sitting on the lock screen.
 */
export function sendTestNotification(token: string): Promise<boolean> {
  return showNotification("Notifications are on", {
    body: `Token ${token}. Your alert will look like this.`,
    tag: `palo-${token}`,
    data: { url: `/ticket/${token}` },
  });
}
