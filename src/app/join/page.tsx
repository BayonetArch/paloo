"use client";

/** A visit issues one token and hands the person straight to their ticket, so a repeated scan never hands out a second number. */

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { readMyToken, saveMyToken } from "@/lib/my-ticket";
import { queueStore } from "@/lib/queue/store";

export default function JoinPage() {
  const router = useRouter();

  // Both storage and issuing a token need the browser, so this waits for the
  // effect. A genuine failure here reaches the error boundary.
  useEffect(() => {
    const saved = readMyToken();

    if (saved && queueStore.getTicket(saved)) {
      router.replace(`/ticket/${saved}`);
      return;
    }

    const token = queueStore.join();
    saveMyToken(token);
    router.replace(`/ticket/${token}`);
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <p className="text-muted">Taking your number.</p>
    </main>
  );
}