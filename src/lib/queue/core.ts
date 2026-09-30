/** Pure queue logic: state in, state out. No browser APIs, so this can run on a server. */

import {
  DEFAULT_SERVICE_MINUTES,
  RECENT_SAMPLE_SIZE,
  type QueueState,
  type Ticket,
  type TicketView,
} from "./types";
import { formatToken } from "./tokens";

export const SEED = {
  servingNumber: 119,
  firstWaitingNumber: 120,
  lastWaitingNumber: 137,
};

function makeTicket(number: number, status: Ticket["status"], at: number): Ticket {
  return {
    token: formatToken(number),
    number,
    status,
    issuedAt: at,
    calledAt: status === "waiting" ? null : at,
    finishedAt: null,
  };
}

/**
 * Time defaults to zero so the server and the browser agree while a page
 * renders. The store passes the current time in the browser, which keeps the
 * first measured service honest.
 */
export function createSeedState(at: number = 0): QueueState {
  const tickets: Record<string, Ticket> = {};

  const serving = makeTicket(SEED.servingNumber, "serving", at);
  tickets[serving.token] = serving;

  const waiting: string[] = [];
  for (let number = SEED.firstWaitingNumber; number <= SEED.lastWaitingNumber; number += 1) {
    const ticket = makeTicket(number, "waiting", at);
    tickets[ticket.token] = ticket;
    waiting.push(ticket.token);
  }

  return {
    version: 1,
    serving: serving.token,
    waiting,
    tickets,
    lastIssued: SEED.lastWaitingNumber,
    recentServiceMs: [],
    demo: { autoAdvance: false, intervalSeconds: 5 },
  };
}

function rememberService(state: QueueState, durationMs: number): number[] {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return state.recentServiceMs;
  return [...state.recentServiceMs, durationMs].slice(-RECENT_SAMPLE_SIZE);
}

export function issueTicket(state: QueueState, now: number): { state: QueueState; token: string } {
  const number = state.lastIssued + 1;
  const ticket = makeTicket(number, "waiting", now);

  return {
    token: ticket.token,
    state: {
      ...state,
      tickets: { ...state.tickets, [ticket.token]: ticket },
      waiting: [...state.waiting, ticket.token],
      lastIssued: number,
    },
  };
}

function promoteFirstWaiting(state: QueueState, now: number): QueueState {
  const [first, ...rest] = state.waiting;
  if (!first) return state;

  const current = state.tickets[first];
  return {
    ...state,
    serving: first,
    waiting: rest,
    tickets: {
      ...state.tickets,
      [first]: { ...current, status: "serving", calledAt: now, finishedAt: null },
    },
  };
}

function finishServing(state: QueueState, now: number, status: Ticket["status"]): QueueState {
  const token = state.serving;
  if (!token) return state;

  const current = state.tickets[token];
  const finished: Ticket = { ...current, status, finishedAt: now };
  const recentServiceMs =
    status === "completed" && current.calledAt !== null
      ? rememberService(state, now - current.calledAt)
      : state.recentServiceMs;

  return { ...state, serving: null, tickets: { ...state.tickets, [token]: finished }, recentServiceMs };
}

export function advanceQueue(state: QueueState, now: number): QueueState {
  const closed = state.serving ? finishServing(state, now, "completed") : state;
  return promoteFirstWaiting(closed, now);
}

export function skipTicket(state: QueueState, token: string | undefined, now: number): QueueState {
  if (!token) {
    const released = state.serving ? finishServing(state, now, "skipped") : state;
    return promoteFirstWaiting(released, now);
  }

  const current = state.tickets[token];
  if (!current) return state;

  if (current.status === "serving") {
    const released = finishServing(state, now, "skipped");
    return promoteFirstWaiting(released, now);
  }

  if (current.status !== "waiting") return state;

  const finished: Ticket = { ...current, status: "skipped", finishedAt: now };
  return {
    ...state,
    waiting: state.waiting.filter((entry) => entry !== token),
    tickets: { ...state.tickets, [token]: finished },
  };
}

export function resetQueue(at: number = 0): QueueState {
  return createSeedState(at);
}

export function queueSize(state: QueueState): number {
  return state.waiting.length;
}

export function nextUp(state: QueueState, count: number): Ticket[] {
  return state.waiting.slice(0, count).map((token) => state.tickets[token]);
}

/** One based place in line, counting whoever is at the desk. */
export function positionOf(state: QueueState, token: string): number | null {
  if (state.serving === token) return 1;
  const index = state.waiting.indexOf(token);
  if (index === -1) return null;
  return index + (state.serving ? 2 : 1);
}

export function serviceMinutes(state: QueueState): { minutes: number; source: "default" | "measured" } {
  const sample = state.recentServiceMs;
  if (sample.length === 0) return { minutes: DEFAULT_SERVICE_MINUTES, source: "default" };

  const total = sample.reduce((sum, value) => sum + value, 0);
  return { minutes: total / sample.length / 60_000, source: "measured" };
}

export function deriveTicket(state: QueueState, token: string): TicketView | null {
  const ticket = state.tickets[token];
  if (!ticket) return null;

  const position = positionOf(state, token);
  const peopleAhead = position === null ? 0 : Math.max(0, position - 1);
  const service = serviceMinutes(state);
  const estimate = peopleAhead * service.minutes;
  const estimatedWaitMinutes =
    peopleAhead === 0 ? 0 : Math.max(1, Math.round(estimate));

  return {
    token: ticket.token,
    status: ticket.status,
    peopleAhead,
    position,
    estimatedWaitMinutes,
    estimateSource: service.source,
  };
}

export function waitingTickets(state: QueueState): Ticket[] {
  return state.waiting.map((token) => state.tickets[token]);
}

/** Returns the seed when the saved data cannot be trusted, so a stale or hand edited value cannot break the app. */
export function parseQueueState(raw: string | null, at: number = 0): QueueState {
  if (!raw) return createSeedState(at);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return createSeedState(at);
  }

  if (typeof parsed !== "object" || parsed === null) return createSeedState(at);

  const seed = createSeedState(at);
  const candidate = parsed as Partial<QueueState>;
  if (candidate.version !== seed.version) return seed;
  if (typeof candidate.lastIssued !== "number") return seed;
  if (typeof candidate.tickets !== "object" || candidate.tickets === null) return seed;
  if (!Array.isArray(candidate.waiting)) return seed;

  const statuses: Ticket["status"][] = ["waiting", "serving", "completed", "skipped"];
  const tickets: Record<string, Ticket> = {};
  for (const [token, value] of Object.entries(candidate.tickets)) {
    const ticket = value as Partial<Ticket>;
    if (typeof ticket?.number !== "number") continue;
    const status = ticket.status;
    if (!statuses.includes(status as Ticket["status"])) continue;
    tickets[token] = {
      token,
      number: ticket.number,
      status: status as Ticket["status"],
      issuedAt: typeof ticket.issuedAt === "number" ? ticket.issuedAt : 0,
      calledAt: typeof ticket.calledAt === "number" ? ticket.calledAt : null,
      finishedAt: typeof ticket.finishedAt === "number" ? ticket.finishedAt : null,
    };
  }

  const waiting = candidate.waiting.filter((token): token is string => typeof token === "string" && token in tickets);
  const serving = typeof candidate.serving === "string" && candidate.serving in tickets ? candidate.serving : null;
  const recentServiceMs = Array.isArray(candidate.recentServiceMs)
    ? candidate.recentServiceMs.filter((value): value is number => typeof value === "number" && value > 0)
    : [];

  const interval = candidate.demo?.intervalSeconds;

  return {
    version: seed.version,
    serving,
    waiting,
    tickets,
    lastIssued: Math.max(candidate.lastIssued, SEED.lastWaitingNumber),
    recentServiceMs: recentServiceMs.slice(-RECENT_SAMPLE_SIZE),
    demo: {
      autoAdvance: candidate.demo?.autoAdvance === true,
      intervalSeconds: interval === 5 || interval === 10 || interval === 20 ? interval : 5,
    },
  };
}
