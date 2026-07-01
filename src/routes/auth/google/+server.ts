import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomBytes } from 'node:crypto';
import { dev } from '$app/environment';
import { googleConfig, googleAuthUrl, GOOGLE_STATE_COOKIE } from '$lib/server/google';

// Inicia el flujo OAuth de Google. Si no hay credenciales, vuelve al login con
// un aviso en vez de romper.
export const GET: RequestHandler = async ({ url, cookies }) => {
	const cfg = googleConfig(url.origin);
	if (!cfg.configured) throw redirect(303, '/login?error=google-nc');

	const state = randomBytes(16).toString('hex');
	cookies.set(GOOGLE_STATE_COOKIE, state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: 600
	});
	throw redirect(303, googleAuthUrl(cfg, state));
};
