"use client";

/**
 * Watches a ticket and alerts the holder as the turn comes closer. Each state
 * change alerts once, and the screen is held awake while someone waits, since
 * a phone that dims or locks is a phone that misses the call.
 */

import { useEffect, useRef } from "react";

import { fireTurnAlert, primeAudio } from "./alerts";
import { registerAlertWorker } from "./service-worker";
import { APPROACHING_POSITION, PREPARE_POSITION, type TicketView } from "./types";
import { acquireWakeLock, releaseWakeLock, watchVisibility } from "./wake-lock";

export type AlertPhase = "waiting" | "ready" | "approaching" | "serving" | "closed";

export function alertPhase(ticket: TicketView | null): AlertPhase {
  if (!ticket) return "waiting";
  if (ticket.status === "completed" || ticket.status === "skipped") return "closed";
  if (ticket.status === "serving") return "serving";
  if (ticket.position === null) return "waiting";
  if (ticket.position <= APPROACHING_POSITION) return "approaching";
  if (ticket.position <= PREPARE_POSITION) return "ready";
  return "waiting";
}

const ALERTING: AlertPhase[] = ["ready", "approaching", "serving"];

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
    if (ALERTING.includes(phase) && ticket) {
      void fireTurnAlert(phase as "ready" | "approaching" | "serving", ticket);
    }
  }, [phase, ticket]);

  // A phone will not play a sound until the page has been touched, so the
  // first tap anywhere primes the audio long before the turn is close.
  useEffect(() => {
    const prime = () => primeAudio();

    window.addEventListener("pointerdown", prime, { once: true, capture: true });
    window.addEventListener("keydown", prime, { once: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", prime, { capture: true });
      window.removeEventListener("keydown", prime);
    };
  }, []);

  // The worker is what raises the banner, so it starts installing now rather
  // than on the turn that needs it.
  useEffect(() => {
    registerAlertWorker();
  }, []);

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
