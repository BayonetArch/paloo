"use client";

/**
 * Demo controls.
 *
 * These stand in for the person at the desk so one screen can show the whole
 * journey from waiting to approaching to serving. They belong to the prototype
 * and would never ship with a real account section.
 */

import { advanceOnce, queueStore, updateDemoSettings } from "@/lib/queue/store";
import { useQueueState } from "@/lib/queue/use-queue";
import type { DemoSettings } from "@/lib/queue/types";

import { ConfirmButton } from "@/components/confirm-button";
import { ArrowRightIcon, BoltIcon, RestartIcon } from "@/components/icons";
import { Button, Card } from "@/components/ui";

const INTERVALS: DemoSettings["intervalSeconds"][] = [5, 10, 20];

export function DemoControls() {
  const { demo, serving } = useQueueState();

  return (
    <section className="flex flex-col gap-6" aria-labelledby="demo-controls-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="demo-controls-heading" className="text-lg font-semibold text-ink">
          Demo controls
        </h2>
        <p className="text-sm text-muted">Part of the prototype, staff use the desk buttons for real.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button tone="primary" size="lg" onClick={advanceOnce}>
          Advance queue
          <ArrowRightIcon className="size-5" />
        </Button>
        <p className="text-sm text-muted">
          {serving ? `Moves ${serving} on and calls the next person.` : "The desk is free, this calls the first person waiting."}
        </p>
      </div>

      <Card className="flex flex-col gap-5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BoltIcon className="size-5 text-accent" />
            <span className="font-medium text-ink">Auto advance</span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={demo.autoAdvance}
            aria-label={demo.autoAdvance ? "Turn off auto advance" : "Turn on auto advance"}
            onClick={() => updateDemoSettings({ autoAdvance: !demo.autoAdvance })}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              demo.autoAdvance ? "bg-accent" : "bg-raised ring-1 ring-line hover:bg-line"
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-block size-6 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
                demo.autoAdvance ? "translate-x-7 bg-page" : "translate-x-1 bg-muted"
              }`}
            />
            <span className="sr-only">{demo.autoAdvance ? "Auto advance on" : "Auto advance off"}</span>
          </button>
        </div>

        <fieldset className="flex flex-wrap items-center gap-3">
          <legend className="mb-2 text-sm text-muted">Call the next person every</legend>
          {INTERVALS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              aria-pressed={demo.intervalSeconds === seconds}
              onClick={() => updateDemoSettings({ intervalSeconds: seconds })}
              className={`min-h-12 min-w-20 cursor-pointer rounded-xl px-4 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                demo.intervalSeconds === seconds
                  ? "bg-ink text-page"
                  : "bg-raised text-ink ring-1 ring-line hover:bg-line"
              }`}
            >
              {seconds} sec
            </button>
          ))}
        </fieldset>

        <p className="text-sm text-muted">
          The queue moves on its own until you switch it off. Every open ticket page follows along.
        </p>
      </Card>

      <ConfirmButton
        label="Reset demo"
        confirmLabel="Reset the queue"
        question="This puts A-119 back at the desk and A-120 to A-137 back in line. Every token issued so far stops working."
        onConfirm={() => queueStore.reset()}
        className="self-start"
      />

      <p className="flex items-center gap-2 text-sm text-muted">
        <RestartIcon className="size-4" />
        Resetting also switches off auto advance.
      </p>
    </section>
  );
}