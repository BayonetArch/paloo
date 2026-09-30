/** Everything the UI reads lives in QueueState. The UI never derives a value itself, it asks the store. */

export type TicketStatus = "waiting" | "serving" | "completed" | "skipped";

export type Ticket = {
  /** Public identifier, for example A-127. */
  token: string;
  /** Numeric part of the token, used for ordering. */
  number: number;
  status: TicketStatus;
  issuedAt: number;
  calledAt: number | null;
  finishedAt: number | null;
};

export type DemoSettings = {
  autoAdvance: boolean;
  intervalSeconds: 5 | 10 | 20;
};

/** The whole queue, as persisted in localStorage. */
export type QueueState = {
  /** Schema version, bumped if the shape ever changes. */
  version: number;
  serving: string | null;
  /** Tokens waiting, oldest first. */
  waiting: string[];
  tickets: Record<string, Ticket>;
  /** Highest number handed out so far. Counters never go backwards. */
  lastIssued: number;
  /** Durations of recent services in milliseconds, oldest first. */
  recentServiceMs: number[];
  demo: DemoSettings;
};

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

export const RECENT_SAMPLE_SIZE = 10;

export const APPROACHING_POSITION = 3;

export const PREPARE_POSITION = 5;
