import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveSubscription } from '$lib/server/push';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	const sub = await request.json().catch(() => null);
	if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
		throw error(400, 'Suscripción inválida');
	}
	await saveSubscription(locals.user.id, sub);
	return json({ ok: true });
};
