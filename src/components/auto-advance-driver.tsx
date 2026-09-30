"use client";

import { useEffect } from "react";

import { autoAdvanceTick } from "@/lib/queue/driver";
import { useQueueState } from "@/lib/queue/use-queue";

/**
 * Runs the auto-advance timer at the application root so that the queue
 * continues advancing even when the demo controls panel is collapsed or closed.
 */
export function AutoAdvanceDriver() {
  const { demo } = useQueueState();
  const enabled = demo.autoAdvance;
  const intervalSeconds = demo.intervalSeconds || 5;

  useEffect(() => {
    if (!enabled) return;

    const id = window.setInterval(() => {
      autoAdvanceTick(intervalSeconds);
    }, intervalSeconds * 1000);

    return () => window.clearInterval(id);
  }, [enabled, intervalSeconds]);

  return null;
}
