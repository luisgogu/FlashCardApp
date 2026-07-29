import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: any;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching for API
registerRoute(
  /^https?:\/\/.*\/api\/.*/i,
  new NetworkFirst({
    cacheName: 'FlashCardApp-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// WEB PUSH EVENT LISTENER
self.addEventListener('push', (event: any) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'FlashCardApp';
    const options: any = {
      body: payload.body || 'Tienes un nuevo mensaje.',
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/favicon.svg',
      data: { url: payload.url || '/' }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error procesando evento Web Push:', err);
  }
});

// NOTIFICATION CLICK LISTENER
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList: any[]) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
