/** Token helpers. A token is a prefix and a number, such as A-127. */

export const TOKEN_PREFIX = "A";

export function formatToken(value: number): string {
  return `${TOKEN_PREFIX}-${value}`;
}

/** Tolerates a missing or extra dash and any casing, so a hand typed a 127 still finds A-127. */
export function parseToken(value: string): number | null {
  const match = /^\s*([a-z])\s*-?\s*(\d+)\s*$/i.exec(value);
  if (!match) return null;
  const prefix = match[1].toUpperCase();
  if (prefix !== TOKEN_PREFIX) return null;
  const number = Number.parseInt(match[2], 10);
  return Number.isFinite(number) ? number : null;
}

export function normaliseToken(value: string): string | null {
  const number = parseToken(value);
  return number === null ? null : formatToken(number);
}
