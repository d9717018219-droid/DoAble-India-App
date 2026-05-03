/**
 * DoAble India - Smart Spy & Robust Push Service Worker
 * Handles real-time Push (Firebase) and Background Polling (Periodic Sync)
 */

const CACHE_NAME = 'doable-spy-v2';
const ALERTS_API = 'https://doableindia.com/api_data_copy.php';
const JOBS_API = 'https://doableindia.com/api_data.php';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Real-time Push Handler (For Firebase Admin/FCM)
self.addEventListener('push', (event) => {
  if (!(self.Notification && self.Notification.permission === 'granted')) return;

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'DoAble Alert';
  const options = {
    body: data.body || 'New update available.',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || (data.title?.toLowerCase().includes('job') ? '/jobs' : '/alerts')
    },
    actions: [{ action: 'open', title: 'View Now' }]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Periodic Background Sync (For "Smart Spy" Polling when app is closed)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

// Fallback: If Periodic Sync isn't supported, we try to keep a limited interval
// but browsers WILL kill this after ~30s of app closure.
// Periodic Sync is the only real way for background polling.
async function checkForUpdates() {
  try {
    const [alertsData, jobsData] = await Promise.all([
      fetch(ALERTS_API).then(r => r.json()).catch(() => []),
      fetch(JOBS_API).then(r => r.json()).catch(() => [])
    ]);

    const lastAlertId = await getLastId('last_alert_id');
    const lastJobId = await getLastId('last_job_id');

    // Process New Alerts
    if (alertsData.length > 0) {
      const latestAlert = alertsData[0];
      const currentAlertId = latestAlert.id || latestAlert['Order ID'] || latestAlert['Tutor ID'];
      if (currentAlertId && currentAlertId.toString() !== lastAlertId) {
        await showNotification('📢 DoAble Admin Alert', {
          body: latestAlert.message || latestAlert.About || 'New update from Admin',
          data: { url: '/alerts' }
        });
        await saveLastId('last_alert_id', currentAlertId);
      }
    }

    // Process New Jobs
    if (jobsData.length > 0) {
      const latestJob = jobsData[0];
      const currentJobId = latestJob.id || latestJob['Order ID'];
      if (currentJobId && currentJobId.toString() !== lastJobId) {
        await showNotification('🆕 New Job Lead Near You', {
          body: `${latestJob.Subject || 'New Job'} in ${latestJob.Location || latestJob.Area || 'your area'}`,
          data: { url: '/jobs' }
        });
        await saveLastId('last_job_id', currentJobId);
      }
    }
  } catch (error) {
    console.error('Smart Spy Error:', error);
  }
}

async function showNotification(title, config) {
  const options = {
    body: config.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: config.data,
    actions: [{ action: 'open', title: 'Open App' }]
  };
  return self.registration.showNotification(title, options);
}

// persistence using Cache API
async function getLastId(key) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match('/' + key);
  if (response) return response.text();
  return null;
}

async function saveLastId(key, id) {
  if (!id) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put('/' + key, new Response(id.toString()));
}

// 3. Interaction Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
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

// Message listener for manual sync from App
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_IDS') {
    if (event.data.lastAlertId) saveLastId('last_alert_id', event.data.lastAlertId);
    if (event.data.lastJobId) saveLastId('last_job_id', event.data.lastJobId);
  }
});
