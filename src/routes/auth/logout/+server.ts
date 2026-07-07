import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE } from '$lib/server/auth';
import { markOffline } from '$lib/server/acmsyMirror';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	if (locals.user?.email) await markOffline(locals.user.email);
	cookies.delete(SESSION_COOKIE, { path: '/' });
	return json({ ok: true });
};
