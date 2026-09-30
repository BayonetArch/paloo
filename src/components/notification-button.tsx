"use client";

/**
 * Asks for notification permission in a clear way. Browsers only allow the
 * request to come from a button press, so the prompt lives here rather than
 * firing on page load.
 */

import { useReducer } from "react";

import { requestNotificationPermission } from "@/lib/queue/alerts";
import { useNotificationPermission } from "@/lib/use-browser";

import { BellIcon } from "@/components/icons";
import { Button } from "@/components/ui";

export function NotificationButton() {
  const permission = useNotificationPermission();
  // Re-read the permission after asking, since the browser answers the request.
  const [, reread] = useReducer((count: number) => count + 1, 0);

  if (permission === "unsupported" || permission === "granted") return null;

  if (permission === "denied") {
    return (
      <p className="text-center text-sm text-muted">
        Notifications are turned off for this site. The alert on this page still works.
      </p>
    );
  }

  async function ask() {
    await requestNotificationPermission();
    reread();
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <Button tone="secondary" onClick={ask}>
        <BellIcon className="size-5" />
        Turn on notifications
      </Button>
      <p className="text-center text-sm text-muted">
        Get an alert when your turn is close, even with this page in the background.
      </p>
    </div>
  );
}
