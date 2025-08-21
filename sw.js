
const CACHE_NAME = 'pesoganado-ai-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/components/Header.tsx',
  '/components/ImageUploader.tsx',
  '/components/ResultDisplay.tsx',
  '/components/Spinner.tsx',
  '/components/icons/index.tsx',
  '/components/HistoryList.tsx',
  '/components/HistoryDetail.tsx',
  '/images/logo-toro-verde.png',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  // Interceptar solicitudes de favicon.ico y redirigir al logo del toro
  if (event.request.url.includes('favicon.ico')) {
    event.respondWith(
      fetch('/images/logo-toro-verde.png')
        .catch(() => {
          // Si no se puede cargar el logo, devolver una respuesta vacía
          return new Response('', { status: 200, statusText: 'OK' });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});