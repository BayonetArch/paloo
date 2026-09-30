/**
 * Alerts for the person waiting.
 *
 * Every function reports whether the browser allowed it, so the ticket page
 * can be honest about what it did and what it could not do.
 */

import type { TicketView } from "./types";

export type AlertKind = "approaching" | "serving";

type Support = {
  vibrate: boolean;
  sound: boolean;
  notify: boolean;
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

/** Two short notes. Approaching is a lower pair, your turn is brighter. */
function playNotes(kind: AlertKind): boolean {
  if (typeof window === "undefined") return false;

  try {
    audio ??= new AudioContext();
  } catch {
    return false;
  }

  if (audio.state === "suspended") void audio.resume();

  const notes = kind === "serving" ? [880, 1174.66] : [659.25, 880];
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

function vibrate(kind: AlertKind): boolean {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  try {
    return navigator.vibrate(kind === "serving" ? [140, 70, 140] : [90, 60, 90]);
  } catch {
    return false;
  }
}

function notify(kind: AlertKind, ticket: TicketView): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const title = kind === "serving" ? "It is your turn at the account section" : "Your turn is close at the account section";
  const body =
    kind === "serving"
      ? `Token ${ticket.token}. Please go to the account desk.`
      : `Token ${ticket.token}. You are number ${ticket.position}. Please return to the account section.`;

  try {
    // The tag keeps one notification per token instead of a pile up.
    const notification = new Notification(title, { body, tag: `palo-${ticket.token}` });
    setTimeout(() => notification.close(), 15_000);
    return true;
  } catch {
    return false;
  }
}

/** Run every alert the browser allows for this change of state. */
export function fireTurnAlert(kind: AlertKind, ticket: TicketView): Support {
  return {
    vibrate: vibrate(kind),
    sound: playNotes(kind),
    notify: notify(kind, ticket),
  };
}
