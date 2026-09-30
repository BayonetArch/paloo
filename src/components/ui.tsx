/**
 * Small shared pieces so spacing, touch targets and focus rings stay the same
 * across every page.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonTone = "primary" | "secondary" | "quiet" | "warn";
export type ButtonSize = "md" | "lg";

const TONES: Record<ButtonTone, string> = {
  // Near white on near black, the way a primary action should read.
  primary: "bg-ink text-page hover:bg-white active:bg-muted",
  secondary: "bg-transparent text-ink ring-1 ring-line hover:bg-raised active:bg-line",
  quiet: "bg-transparent text-muted hover:bg-raised hover:text-ink",
  warn: "bg-transparent text-warn ring-1 ring-warn-line hover:bg-warn-deep",
};

const SIZES: Record<ButtonSize, string> = {
  // Every button is at least 48 pixels tall so it is easy to press on a phone.
  md: "min-h-12 px-5 text-base rounded-xl",
  lg: "min-h-16 px-7 text-lg rounded-2xl",
};

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function buttonStyles(tone: ButtonTone = "primary", size: ButtonSize = "md", className = "") {
  return [
    "inline-flex items-center justify-center gap-2.5 font-medium",
    "transition-colors select-none",
    FOCUS,
    "disabled:pointer-events-none disabled:opacity-40",
    TONES[tone],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({ tone, size, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonStyles(tone, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-surface ring-1 ring-line ${className}`}>{children}</div>
  );
}

/** A small heading above a value, used across the ticket and the dashboard. */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm font-medium text-muted ${className}`}>{children}</p>;
}
