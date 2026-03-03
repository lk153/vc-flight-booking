// Service Worker for VN Flight Finder push notifications

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "VN Flight Finder";
  const options = {
    body: data.body || "A flight price has changed!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "flight-alert",
    data: {
      url: data.url || "/alerts",
    },
    actions: [
      { action: "view", title: "View Flights" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
