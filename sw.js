
const CACHE_NAME = 'peso-ganadero-v2';
const STATIC_CACHE = 'peso-ganadero-static-v2';
const DYNAMIC_CACHE = 'peso-ganadero-dynamic-v2';

// Archivos estáticos que se cachean inmediatamente
const STATIC_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/src/index.css',
  '/images/logo-toro-verde.png',
  '/images/logo-monarca.png',
  '/images/ternero1.jpg',
  '/images/ternero2.jpg',
  '/images/ternero3.jpg',
  '/images/ternero4.jpg',
  '/images/ternero5.jpg',
  '/images/vaca1.jpg',
  '/images/vaca2.jpg',
  '/images/vaca3.jpg',
  '/images/vaca4.jpg'
];

// Archivos de la aplicación que se cachean dinámicamente
const APP_URLS = [
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/components/Header.tsx',
  '/components/ImageUploader.tsx',
  '/components/PhotoGuide.tsx',
  '/components/ResultDisplay.tsx',
  '/components/Spinner.tsx',
  '/components/icons/index.tsx',
  '/components/HistoryList.tsx',
  '/components/HistoryDetail.tsx',
  '/components/Footer.tsx'
];

// Estrategia de cache: Cache First para archivos estáticos
const cacheFirst = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Si no hay conexión, devolver una página offline
    if (request.destination === 'document') {
      return cache.match('/offline.html');
    }
    throw error;
  }
};

// Estrategia de cache: Network First para archivos de la app
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

// Instalación del service worker
self.addEventListener('install', event => {
  console.log('🔄 Service Worker: Instalando...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cacheando archivos estáticos...');
        return cache.addAll(STATIC_URLS);
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('📦 Cacheando archivos de la aplicación...');
        return cache.addAll(APP_URLS);
      })
    ]).then(() => {
      console.log('✅ Service Worker: Instalación completada');
      return self.skipWaiting();
    })
  );
});

// Activación del service worker
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activación completada');
      return self.clients.claim();
    })
  );
});

// Interceptación de solicitudes
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Manejo especial para favicon
  if (request.url.includes('favicon.ico')) {
    event.respondWith(
      fetch('/images/logo-toro-verde.png')
        .catch(() => {
          return new Response('', { status: 200, statusText: 'OK' });
        })
    );
    return;
  }

  // Archivos estáticos (imágenes, CSS, etc.)
  if (STATIC_URLS.includes(url.pathname) ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Archivos de la aplicación (React, TypeScript)
  if (APP_URLS.includes(url.pathname) ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.js')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Página principal
  if (request.destination === 'document') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API calls - Network first con fallback
  if (url.pathname.includes('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Si es una llamada a la API de Gemini, devolver error offline
          if (url.hostname.includes('googleapis.com')) {
            return new Response(
              JSON.stringify({
                error: 'offline',
                message: 'Sin conexión a internet. El análisis de IA requiere conexión.'
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          throw new Error('Network error');
        })
    );
    return;
  }

  // Fallback para otras solicitudes
  event.respondWith(networkFirst(request));
});

// Manejo de mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Manejo de errores global
self.addEventListener('error', event => {
  console.error('❌ Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('❌ Service Worker Unhandled Rejection:', event.reason);
});