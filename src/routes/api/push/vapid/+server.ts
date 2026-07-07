import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { vapidPublicKey } from '$lib/server/push';

// Clave pública VAPID que el cliente usa para suscribirse (no es secreta).
export const GET: RequestHandler = async () => {
	return json({ key: vapidPublicKey() });
};
