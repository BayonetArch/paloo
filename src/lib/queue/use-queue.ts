"use client";

/**
 * React bindings for the queue store.
 *
 * useSyncExternalStore gives the store a stable snapshot, so any change in any
 * tab re-renders every component that reads the queue.
 */

import { useMemo, useSyncExternalStore } from "react";

import { createSeedState, deriveTicket } from "./core";
import { queueStore } from "./store";
import type { QueueState, TicketView } from "./types";

/** The seed queue, used for the markup React renders on the server. */
const SERVER_STATE = createSeedState();

function subscribe(listener: () => void) {
  return queueStore.subscribe(listener);
}

/** The whole queue. Re-renders on every change, from this tab or any other. */
export function useQueueState(): QueueState {
  return useSyncExternalStore(
    subscribe,
    () => queueStore.getState(),
    () => SERVER_STATE,
  );
}

/** One ticket with its position and estimate. Null when the token is unknown. */
export function useTicket(token: string | null | undefined): TicketView | null {
  const state = useQueueState();
  return useMemo(() => (token ? deriveTicket(state, token) : null), [state, token]);
}

/**
 * False while React renders the markup that came from the server, then true
 * once the browser snapshot is in place. Pages use it to hold back anything
 * that depends on saved data, which avoids a flash of seed values.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
