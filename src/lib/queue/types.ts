/**
 * Domain types for the queue store.
 *
 * Everything the UI reads lives in QueueState. The UI never derives a value
 * itself, it asks the store. A real API can replace the local implementation
 * by producing the same shapes from a server response.
 */

/** Lifecycle of a single ticket. */
export type TicketStatus = "waiting" | "serving" | "completed" | "skipped";

/** One person in the queue. */
export type Ticket = {
  /** Public identifier, for example A-127. */
  token: string;
  /** Numeric part of the token, used for ordering. */
  number: number;
  status: TicketStatus;
  /** When the token was issued. */
  issuedAt: number;
  /** When the token reached the desk. Null until it is served. */
  calledAt: number | null;
  /** When the person left the desk. Null while waiting or serving. */
  finishedAt: number | null;
};

/** Demo settings, shown on the demo controls panel. */
export type DemoSettings = {
  autoAdvance: boolean;
  intervalSeconds: 5 | 10 | 20;
};

/** The whole queue, as persisted in localStorage. */
export type QueueState = {
  /** Schema version, bumped if the shape ever changes. */
  version: number;
  /** Token of the person at the desk, or null when the desk is free. */
  serving: string | null;
  /** Tokens waiting, oldest first. */
  waiting: string[];
  /** Every ticket this run has issued, keyed by token. */
  tickets: Record<string, Ticket>;
  /** Highest number handed out so far. Counters never go backwards. */
  lastIssued: number;
  /** Durations of recent services in milliseconds, oldest first. */
  recentServiceMs: number[];
  demo: DemoSettings;
};

/**
 * A ticket plus the numbers a person cares about. This is what components
 * render, so they never have to count the waiting list themselves.
 */
export type TicketView = {
  token: string;
  status: TicketStatus;
  /** People to wait for. Zero when serving or finished. */
  peopleAhead: number;
  /** One based place in line. Null once the ticket is finished. */
  position: number | null;
  estimatedWaitMinutes: number;
  /** Default means the fixed three minutes per person. */
  estimateSource: "default" | "measured";
};

/** Minute per person used until enough services have been measured. */
export const DEFAULT_SERVICE_MINUTES = 3;

/** How many recent services feed the measured average. */
export const RECENT_SAMPLE_SIZE = 10;

/** True once a ticket is close enough to the desk to warn the person. */
export const APPROACHING_POSITION = 3;

/** True once a ticket is close enough that the person should get ready to move. */
export const PREPARE_POSITION = 5;
