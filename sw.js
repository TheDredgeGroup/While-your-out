// Shows a notification when the server pushes "something was added to the list".
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data.json(); } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title || "While Your Out", {
    body: data.body || "Something new was added to the list.",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: "while-your-out",
    renotify: true,
  }));
});

// Tapping the notification opens the list (or brings it to the front).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const wins = await clients.matchAll({ type: "window", includeUncontrolled: true });
    if (wins.length) return wins[0].focus();
    return clients.openWindow("./");
  })());
});
