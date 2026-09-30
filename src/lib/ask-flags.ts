"use client";

/**
 * The two answers a holder gives the page and expects it to remember: whether
 * they put the notification card away, and whether they put the home screen
 * hint away. They are read through useSyncExternalStore rather than an effect,
 * so a saved answer never arrives as a correction after the first render.
 */

const STORAGE_KEY = "palo.ask-flags.v1";

export type AskFlags = {
  /** The notification card was put away without being answered. */
  notification: boolean;
  /** The home screen hint was put away. */
  homeScreen: boolean;
};

export type AskFlag = keyof AskFlags;

const DEFAULT: AskFlags = { notification: false, homeScreen: false };

let flags: AskFlags = DEFAULT;
const listeners = new Set<() => void>();
let started = false;

function parse(raw: string | null): AskFlags {
  if (!raw) return DEFAULT;

  try {
    const saved = JSON.parse(raw) as Partial<AskFlags>;
    return {
      notification: saved.notification === true,
      homeScreen: saved.homeScreen === true,
    };
  } catch {
    return DEFAULT;
  }
}

function start(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  flags = parse(window.localStorage.getItem(STORAGE_KEY));
}

function commit(next: AskFlags): void {
  if (next.notification === flags.notification && next.homeScreen === flags.homeScreen) return;

  flags = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing or a full quota. The prompt simply asks again.
  }

  for (const listener of listeners) listener();
}

export const askStore = {
  /** The reference stays the same until an answer changes it. */
  getFlags(): AskFlags {
    start();
    return flags;
  },

  setFlag(name: AskFlag, value: boolean): void {
    start();
    commit({ ...flags, [name]: value });
  },

  subscribe(listener: () => void): () => void {
    start();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
