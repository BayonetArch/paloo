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
To setup, run the following command:

```bash
bun install
bun dev
```
