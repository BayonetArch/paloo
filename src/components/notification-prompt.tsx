"use client";

/**
 * The ask for notifications. Browsers only show their own permission prompt
 * from a tap, so the card asks for one, and arriving on the page makes the
 * request as well for the browsers that allow it without one.
 */

import { useCallback, useEffect, useReducer, useSyncExternalStore } from "react";

import { askStore, type AskFlags } from "@/lib/ask-flags";
import {
  requestNotificationPermission,
  requestNotificationPermissionOnce,
  sendTestNotification,
} from "@/lib/queue/alerts";
import { useNeedsHomeScreen, useNotificationPermission } from "@/lib/use-browser";

import { BellIcon, CheckIcon, CloseIcon } from "@/components/icons";
import { Button, Card } from "@/components/ui";

const SERVER_FLAGS: AskFlags = { notification: false, homeScreen: false };

function useAskFlags(): AskFlags {
  return useSyncExternalStore(askStore.subscribe, askStore.getFlags, () => SERVER_FLAGS);
}

/** The one place that holds the state the card, the reminder and the hint read. */
function useNotificationAsk(token: string) {
  const permission = useNotificationPermission();
  const flags = useAskFlags();
  // The browser answers the request, so the value has to be read again after.
  const [, reread] = useReducer((count: number) => count + 1, 0);

  // A best effort on arrival. Browsers that require a tap ignore this, which
  // is what the card is for.
  useEffect(() => {
    if (permission !== "default") return;
    void requestNotificationPermissionOnce().then(reread);
  }, [permission]);

  const ask = useCallback(async () => {
    const answer = await requestNotificationPermission();
    // Only a refusal puts the card away for good. A browser that answers
    // "default" never showed its prompt, so the card stays where it is.
    askStore.setFlag("notification", answer === "denied");
    reread();
  }, []);

  const dismiss = useCallback(() => askStore.setFlag("notification", true), []);

  const test = useCallback(() => sendTestNotification(token), [token]);

  return {
    permission,
    // Asked for once, and dismissed means the holder chose not to be asked again.
    showCard: permission === "default" && !flags.notification,
    showReminder: permission === "default" && flags.notification,
    ask,
    dismiss,
    test,
  };
}

export function NotificationPrompt({ token }: { token: string }) {
  const ask = useNotificationAsk(token);

  if (!ask.showCard) return <NotificationStatus ask={ask} />;

  return (
    <Card className="flex flex-col gap-4 p-5 ring-1 ring-accent-line">
      <div className="flex items-start gap-3">
        <BellIcon className="mt-0.5 size-5 shrink-0 text-accent" />

        <div className="flex flex-1 flex-col gap-1">
          <p className="font-medium text-ink">Turn on notifications</p>
          <p className="text-sm leading-relaxed text-muted">
            An alert drops in at the top of your screen when your turn is close, even if you have
            stepped into another app.
          </p>
        </div>

        <CloseButton onClick={ask.dismiss} label="Dismiss the notification prompt" />
      </div>

      <Button tone="primary" size="lg" className="w-full" onClick={ask.ask}>
        <BellIcon className="size-5" />
        Allow notifications
      </Button>
    </Card>
  );
}

/** Once answered, the page says how it stands and lets the holder test it. */
function NotificationStatus({ ask }: { ask: ReturnType<typeof useNotificationAsk> }) {
  if (ask.permission === "denied") {
    return (
      <Card className="flex flex-col gap-2 p-5">
        <p className="flex items-center gap-2.5 text-sm font-medium text-muted">
          <BellIcon className="size-5" />
          Notifications are blocked
        </p>
        <p className="text-sm leading-relaxed text-muted">
          Open the site settings for this page and allow notifications to get the alert. The alert
          on this page still works either way.
        </p>
      </Card>
    );
  }

  if (ask.permission !== "granted") return null;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="flex items-center gap-2.5 text-sm font-medium text-accent">
        <CheckIcon className="size-5" />
        Notifications are on
      </p>
      <p className="text-sm leading-relaxed text-muted">
        Alerts drop in at the top of your screen, even in another app.
      </p>
      <Button tone="secondary" className="self-start" onClick={ask.test}>
        Send a test alert
      </Button>
    </Card>
  );
}

/** The quiet way back in, for anyone who put the card away without answering. */
export function NotificationReminder() {
  const ask = useNotificationAsk("");
  if (!ask.showReminder) return null;

  return (
    <button
      type="button"
      onClick={ask.ask}
      className="flex cursor-pointer items-center gap-2.5 self-start text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <BellIcon className="size-5" />
      Turn on notifications
    </button>
  );
}

/**
 * iOS withholds a notification from a page that is not on the home screen, so
 * the holder is told the one step that unlocks the banner.
 */
export function HomeScreenHint() {
  const needsIt = useNeedsHomeScreen();
  const ask = useNotificationAsk("");
  const flags = useAskFlags();

  if (!needsIt || flags.homeScreen || ask.permission !== "granted") return null;

  return (
    <Card className="flex items-start gap-3 p-5">
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium text-ink">Add Paloo to your Home Screen</p>
        <p className="text-sm leading-relaxed text-muted">
          Tap Share, then Add to Home Screen. iPhone only shows the alert once Paloo is installed.
        </p>
      </div>

      <CloseButton
        onClick={() => askStore.setFlag("homeScreen", true)}
        label="Dismiss the home screen hint"
      />
    </Card>
  );
}

function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="-mt-1 -mr-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <CloseIcon className="size-4" />
    </button>
  );
}
