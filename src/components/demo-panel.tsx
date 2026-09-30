"use client";

/**
 * The demo controls in a small collapsible panel, so a ticket page can carry
 * them without crowding the ticket itself.
 */

import { useState } from "react";

import { DemoControls } from "@/components/demo-controls";
import { ChevronIcon } from "@/components/icons";

export function DemoPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-surface ring-1 ring-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Demo controls
        <ChevronIcon
          className={`size-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-t border-line p-5">
          <DemoControls />
        </div>
      ) : null}
    </div>
  );
}
