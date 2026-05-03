/**
 * DoAble India - Smart Spy Service Worker
 * Handles background polling for Alerts and Job Leads
 */

const CACHE_NAME = 'doable-spy-v1';
const ALERTS_API = 'https://doableindia.com/api_data_copy.php';
const JOBS_API = 'https://doableindia.com/api_data.php';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  // Start polling when activated
  startPolling();
});

// Polling Logic
async function startPolling() {
  console.log('Smart Spy: Polling started');
  // Initial check
  checkForUpdates();
  
  // Set interval for periodic checks
  setInterval(() => {
    checkForUpdates();
  }, 15 * 60 * 1000); // Every 15 minutes
}

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
      if (currentAlertId && currentAlertId !== lastAlertId) {
        showNotification('📢 DoAble Admin Alert', {
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
      if (currentJobId && currentJobId !== lastJobId) {
        showNotification('🆕 New Job Lead Near You', {
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

// Simple ID Persistence using Cache API
async function getLastId(key) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match('/' + key);
  if (response) return response.text();
  return null;
}

async function saveLastId(key, id) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put('/' + key, new Response(id.toString()));
}

// Interaction Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, navigate it
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Listen for messages from the app to sync IDs
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_IDS') {
    if (event.data.lastAlertId) saveLastId('last_alert_id', event.data.lastAlertId);
    if (event.data.lastJobId) saveLastId('last_job_id', event.data.lastJobId);
  }
});
