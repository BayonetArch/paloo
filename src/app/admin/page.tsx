"use client";

/**
 * The staff dashboard for the account desk.
 *
 * Opening /admin is enough for the prototype. A real deployment would put a
 * staff login in front of it and check the session on the server.
 */

import { nextUp, queueSize, serviceMinutes } from "@/lib/queue/core";
import { queueStore } from "@/lib/queue/store";
import { useQueueState } from "@/lib/queue/use-queue";

import { ConfirmButton } from "@/components/confirm-button";
import { ArrowRightIcon, PeopleIcon, SkipIcon } from "@/components/icons";
import { buttonStyles, Card, Label } from "@/components/ui";

/** How many tokens the Next list shows. */
const NEXT_COUNT = 4;

export default function AdminPage() {
  const state = useQueueState();
  const upcoming = nextUp(state, NEXT_COUNT);
  const waiting = queueSize(state);
  const service = serviceMinutes(state);
  const idle = !state.serving && waiting === 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8 lg:gap-8 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-accent">Queue desk</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Account desk</h1>
        </div>

        <Card className="flex items-center gap-3 px-5 py-3.5">
          <PeopleIcon className="size-5 text-accent" />
          <p className="text-lg font-medium text-ink">
            Queue: <span className="tabular-nums">{waiting}</span> {waiting === 1 ? "person" : "people"}
          </p>
        </Card>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <Label>Currently serving</Label>

          <p className="font-mono text-6xl font-semibold tracking-tight text-ink sm:text-7xl">
            {state.serving ?? "Nobody"}
          </p>

          <p className="-mt-2 text-sm text-muted">
            {state.recentServiceMs.length === 0
              ? "No services measured yet, so estimates use 3 minutes each."
              : `Averaging ${service.minutes.toFixed(1)} minutes per person over the last ${
                  state.recentServiceMs.length
                } ${state.recentServiceMs.length === 1 ? "service" : "services"}.`}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              type="button"
              onClick={() => queueStore.next()}
              disabled={idle}
              className={buttonStyles("primary", "lg", "flex-1 text-xl")}
            >
              Next
              <ArrowRightIcon className="size-6" />
            </button>

            <ConfirmButton
              inline
              size="lg"
              tone="danger"
              confirmTone="danger"
              disabled={!state.serving}
              label={
                <>
                  <SkipIcon className="size-6" />
                  Skip
                </>
              }
              confirmLabel={state.serving ? `Skip ${state.serving}` : "Skip"}
              onConfirm={() => queueStore.skip()}
            />
          </div>

          <p className="text-sm text-muted">
            Skip is for no shows. It asks first, marks the token as skipped, and calls the next person.
          </p>

          <ConfirmButton
            label="Reset queue"
            confirmLabel="Reset the queue"
            question="This puts A-119 back at the desk and A-120 to A-137 back in line. Every ticket issued so far stops working."
            onConfirm={() => queueStore.reset()}
            className="mt-1 self-start"
          />
        </Card>

        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <Label>Next</Label>

          {upcoming.length === 0 ? (
            <p className="text-lg text-muted">Nobody is waiting.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-line">
              {upcoming.map((ticket, index) => (
                <li key={ticket.token} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="w-5 text-sm font-medium tabular-nums text-muted">{index + 1}</span>
                  <span className="font-mono text-3xl font-semibold text-ink">{ticket.token}</span>
                  {index === 0 ? (
                    <span className="ml-auto rounded-full bg-accent-deep px-3 py-1 text-xs font-medium text-accent">
                      Called next
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          )}

          <p className="mt-auto text-sm text-muted">
            {upcoming.length === 0
              ? "The queue is empty."
              : upcoming.length < NEXT_COUNT
                ? `${upcoming.length} waiting, shown in full.`
                : `Showing the next ${NEXT_COUNT} of ${waiting} waiting.`}
          </p>
        </Card>
      </div>

      <section className="rounded-2xl bg-surface p-6 ring-1 ring-line sm:p-8">
        <h2 className="text-lg font-semibold text-ink">Whole queue</h2>
        <p className="mt-1 text-sm text-muted">
          Everyone waiting, in the order they will be called.
        </p>

        <ol className="mt-5 flex flex-wrap gap-2">
          {state.waiting.map((token) => (
            <li key={token} className="rounded-lg bg-raised px-3 py-1.5 font-mono text-sm font-medium text-ink">
              {token}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
