/**
 * Remembers which token belongs to this browser, so opening /join again or
 * refreshing the ticket page returns to the same ticket.
 */

import { normaliseToken } from "./queue/tokens";

const STORAGE_KEY = "palo.my-token.v1";

/** The token this browser last joined with, or null. */
export function readMyToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normaliseToken(window.localStorage.getItem(STORAGE_KEY) ?? "");
  } catch {
    return null;
  }
}

/** Remember this browser's token. */
export function saveMyToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Saving is a convenience, so a failure here should not stop the flow.
  }
}

/** Forget this browser's token, used after a reset. */
export function clearMyToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do, the token simply stays.
  }
}
