import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { googleConfig, exchangeGoogleCode, GOOGLE_STATE_COOKIE } from '$lib/server/google';
import { findOrCreateOAuthUser } from '$lib/server/repo';
import { createSession, SESSION_COOKIE } from '$lib/server/auth';
import { recordLogin } from '$lib/server/acmsyMirror';

// Callback de Google: valida el state, canjea el code, crea/reutiliza el
// usuario por correo y abre sesión.
export const GET: RequestHandler = async ({ url, cookies }) => {
	const cfg = googleConfig(url.origin);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const saved = cookies.get(GOOGLE_STATE_COOKIE);
	cookies.delete(GOOGLE_STATE_COOKIE, { path: '/' });

	if (url.searchParams.get('error')) throw redirect(303, '/login?error=google');
	if (!cfg.configured || !code || !state || !saved || state !== saved) {
		throw redirect(303, '/login?error=google');
	}

	const profile = await exchangeGoogleCode(cfg, code);
	if (!profile) throw redirect(303, '/login?error=google');

	const user = await findOrCreateOAuthUser({ name: profile.name, email: profile.email });
	await recordLogin(user.email, 'google', { name: user.name });
	cookies.set(SESSION_COOKIE, createSession(user.id), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: 60 * 60 * 24 * 30
	});

	throw redirect(303, '/inicio');
};
