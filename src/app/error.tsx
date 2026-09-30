"use client";

/**
 * A friendly last stop for anything that goes wrong on a page.
 */

import { useEffect } from "react";

import { Button } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Something went wrong</h1>
        <p className="text-base leading-relaxed text-muted">
          This page could not finish loading. Trying again usually clears it.
        </p>
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
