/** Remembers which token belongs to this browser, so /join and a refresh return to the same ticket. */

import { normaliseToken } from "./queue/tokens";

const STORAGE_KEY = "palo.my-token.v1";

export function readMyToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normaliseToken(window.localStorage.getItem(STORAGE_KEY) ?? "");
  } catch {
    return null;
  }
}

export function saveMyToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Saving is a convenience, so a failure here should not stop the flow.
  }
}

export function clearMyToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
