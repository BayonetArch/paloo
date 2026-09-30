# Paloo

A digital queue for a university account section. Students and parents scan a QR
code, take a token, and leave the area with their page open. The page tracks
their place in line and alerts them when the turn is close and when the desk
calls them. Staff run the queue from a dashboard.

This is a frontend prototype. There is no backend. All of the state lives in the
browser, in localStorage, and is shared between tabs of the same browser.

## Setup

The project uses bun and Next.js 16 with the App Router, TypeScript and Tailwind
CSS 4.

```bash
bun install
bun dev
```

Then open http://localhost:3000.

Other commands:

```bash
bun run build   # production build
bun run start   # serve the production build
bun run lint    # ESLint
bunx tsc --noEmit
```

## Routes

| Route              | What it is                                                              |
| ------------------ | ----------------------------------------------------------------------- |
| `/`                | Front page with the four screens and how the queue works                 |
| `/qr`              | Large QR code that links to `/join`, for printing or projecting          |
| `/join`            | Issues a token and redirects to the ticket page                          |
| `/ticket/[token]`  | The ticket. Shows the token, position, estimate and the alerts           |
| `/admin`           | The staff dashboard for the account desk                                 |
| `/demo`            | Demo controls on their own page                                         |

The demo controls also appear as a floating panel at the top right of every
ticket page.

## How the store works

All queue data goes through one module, `src/lib/queue/store.ts`. Components ask
that interface and nothing else, so a real API can replace it later without
touching a single component.

```ts
interface QueueStore {
  getState(): QueueState;
  getTicket(token: string): TicketView | null;
  join(): string;
  next(): void;
  skip(token?: string): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
}
```

The supporting files:

- `src/lib/queue/types.ts` holds `QueueState`, `Ticket` and `TicketView`. A
  `TicketView` is a ticket plus the numbers a holder cares about, such as
  `peopleAhead`, `position` and `estimatedWaitMinutes`.
- `src/lib/queue/core.ts` holds the queue rules as pure functions. It has no
  browser code in it, so the same functions can run on a server.
- `src/lib/queue/store.ts` is the live store. It persists to localStorage, shares
  changes with other tabs, and keeps the subscribers up to date.
- `src/lib/queue/use-queue.ts` connects the store to React through
  `useSyncExternalStore`. A change in any tab re-renders every open ticket page.
- `src/lib/queue/driver.ts` runs the auto advance timer and holds a short lease
  in localStorage, so only one tab moves the queue on.
- `src/lib/queue/alerts.ts` and `src/lib/queue/wake-lock.ts` handle the sound,
  vibration, notification and screen wake lock.

State is shared in this order:

1. Every change is written to localStorage under `palo.queue.v1`.
2. A message goes out on a BroadcastChannel named `palo.queue`.
3. The `storage` event is also watched, which covers tabs opened later and any
   browser without BroadcastChannel.
4. On receiving either, a tab re-reads localStorage and re-renders if the value
   really changed. The extra read keeps two tabs from writing to each other in a
   loop.

### Seed data

A first visit gets a queue that matches the mockups: A-119 is being served and
A-120 to A-137 are waiting, so the dashboard reads "Queue: 18 people".

New tokens carry on from the last number issued. Numbers are never reused, so
after a reset the counter still starts above A-137.

### Wait estimate

The estimate is the number of people ahead multiplied by the time each person
takes.

- Until any service has finished, that uses 3 minutes each.
- Once services have been completed, it uses a rolling average of the last 10
  completed services.

The ticket page says which of the two it is using. Skipped tickets are no shows,
so they do not count towards the average.

## Alerts

When a ticket reaches position 3 or fewer, the page changes to the "Your turn is
approaching" state. When the desk calls it, the page changes to "It is your
turn". Each change fires once and does four things:

- changes the colour of the page and shows a message
- vibrates the phone, where the browser supports it
- plays a short generated sound through the Web Audio API
- shows a browser notification, when permission has been granted

There is a button on the ticket page to ask for notification permission, since
browsers only allow that request to come from a button press. The page also asks
for a screen wake lock so a phone does not dim while someone waits.

If someone reloads a ticket page that is already at the desk, no alert fires on
arrival. The page records where it started and alerts on change from there.

## Demo script

This shows the whole flow on one laptop.

1. `bun dev`, then open http://localhost:3000/qr in the first window.
2. Open http://localhost:3000/admin in a second window. The desk shows A-119 at
   the counter and "Queue: 18 people".
3. Open http://localhost:3000/join in a third window, or scan the QR code with a
   phone on the same network. You land on a ticket, for example A-138, showing 19
   people ahead and an estimate of 57 minutes.
4. Go to the account desk window and press Next a few times. The ticket page in the
   third window updates on its own, the people ahead count drops, and the estimate
   shrinks.
5. Keep pressing Next. When the ticket reaches number 3, the page turns amber,
   vibrates and sounds an alert. When the desk calls it, the page turns green and
   alerts again.
6. To save time, open http://localhost:3000/demo and switch on auto advance at 5
   seconds. Then press Next once and let the timer carry the ticket all the way
   to the desk.
7. Press Skip on the account desk to see what happens to a no show, and Reset
   queue to put the seed data back.

Good things to point out during a presentation:

- Open the same ticket in two windows and press Next in one of them. Both windows
  update at the same moment, because the store syncs between tabs.
- Press Reset queue while a ticket page is open. That page shows a friendly
  message and a way to join again, because the token no longer exists.
- Open a token that was never issued, such as http://localhost:3000/ticket/A-999.
- Watch the estimate line switch from "Estimated at 3 minutes for each person
  ahead of you" to "Estimated from the last few services at this desk" once a few
  people have been served.

## Replacing the store with a backend

The components only use `QueueStore`, so a backend only has to implement the same
interface and return the same shapes.

| Method                                | What a real API would do                                             |
| ------------------------------------- | -------------------------------------------------------------------- |
| `getState()`                          | Fetch the queue snapshot, or build it from a cached copy            |
| `getTicket(token)`                    | Fetch one ticket and return a `TicketView`                           |
| `join()`                              | `POST` a new ticket and return the issued token                      |
| `next()`                              | `POST` a call for the next person                                    |
| `skip(token?)`                        | `POST` a skip for a no show                                          |
| `reset()`                             | `POST` a reset for the current queue                                 |
| `subscribe(listener)`                 | Open a stream, such as server sent events, and call the listener     |

The types in `src/lib/queue/types.ts` are the contract. `QueueState` is the
snapshot, `TicketView` is what a ticket holder sees, and `src/lib/queue/core.ts`
holds the rules for positions, estimates, advancing and skipping, which a server
would want to share so both sides agree.

Two things change when a backend arrives:

- The store becomes a client of that API. It would keep the local
  `useSyncExternalStore` shape, and swap the BroadcastChannel and storage event
  for the server stream.
- The demo settings move out of the queue, along with `reset()`, since a real
  desk has its own tools. `updateDemoSettings` in `store.ts` exists only for the
  prototype.

A real deployment would also put a staff login in front of `/admin`, and protect
the join route with whatever the university already uses for identity.
