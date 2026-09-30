"use client";

/**
 * The page a student or parent keeps open while they wait.
 *
 * It reads the token from the route, asks the store about it, and hands the
 * answer to the panel. The demo controls sit underneath, collapsed, so the
 * ticket itself stays the only thing on screen.
 */

import Link from "next/link";
import { use } from "react";

import { normaliseToken } from "@/lib/queue/tokens";
import { useHydrated, useTicket } from "@/lib/queue/use-queue";
import { useTurnAlerts } from "@/lib/queue/use-turn-alerts";

import { DemoPanel } from "@/components/demo-panel";
import { buttonStyles } from "@/components/ui";
import { TicketPanel } from "@/components/ticket-panel";

export default function TicketPage(props: PageProps<"/ticket/[token]">) {
  const { token: raw } = use(props.params);
  const token = normaliseToken(decodeURIComponent(raw));
  const hydrated = useHydrated();
  const ticket = useTicket(token);

  useTurnAlerts(hydrated ? ticket : null);

  if (!hydrated) return <Loading />;

  if (!token || !ticket) return <UnknownTicket token={raw} />;

  return (
    <div className="bg-page">
      <TicketPanel ticket={ticket} />
      <div className="mx-auto w-full max-w-lg px-5 pb-10">
        <DemoPanel />
      </div>
    </div>
  );
}

function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-5">
      <p className="text-muted">Finding your ticket.</p>
    </main>
  );
}

/**
 * Shown for a token that was never issued, and for a token from before the
 * queue was reset. Both cases end the same way, with a way to join again.
 */
function UnknownTicket({ token }: { token: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-7 bg-page px-5 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <p className="font-mono text-6xl font-semibold text-muted">{decodeURIComponent(token)}</p>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">We cannot find this ticket</h1>
          <p className="text-base leading-relaxed text-muted">
            The queue was reset after this token was issued, so it no longer exists. Scan the code at
            the account section or join below to take a new number.
          </p>
        </div>

        <Link href="/join" className={buttonStyles("primary", "lg")}>
          Join the queue
        </Link>
      </div>

      <div className="w-full max-w-md">
        <DemoPanel />
      </div>
    </main>
  );
}
