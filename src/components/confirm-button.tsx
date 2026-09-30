"use client";

/**
 * A button that asks before it acts. Used for the two actions that wipe state.
 */

import { useState } from "react";

import { Button, Card, type ButtonSize, type ButtonTone } from "@/components/ui";

type ConfirmButtonProps = {
  label: string;
  confirmLabel: string;
  question: string;
  onConfirm: () => void;
  tone?: ButtonTone;
  size?: ButtonSize;
  className?: string;
};

export function ConfirmButton({
  label,
  confirmLabel,
  question,
  onConfirm,
  tone = "secondary",
  size = "md",
  className = "",
}: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <Button tone={tone} size={size} className={className} onClick={() => setAsking(true)}>
        {label}
      </Button>
    );
  }

  return (
    <Card className={`flex flex-col gap-4 p-5 ${className}`}>
      <p className="text-sm leading-relaxed text-ink">{question}</p>
      <div className="flex flex-wrap gap-3">
        <Button
          size={size}
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
        <Button tone="quiet" size={size} onClick={() => setAsking(false)}>
          Keep the queue
        </Button>
      </div>
    </Card>
  );
}
