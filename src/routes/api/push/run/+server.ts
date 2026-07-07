import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { sendDueReminders } from '$lib/server/push';

// Dispara los recordatorios de aportes que vencen. Protegido con CRON_SECRET.
// Lo llama el programador interno y también sirve para pruebas manuales.
export const POST: RequestHandler = async ({ request, url }) => {
	const secret = env.CRON_SECRET;
	const given = request.headers.get('x-cron-secret') || url.searchParams.get('secret');
	if (!secret || given !== secret) throw error(401, 'No autorizado');
	// Fecha "hoy" en hora Colombia (UTC-5); se puede forzar con ?today= para pruebas.
	const today =
		url.searchParams.get('today') ||
		new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
	const res = await sendDueReminders(today);
	return json(res);
};
