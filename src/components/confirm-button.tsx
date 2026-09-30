"use client";

/**
 * A button that asks before it acts. Inline keeps the same spot and swaps the
 * button for a confirm and a cancel, which suits a desk action someone repeats
 * all day. The card spells out the consequences, which suits the actions that
 * wipe state.
 */

import { useState, type ReactNode } from "react";

import { Button, Card, type ButtonSize, type ButtonTone } from "@/components/ui";

type ConfirmButtonProps = {
  label: ReactNode;
  confirmLabel: ReactNode;
  question?: string;
  onConfirm: () => void;
  tone?: ButtonTone;
  confirmTone?: ButtonTone;
  size?: ButtonSize;
  className?: string;
  inline?: boolean;
  disabled?: boolean;
};

export function ConfirmButton({
  label,
  confirmLabel,
  question,
  onConfirm,
  tone = "secondary",
  confirmTone = "primary",
  size = "md",
  className = "",
  inline = false,
  disabled = false,
}: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false);

  function confirm() {
    setAsking(false);
    onConfirm();
  }

  if (!asking) {
    return (
      <Button
        tone={tone}
        size={size}
        className={className}
        disabled={disabled}
        onClick={() => setAsking(true)}
      >
        {label}
      </Button>
    );
  }

  if (inline) {
    return (
      <>
        <Button tone={confirmTone} size={size} onClick={confirm}>
          {confirmLabel}
        </Button>
        <Button tone="quiet" size={size} onClick={() => setAsking(false)}>
          Cancel
        </Button>
      </>
    );
  }

  return (
    <Card className={`flex flex-col gap-4 p-5 ${className}`}>
      {question ? <p className="text-sm leading-relaxed text-ink">{question}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button tone={confirmTone} size={size} onClick={confirm}>
          {confirmLabel}
        </Button>
        <Button tone="quiet" size={size} onClick={() => setAsking(false)}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
