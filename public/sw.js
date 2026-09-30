// TenaxLine PWA Service Worker v2
const CACHE_NAME = 'tenaxline-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Canlı API isteklerini bozmadan ağ üzerinden iletir
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Bildirime tıklandığında uygulamayı / randevuyu aç
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/appointments';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Zaten açık bir sekme varsa oraya odaklan ve yönlendir
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Açık sekme yoksa yeni pencerede aç
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Arka plan Push mesaj dinleyicisi
self.addEventListener('push', (event) => {
  let data = {
    title: '⏰ TenaxLine Randevu Hatırlatıcı',
    body: 'Yaklaşan bir hasta randevunuz bulunmaktadır.',
    url: '/appointments'
  };

  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'tenaxline-appointment',
    renotify: true,
    data: {
      url: data.url || '/appointments'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
