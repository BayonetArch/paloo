"use client";

import { queueSize } from "@/lib/queue/core";
import { useQueueState } from "@/lib/queue/use-queue";

import { DemoControls } from "@/components/demo-controls";
import { Card } from "@/components/ui";

export default function DemoPage() {
  const state = useQueueState();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 lg:gap-8 lg:py-10">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium text-accent">Paloo</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Demo controls</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          These stand in for the person at the desk. Switch on auto advance to walk one ticket all
          the way from waiting, through approaching, to being called.
        </p>
      </header>

      <Card className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-4">
        <Stat label="At the desk" value={state.serving ?? "Nobody"} />
        <Stat label="Waiting" value={String(queueSize(state))} />
        <Stat label="Last number issued" value={`A-${state.lastIssued}`} />
        <Stat label="Auto advance" value={state.demo.autoAdvance ? "On" : "Off"} />
      </Card>

      <Card className="p-6 sm:p-8">
        <DemoControls />
      </Card>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}
