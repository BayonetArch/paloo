/**
 * Auto advance, used by the demo controls to play the part of the person at
 * the desk.
 *
 * The setting lives in the queue state, so every tab shows the same toggle.
 * Only one tab should move the queue on, so each tick claims a short lease in
 * localStorage first. If the tab holding it closes, the lease runs out and
 * another tab takes over on its next tick.
 */

import { advanceOnce, readState } from "./store";

const LEASE_KEY = "palo.driver.v1";

/** Identifies this tab among the tabs competing for the lease. */
const TAB_ID = Math.random().toString(36).slice(2);

type Lease = { tabId: string; expiresAt: number };

function readLease(): Lease | null {
  try {
    const raw = window.localStorage.getItem(LEASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Lease>;
    if (typeof parsed.tabId !== "string" || typeof parsed.expiresAt !== "number") return null;
    return { tabId: parsed.tabId, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

/**
 * Try to become the tab that advances the queue. The lease lasts one interval,
 * so each tab gets a turn to renew it and no two tabs move the queue together.
 */
export function claimDriverLease(intervalSeconds: number): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const current = readLease();

  if (current && current.tabId !== TAB_ID && current.expiresAt > now) return false;

  try {
    window.localStorage.setItem(LEASE_KEY, JSON.stringify({ tabId: TAB_ID, expiresAt: now + intervalSeconds * 1000 }));
    return true;
  } catch {
    // Without storage the lease cannot be held, so this tab just plays along.
    return true;
  }
}

/** One step of the automatic queue, if this tab holds the lease. */
export function autoAdvanceTick(intervalSeconds: number): void {
  const state = readState();
  if (!state.demo.autoAdvance) return;
  if (!claimDriverLease(intervalSeconds)) return;

  advanceOnce();
}
