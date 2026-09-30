import Link from "next/link";

import {
  ArrowRightIcon,
  BellIcon,
  BoltIcon,
  DeskIcon,
  PeopleIcon,
  PhoneIcon,
} from "@/components/icons";
import { buttonStyles, Card } from "@/components/ui";

const ROUTES = [
  {
    href: "/qr",
    title: "QR code",
    description:
      "The poster for the account section. Print it or put it on a screen.",
    icon: DeskIcon,
  },
  {
    href: "/join",
    title: "Join the queue",
    description:
      "What a student or parent opens after scanning. Hands out a token.",
    icon: PhoneIcon,
  },
  {
    href: "/admin",
    title: "Account desk",
    description:
      "The staff dashboard. Call the next person, skip a no show, reset.",
    icon: PeopleIcon,
  },
  {
    href: "/demo",
    title: "Demo controls",
    description:
      "Move the queue by hand or on a timer, and reset the seed data.",
    icon: BoltIcon,
  },
] as const;

const STEPS = [
  "The account section shows a QR code that opens the join page.",
  "A student or parent scans it and gets a token, such as A-127.",
  "The ticket page shows the token, how many people are ahead, and the wait.",
  "They leave the area with the page open on their phone.",
  "The page alerts them at number 3, then again when the desk calls them.",
  "They walk back and are served at the account desk.",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-14 px-5 py-12 lg:gap-16 lg:py-16">
      <header className="flex flex-col gap-5">
        <p className="flex items-center gap-2 text-sm font-medium text-accent">
          <BellIcon className="size-4" />
          University account section
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          Queue desk
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          A digital queue for the account section. People scan a code, take a
          number, and go back to their day. Their page keeps track and tells
          them when to return. Staff run the desk from a dashboard.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/join" className={buttonStyles("primary", "lg")}>
            Take a number
            <ArrowRightIcon className="size-5" />
          </Link>
          <Link href="/admin" className={buttonStyles("secondary", "lg")}>
            Open the account desk
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          How the queue works
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="flex gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line"
            >
              <span className="font-mono text-lg font-semibold tabular-nums text-accent">
                {index + 1}
              </span>
              <span className="text-base leading-relaxed text-muted">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          The four screens
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ROUTES.map((route) => {
            const Icon = route.icon;
            return (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="flex h-full flex-col gap-2 rounded-2xl bg-surface p-6 ring-1 ring-line transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex items-center justify-between gap-3">
                    <Icon className="size-6 text-accent" />
                    <ArrowRightIcon className="size-5 text-muted" />
                  </span>
                  <span className="text-lg font-medium text-ink">
                    {route.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted">
                    {route.description}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Card className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">Demo in one minute</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-base leading-relaxed text-muted">
          <li>Open the QR code in the first window.</li>
          <li>Open the account desk in a second window.</li>
          <li>Join the queue from the QR code or the button above.</li>
          <li>Switch on auto advance on the demo controls and pick a speed.</li>
          <li>
            Watch the ticket page change colour and alert as the turn comes
            close.
          </li>
        </ol>
      </Card>
    </main>
  );
}
