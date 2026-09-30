"use client";

/**
 * Watches a ticket and alerts the holder when the turn is close or arrives.
 *
 * Each state change alerts once. The screen is held awake while someone waits,
 * since a phone that dims or locks is a phone that misses the call.
 */

import { useEffect, useRef } from "react";

import { fireTurnAlert } from "./alerts";
import { APPROACHING_POSITION, type TicketView } from "./types";
import { acquireWakeLock, releaseWakeLock, watchVisibility } from "./wake-lock";

/** What the page is showing, which is what alerts are driven from. */
export type AlertPhase = "waiting" | "approaching" | "serving" | "closed";

/** Work out the phase from the ticket the store gave us. */
export function alertPhase(ticket: TicketView | null): AlertPhase {
  if (!ticket) return "waiting";
  if (ticket.status === "completed" || ticket.status === "skipped") return "closed";
  if (ticket.status === "serving") return "serving";
  if (ticket.position !== null && ticket.position <= APPROACHING_POSITION) return "approaching";
  return "waiting";
}

/** Fire the alerts for this ticket and keep the screen awake while it waits. */
export function useTurnAlerts(ticket: TicketView | null): void {
  const phase = alertPhase(ticket);
  const lastPhase = useRef<AlertPhase | null>(null);

  useEffect(() => {
    // The phase on arrival is the starting point, so only a change alerts.
    if (lastPhase.current === null) {
      lastPhase.current = phase;
      return;
    }
    if (phase === lastPhase.current) return;

    lastPhase.current = phase;
    if (phase === "approaching" || phase === "serving") {
      if (ticket) fireTurnAlert(phase, ticket);
    }
  }, [phase, ticket]);

  const waiting = phase !== "closed";

  useEffect(() => {
    if (!waiting) return;

    void acquireWakeLock();
    const unwatch = watchVisibility();

    return () => {
      unwatch();
      releaseWakeLock();
    };
  }, [waiting]);
}
