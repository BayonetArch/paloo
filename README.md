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

## Alerts

The ticket page asks for notification permission on arrival. The holder is
beeped and buzzed at five ahead, at three ahead, and when the desk calls, but
only two of those raise a notification at the top of the screen: five ahead and
the call itself. A browser counts the banners a site raises from the background
and warns the holder that the site may be spam, so the middle of the queue is
left audible rather than posted. Adding a kind to `BANNERS` in `alerts.ts` is
all it takes to post that one too.

Notifications are raised through the service worker in `public/sw.js` rather
than the `Notification` constructor, because the constructor is illegal on a
phone and the worker is the only way to get a real banner there. The worker has
no fetch handler on purpose, so it never intercepts a request or serves a stale
page. `src/app/manifest.ts` makes the app installable, which is what iOS
requires before it will show a notification at all, and the ticket page says so
on an iPhone that is not yet installed.

Browsers only allow their own permission prompt to come from a tap, so the
request on arrival is a best effort and the "Allow notifications" card is the
reliable path. Sound carries the same constraint, so the first touch anywhere
on the page primes the audio.
