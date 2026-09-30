/**
 * Token helpers. A token is a prefix and a number, such as A-127.
 */

/** Prefix used for every token in this prototype. */
export const TOKEN_PREFIX = "A";

/** Build a token from a number, for example formatToken(127) gives A-127. */
export function formatToken(value: number): string {
  return `${TOKEN_PREFIX}-${value}`;
}

/**
 * Read the number out of a token. Tolerates a missing or extra dash and any
 * casing, so a hand typed a 127 still finds A-127. Returns null when the value
 * is not a token at all.
 */
export function parseToken(value: string): number | null {
  const match = /^\s*([a-z])\s*-?\s*(\d+)\s*$/i.exec(value);
  if (!match) return null;
  const prefix = match[1].toUpperCase();
  if (prefix !== TOKEN_PREFIX) return null;
  const number = Number.parseInt(match[2], 10);
  return Number.isFinite(number) ? number : null;
}

/** Normalise any token shaped value to its canonical form, or null. */
export function normaliseToken(value: string): string | null {
  const number = parseToken(value);
  return number === null ? null : formatToken(number);
}
