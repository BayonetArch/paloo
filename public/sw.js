/**
 * Paloo's service worker. It exists for one reason: the Notification constructor
 * is illegal on a phone, so the alert that drops down at the top of the screen
 * has to come from a worker. There is no fetch handler on purpose, so this
 * worker never intercepts a request and never serves a stale page.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Tapping the alert should land back on the ticket it is about, not on a
  // copy of the page that was already open in another tab.
  const target = new URL(event.notification.data?.url ?? "/", self.location.origin);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.startsWith(target.href)) return client.focus();
        }
        return self.clients.openWindow(target.href);
      })
      .catch(() => undefined),
  );
});
