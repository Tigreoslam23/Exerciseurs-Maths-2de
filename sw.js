/* AutoMaths: cache borné à l’application, sans modifier les autres exerciseurs. */
const VERSION='automaths-offline-v2';
const CACHE=VERSION;
const ROOT=new URL('./',self.location.href);
const APP=new URL('index.html',ROOT).href;
const MATHJAX='https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg-full.js';
const ASSETS=['./','index.html','manifest.webmanifest','pwa.js','slides.css','slides.js','icons/automaths-192.png','icons/automaths-512.png','icons/automaths-180.png'].map(p=>new URL(p,ROOT).href).concat(MATHJAX);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload',mode:'cors'})))}catch(error){await caches.delete(CACHE);throw error}
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('automaths-offline-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 if(event.data?.type!=='OFFLINE_STATUS'||!event.ports[0])return;
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE),found=await Promise.all(ASSETS.map(url=>cache.match(url)));
  event.ports[0].postMessage({ready:found.every(Boolean),version:VERSION});
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url),isApp=url.origin===ROOT.origin&&(url.pathname===ROOT.pathname||url.pathname===new URL(APP).pathname);
 const canonical=isApp?APP:url.href;
 if(!isApp&&!ASSETS.includes(canonical))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  // HTML réseau d’abord : les nouveaux chapitres deviennent disponibles au retour en ligne.
  if(isApp){
   try{
    const response=await fetch(event.request);
    if(!response.ok)throw Error('Application indisponible');
    event.waitUntil(cache.put(APP,response.clone()));return response;
   }catch(error){const stored=await cache.match(APP);if(stored)return stored;throw error}
  }
  const stored=await cache.match(canonical);if(stored)return stored;
  const response=await fetch(event.request);if(response.ok)event.waitUntil(cache.put(canonical,response.clone()));return response;
 })());
});
