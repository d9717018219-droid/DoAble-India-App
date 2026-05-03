/**
 * DoAble India - Ultimate Background Push Service Worker
 * Optimized for 'Killed' state delivery
 */

const CACHE_NAME = 'doable-ultimate-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Real-time Web Push (The ONLY way to work when app is killed)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'DoAble Update', body: event.data ? event.data.text() : 'New notification received.' };
  }

  const title = data.title || '📢 DoAble India Update';
  const options = {
    body: data.body || 'Open the app to see what\'s new.',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40], // SOS Style intense vibration
    tag: data.tag || 'doable-alert',
    renotify: true,
    requireInteraction: true, // Banner stays until user acts
    data: {
      url: data.url || (title.toLowerCase().includes('job') ? '/jobs' : '/alerts')
    },
    actions: [
      { action: 'open', title: 'Open DoAble' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Background Fetch Fallback (Only works on some Androids/Chrome)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(
      fetch('https://doableindia.com/api_data_copy.php')
        .then(r => r.json())
        .then(data => {
            if(data && data.length > 0) {
                // Show notification if it's new
                return self.registration.showNotification('🆕 Background Update', {
                    body: data[0].message || 'Check new alerts in the app.',
                    icon: '/logo.png'
                });
            }
        })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
