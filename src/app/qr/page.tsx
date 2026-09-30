"use client";

/**
 * The poster for the account section.
 *
 * A phone camera pointed at this code opens the join page on whatever host the
 * app is running on, so the same screen works on a laptop and on a phone.
 */

import { QRCodeSVG } from "qrcode.react";

import { useOrigin } from "@/lib/use-browser";

export default function QrPage() {
  const origin = useOrigin();
  const url = origin ? `${origin}/join` : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-9 px-5 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-accent">Queue desk</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Join the queue for the account section
        </h1>
        <p className="max-w-md text-lg text-muted">
          Scan this code with your phone to take a number.
        </p>
      </div>

      {url ? (
        // The card stays white on purpose. A phone camera reads a dark code on a
        // light background far more reliably than a light code on a dark one.
        <div className="rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
          <QRCodeSVG
            value={url}
            size={320}
            level="M"
            marginSize={2}
            title="QR code to join the queue for the account section"
            fgColor="#0b0c0e"
            bgColor="#ffffff"
            className="size-[min(78vw,320px)]"
          />
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-8 sm:p-10">
          <div className="size-[min(78vw,320px)]" aria-hidden />
        </div>
      )}

      <p className="max-w-md text-center font-mono text-sm break-all text-muted">
        {url ?? "Building the code."}
      </p>
    </main>
  );
}
