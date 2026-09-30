/**
 * The queue store. Components talk to this interface and nothing else. A real
 * API would implement QueueStore against a server, leaving every component as
 * it is.
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

export type QueueStore = {
  /** The reference stays the same until something changes. */
  getState(): QueueState;
  getTicket(token: string): TicketView | null;
  join(): string;
  next(): void;
  skip(token?: string): void;
  reset(): void;
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

function start(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  state = parseQueueState(raw, Date.now());
  lastRaw = raw === null ? serialise(state) : raw;

  if (lastRaw !== raw) write(state);

  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", onRemoteChange);
  }

  // The storage event also covers tabs opened after this one, so it stays
  // registered either way.
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

export function readState(): QueueState {
  reload();
  return queueStore.getState();
}

export function advanceOnce(): void {
  reload();
  queueStore.next();
}

/** Demo settings sit beside the store interface instead of inside it, because a real backend has no reason to hold them. */
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
    } catch {}
  }
  commit({ ...state, demo: next });
}
