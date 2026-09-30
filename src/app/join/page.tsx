"use client";

/**
 * Joining the queue.
 *
 * A visit to this page issues one token and hands the person straight to their
 * ticket. Opening it again returns to the ticket this browser already holds,
 * so a refresh or a repeated scan never hands out a second number.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { readMyToken, saveMyToken } from "@/lib/my-ticket";
import { queueStore } from "@/lib/queue/store";

export default function JoinPage() {
  const router = useRouter();

  // Reading storage and issuing a token both need the browser, and the person
  // should land on their ticket rather than read an intermediate page. A
  // genuine failure here reaches the error boundary below.
  useEffect(() => {
    const saved = readMyToken();

    // A ticket that still exists is the right one to return to.
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