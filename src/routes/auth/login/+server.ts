import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { verifyPassword, createSession, SESSION_COOKIE } from '$lib/server/auth';
import { findUserForLogin } from '$lib/server/repo';
import { recordLogin } from '$lib/server/acmsyMirror';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const login = String(b.login ?? b.email ?? '').trim();
	const password = String(b.password ?? '');
	if (!login || !password) throw error(400, 'Faltan datos');

	const user = await findUserForLogin(login);
	// Mensaje genérico para no revelar si el correo existe.
	if (!user || !verifyPassword(password, user.password_hash)) {
		throw error(401, 'Correo o contraseña incorrectos');
	}

	cookies.set(SESSION_COOKIE, createSession(user.id), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: 60 * 60 * 24 * 30
	});

	await recordLogin(user.email, 'email', { name: user.name, passwordHash: user.password_hash });

	const { password_hash: _omit, ...safe } = user;
	return json({ ok: true, user: safe });
};
