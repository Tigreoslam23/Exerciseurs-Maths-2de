/* Ce service worker est limité au dossier equations/. */
'use strict';
const VERSION = 'equations-offline-v1';
const ROOT = new URL('./', self.location.href);
const APP = new URL('index.html', ROOT).href;
const ASSETS = ['index.html','pwa.js','manifest.webmanifest','icons/equations-192.png','icons/equations-512.png','icons/equations-180.png'].map(p => new URL(p, ROOT).href);

self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(VERSION);
  try { await cache.addAll(ASSETS.map(url => new Request(url, {cache:'reload'}))); }
  catch (error) { await caches.delete(VERSION); throw error; }
  await self.skipWaiting();
})()));

self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) {
    if (name.startsWith('equations-offline-') && name !== VERSION) await caches.delete(name);
  }
  await self.clients.claim();
})()));

self.addEventListener('message', event => {
  if (event.data?.type !== 'EQ_OFFLINE_STATUS' || !event.ports[0]) return;
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const present = await Promise.all(ASSETS.map(url => cache.match(url)));
    event.ports[0].postMessage({application:'equations', ready:present.every(Boolean), version:VERSION});
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== ROOT.origin) return;
  const canonical = url.origin + url.pathname;
  const navigation = canonical === ROOT.href || canonical === APP;
  if (!navigation && !ASSETS.includes(canonical)) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const key = navigation ? APP : canonical;
    const network = fetch(event.request).then(async response => {
      if (!response.ok || (navigation && !response.headers.get('Content-Type')?.includes('text/html'))) throw Error('Réponse indisponible');
      await cache.put(key, response.clone());
      return response;
    });
    event.waitUntil(network.then(() => undefined).catch(() => undefined));
    // Réseau d’abord : mises à jour automatiques au retour en ligne.
    let timer;
    try {
      return await Promise.race([network, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Réseau lent')), 3500); })]);
    } catch (error) {
      const saved = await cache.match(key);
      if (saved) return saved;
      throw error;
    } finally { clearTimeout(timer); }
  })());
});
