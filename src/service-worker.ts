/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Service worker minimo: NO cachea nada (no intercepta fetch), asi que nunca
// sirve versiones viejas tras un despliegue. Solo existe para poder mostrar
// notificaciones en movil (Chrome de Android exige registration.showNotification)
// y para recibir push mas adelante.
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', () => {
	sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(sw.clients.claim());
});

// Al recibir un push, muestra la notificacion.
sw.addEventListener('push', (event) => {
	let data: { title?: string; body?: string } = {};
	try {
		data = event.data ? event.data.json() : {};
	} catch {
		data = { body: event.data?.text() };
	}
	event.waitUntil(
		sw.registration.showNotification(data.title || 'Sprout', {
			body: data.body || 'Tienes un recordatorio de aporte.',
			icon: '/icon-192.png',
			badge: '/icon-192.png',
			tag: 'sprout'
		})
	);
});

// Al tocar la notificacion, enfoca la app (o la abre).
sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(
		(async () => {
			const clients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
			for (const client of clients) {
				if ('focus' in client) return (client as WindowClient).focus();
			}
			if (sw.clients.openWindow) return sw.clients.openWindow('/');
		})()
	);
});
