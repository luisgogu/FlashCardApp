import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: any;

self.skipWaiting();
self.addEventListener('activate', (event: any) => {
  event.waitUntil(self.clients.claim());
});

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
      tag: payload.tag || undefined,
      renotify: Boolean(payload.tag),
      data: {
        url: payload.url || '/',
        cardId: payload.card_id ?? null
      }
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
  const rawUrl = event.notification.data?.url || '/';
  const cardId = event.notification.data?.cardId ?? null;
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList: any[]) => {
      for (const client of clientList) {
        try {
          const clientOrigin = new URL(client.url).origin;
          if (clientOrigin === self.location.origin) {
            if ('focus' in client) {
              await client.focus();
            }
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: rawUrl,
              cardId
            });
            return;
          }
        } catch {
          // Ignore malformed client URLs
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
