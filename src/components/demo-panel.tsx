"use client";

/**
 * The demo controls in a floating panel at the top right, so a ticket page can carry
 * them without crowding the ticket itself.
 */

import { useEffect, useState } from "react";

import { DemoControls } from "@/components/demo-controls";
import { ChevronIcon } from "@/components/icons";
import { useQueueState } from "@/lib/queue/use-queue";

export function DemoPanel({
  open: controlledOpen,
  setOpen: controlledSetOpen,
}: {
  open?: boolean;
  setOpen?: (value: boolean) => void;
} = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledSetOpen ?? setInternalOpen) : setInternalOpen;

  const { demo } = useQueueState();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={
          open
            ? "Close demo controls"
            : demo.autoAdvance
              ? "Open demo controls (auto advance active)"
              : "Open demo controls"
        }
        title={open ? "Close demo controls" : "Demo controls"}
        className={`group fixed top-4 right-4 z-50 flex size-12 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          open
            ? "bg-raised text-ink ring-1 ring-line hover:bg-line"
            : demo.autoAdvance
              ? "bg-surface text-accent ring-1 ring-accent/40 hover:bg-raised hover:ring-accent"
              : "bg-surface text-muted ring-1 ring-line hover:bg-raised hover:text-ink hover:ring-line"
        }`}
      >
        <ChevronIcon
          className={`size-5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${demo.autoAdvance ? "text-accent" : "text-ink group-hover:text-ink"}`}
        />
        {demo.autoAdvance && !open ? (
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent animate-pulse-slow" />
        ) : null}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-page/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-controls-heading"
            className="fixed top-18 right-4 z-50 max-h-[calc(100dvh-5.5rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-2xl bg-surface p-5 ring-1 ring-line shadow-2xl focus:outline-none"
          >
            <DemoControls />
          </div>
        </>
      ) : null}
    </>
  );
}
