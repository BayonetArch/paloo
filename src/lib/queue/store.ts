/**
 * The queue store.
 *
 * Components talk to this interface and nothing else. It keeps the queue in
 * localStorage, shares changes between tabs with BroadcastChannel, and falls
 * back to the storage event when BroadcastChannel is missing.
 *
 * Swapping this for a real API means implementing QueueStore against a server
 * and leaving every component as it is.
 */

import {
  advanceQueue,
  createSeedState,
  deriveTicket,
  issueTicket,
  parseQueueState,
  resetQueue,
  skipTicket,
} from "./core";
import type { DemoSettings, QueueState, TicketView } from "./types";

/** Everything the interface promises. A backend would implement this same list. */
export type QueueStore = {
  /** Whole queue. The reference stays the same until something changes. */
  getState(): QueueState;
  /** A ticket with the numbers a holder needs, or null when it is unknown. */
  getTicket(token: string): TicketView | null;
  /** Issue a token and return it. */
  join(): string;
  /** Finish the current ticket and call the next one. */
  next(): void;
  /** Skip a token as a no show. Defaults to whoever is at the desk. */
  skip(token?: string): void;
  /** Put the seed queue back and forget every token from this run. */
  reset(): void;
  /** Listen for changes. Returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
};

const STORAGE_KEY = "palo.queue.v1";
const CHANNEL_NAME = "palo.queue";

/** Identifies this tab, so it can ignore the messages it sent itself. */
const TAB_ID = Math.random().toString(36).slice(2);

let state: QueueState = createSeedState();
/** The exact text last read from or written to storage, used to spot real changes. */
let lastRaw: string | null = null;
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;
let started = false;

/** Load saved data and start listening to other tabs. Safe to call repeatedly. */
function start(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  // A first visit gets the seed queue, everyone else gets what was saved.
  const raw = window.localStorage.getItem(STORAGE_KEY);
  state = parseQueueState(raw, Date.now());
  lastRaw = raw === null ? serialise(state) : raw;

  if (lastRaw !== raw) write(state);

  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", onRemoteChange);
  }

  // The storage event also covers tabs opened after this one, so it stays
  // registered either way. Reading localStorage before a commit keeps it
  // idempotent and stops two tabs from writing to each other in a loop.
  window.addEventListener("storage", onStorage);
}

function serialise(value: QueueState): string {
  return JSON.stringify(value);
}

function write(next: QueueState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, serialise(next));
  } catch {
    // Private browsing or a full quota. The queue keeps working in memory.
  }
}

/** Tell this tab and every other tab that the queue changed. */
function commit(next: QueueState): void {
  if (next === state) return;
  state = next;
  lastRaw = serialise(next);
  write(next);
  channel?.postMessage({ from: TAB_ID });
  for (const listener of listeners) listener();
}

function onRemoteChange(event: MessageEvent): void {
  if (!event.data || event.data.from === TAB_ID) return;
  reload();
}

function onStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  reload();
}

/** Re-read localStorage, which is the shared source of truth across tabs. */
function reload(): void {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === lastRaw) return;
  lastRaw = raw;
  commit(parseQueueState(raw, Date.now()));
}

export const queueStore: QueueStore = {
  getState() {
    start();
    return state;
  },

  getTicket(token: string) {
    start();
    return deriveTicket(state, token);
  },

  join() {
    start();
    const { state: next, token } = issueTicket(state, Date.now());
    commit(next);
    return token;
  },

  next() {
    start();
    commit(advanceQueue(state, Date.now()));
  },

  skip(token?: string) {
    start();
    commit(skipTicket(state, token, Date.now()));
  },

  reset() {
    start();
    commit(resetQueue(Date.now()));
  },

  subscribe(listener: () => void) {
    start();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Read the queue outside React. Used by the demo driver. */
export function readState(): QueueState {
  reload();
  return queueStore.getState();
}

/** Move the queue on by one. Used by the dashboard, the demo panel and the driver. */
export function advanceOnce(): void {
  reload();
  queueStore.next();
}

/**
 * Change the demo settings. These belong to the prototype only, so they sit
 * beside the store interface instead of inside it. A real backend has no
 * reason to hold them.
 */
export function updateDemoSettings(patch: Partial<DemoSettings>): void {
  start();
  const next = { ...state.demo, ...patch };
  const unchanged =
    next.autoAdvance === state.demo.autoAdvance && next.intervalSeconds === state.demo.intervalSeconds;
  if (unchanged) return;
  if (!next.autoAdvance) {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("palo.driver.v1");
      }
    } catch {
      // Ignore storage errors.
    }
  }
  commit({ ...state, demo: next });
}
