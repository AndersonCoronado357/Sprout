/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// KILL-SWITCH: el service worker anterior cacheaba la app y servía versiones
// viejas tras cada despliegue. Este se autodestruye: borra todos los caches,
// se desregistra y recarga las pestañas para que siempre se vea lo desplegado.
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', () => {
	sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) await caches.delete(key);
			await sw.registration.unregister();
			for (const client of await sw.clients.matchAll()) {
				(client as WindowClient).navigate((client as WindowClient).url);
			}
		})()
	);
});
