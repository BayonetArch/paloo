"use client";

/**
 * The ticket as the person waiting sees it.
 *
 * One panel covers every state of a ticket: waiting, ready, approaching,
 * serving and finished. The token is the biggest thing on the page and the
 * background colour carries the news, so it reads at a glance from across a
 * room.
 */

import { useRouter } from "next/navigation";

import { queueStore } from "@/lib/queue/store";
import { PREPARE_POSITION, type TicketStatus, type TicketView } from "@/lib/queue/types";
import { alertPhase, type AlertPhase } from "@/lib/queue/use-turn-alerts";

import { BellIcon, CheckIcon, ClockIcon, PeopleIcon } from "@/components/icons";
import { NotificationButton } from "@/components/notification-button";
import { buttonStyles, Card } from "@/components/ui";

export function TicketPanel({ ticket }: { ticket: TicketView }) {
  const router = useRouter();
  const phase = alertPhase(ticket);
  const finished = phase === "closed";
  const serving = phase === "serving";

  function joinAgain() {
    router.replace(`/ticket/${queueStore.join()}`);
  }

  return (
    <div
      className={`flex min-h-dvh flex-col transition-colors duration-500 ${
        serving
          ? "bg-accent-deep"
          : phase === "approaching" || phase === "ready"
            ? "bg-warn-deep"
            : "bg-page"
      }`}
    >
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-7 px-5 py-8 sm:py-10">
        <header className="flex items-center gap-2.5">
          <BellIcon className={`size-5 ${phase === "ready" || phase === "approaching" ? "text-warn" : "text-accent"}`} />
          <p className="text-sm font-medium text-muted">Queue desk, account section</p>
        </header>

        {/* The live region announces the change as well as showing it. */}
        <div aria-live="assertive" aria-atomic="true" className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            <Heading phase={phase} />
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            <Message phase={phase} status={ticket.status} position={ticket.position} />
          </p>
        </div>

        <TokenCard token={ticket.token} phase={phase} />

        {!finished && !serving ? <Stats ticket={ticket} /> : null}

        {finished ? (
          <button type="button" onClick={joinAgain} className={buttonStyles("primary", "lg", "w-full")}>
            Join the queue again
          </button>
        ) : null}

        <div className="mt-auto flex flex-col gap-7 pt-2">
          {!finished ? (
            <>
              <p className="flex items-start gap-3 text-base text-muted">
                <ClockIcon className="mt-1 size-5 shrink-0" />
                {serving
                  ? "The desk is holding this spot for you."
                  : "Keep this page open. You can leave the area."}
              </p>
              {!serving ? <NotificationButton /> : null}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function Heading({ phase }: { phase: AlertPhase }) {
  if (phase === "serving") return <span className="text-accent-bright">It is your turn</span>;
  if (phase === "approaching") return <span className="text-warn-bright">Your turn is approaching</span>;
  if (phase === "ready") return <span className="text-warn-bright">Get ready to move</span>;
  if (phase === "closed") return <>This ticket is finished</>;
  return <>Account section</>;
}

function Message({
  phase,
  status,
  position,
}: {
  phase: AlertPhase;
  status: TicketStatus;
  position: number | null;
}) {
  if (phase === "serving") return <>Please proceed to the account desk.</>;

  if (phase === "approaching") {
    return (
      <>
        You are currently <strong className="font-semibold text-warn-bright">#{position}</strong> in
        line. Please return to the account section.
      </>
    );
  }

  if (phase === "ready") {
    return (
      <>
        You are currently <strong className="font-semibold text-warn-bright">#{position}</strong> in
        line. Get ready to move to the account section.
      </>
    );
  }

  if (phase === "closed" && status === "skipped") {
    return <>The desk passed your token while you were away. Join the queue again when you are ready.</>;
  }

  if (phase === "closed") return <>Your visit at the account section is done. Thanks for waiting.</>;

  return <>We will notify you when it is almost your turn.</>;
}

function TokenCard({ token, phase }: { token: string; phase: AlertPhase }) {
  const close = phase === "approaching" || phase === "ready";

  const ring = phase === "serving" ? "bg-accent-deep ring-1 ring-accent-line" : close ? "bg-warn-deep ring-1 ring-warn-line" : "bg-surface ring-1 ring-line";

  const label = phase === "serving" ? "text-accent" : close ? "text-warn" : "text-muted";

  return (
    <div className={`flex flex-col items-center gap-3 rounded-2xl px-6 py-9 text-center ${ring}`}>
      <p className={`text-sm font-medium ${label}`}>Your token</p>
      <p className="font-mono text-7xl font-semibold tracking-tight text-ink sm:text-8xl">{token}</p>

      {close ? (
        <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-warn-line/40 px-3.5 py-1.5 text-sm font-medium text-warn-bright">
          <BellIcon className="size-4 animate-pulse-slow" />
          {phase === "ready" ? "Get ready to move" : "Please come back to the desk"}
        </p>
      ) : null}

      {phase === "serving" ? (
        <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-accent-line/40 px-3.5 py-1.5 text-sm font-medium text-accent-bright">
          <CheckIcon className="size-4" />
          Called to the desk
        </p>
      ) : null}
    </div>
  );
}

function Stats({ ticket }: { ticket: TicketView }) {
  const close = ticket.position !== null && ticket.position <= PREPARE_POSITION;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="flex flex-col gap-2 p-5">
        <PeopleIcon className="size-5 text-accent" />
        <p className="text-5xl font-semibold tabular-nums leading-none">{ticket.peopleAhead}</p>
        <p className="text-sm text-muted">People ahead</p>
      </Card>

      <Card className="flex flex-col gap-2 p-5">
        <ClockIcon className="size-5 text-accent" />
        <p className="text-5xl font-semibold tabular-nums leading-none">{ticket.estimatedWaitMinutes}</p>
        <p className="text-sm text-muted">
          {ticket.estimatedWaitMinutes === 1 ? "Minute, estimated" : "Minutes, estimated"}
        </p>
      </Card>

      <p className={`col-span-2 text-sm ${close ? "text-warn" : "text-muted"}`}>
        {close
          ? "Stay on this page, your turn is coming up."
          : ticket.estimateSource === "measured"
            ? "Estimated from the last few services at this desk."
            : "Estimated at 3 minutes for each person ahead of you."}
      </p>
    </div>
  );
}
