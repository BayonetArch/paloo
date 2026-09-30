/**
 * Alerts for the person waiting.
 *
 * There are three of them, and they get louder as the turn comes closer: get
 * ready at five ahead, come back at three ahead, then your turn.
 *
 * Every function reports whether the browser allowed it, so the ticket page
 * can be honest about what it did and what it could not do.
 */

import type { TicketView } from "./types";

export type AlertKind = "ready" | "approaching" | "serving";

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
  title: string;
};

const RECIPES: Record<AlertKind, Recipe> = {
  ready: {
    notes: [587.33],
    pattern: [80],
    title: "Get ready, your turn is close at the account section",
  },
  approaching: {
    notes: [659.25, 880],
    pattern: [90, 60, 90],
    title: "Your turn is close, return to the account section",
  },
  serving: {
    notes: [880, 1174.66],
    pattern: [140, 70, 140],
    title: "It is your turn at the account section",
  },
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

/** Notification permission: granted, denied or still to ask. */
export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/** Ask for permission to show notifications. Resolves to the new permission. */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** Play the notes for this alert. Each kind gets its own short phrase. */
function playNotes(notes: number[]): boolean {
  if (typeof window === "undefined") return false;

  try {
    audio ??= new AudioContext();
  } catch {
    return false;
  }

  if (audio.state === "suspended") void audio.resume();

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

function bodyFor(kind: AlertKind, ticket: TicketView): string {
  if (kind === "serving") {
    return `Token ${ticket.token}. Please go to the account desk.`;
  }

  if (kind === "ready") {
    return `Token ${ticket.token}. You are number ${ticket.position}. Get ready to move to the account section.`;
  }

  return `Token ${ticket.token}. You are number ${ticket.position}. Please return to the account section.`;
}

function notify(kind: AlertKind, ticket: TicketView): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  try {
    // The tag keeps one notification per token instead of a pile up.
    const notification = new Notification(RECIPES[kind].title, {
      body: bodyFor(kind, ticket),
      tag: `palo-${ticket.token}`,
    });
    setTimeout(() => notification.close(), 15_000);
    return true;
  } catch {
    return false;
  }
}

/** Run every alert the browser allows for this change of state. */
export function fireTurnAlert(kind: AlertKind, ticket: TicketView): Support {
  const recipe = RECIPES[kind];
  return {
    vibrate: vibrate(recipe.pattern),
    sound: playNotes(recipe.notes),
    notify: notify(kind, ticket),
  };
}
