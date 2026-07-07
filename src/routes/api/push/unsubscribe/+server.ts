import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSubscription } from '$lib/server/push';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	const b = await request.json().catch(() => null);
	if (!b?.endpoint) throw error(400, 'Falta endpoint');
	await deleteSubscription(b.endpoint);
	return json({ ok: true });
};
