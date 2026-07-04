import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { hashPassword, createSession, SESSION_COOKIE } from '$lib/server/auth';
import { createUser, emailTaken } from '$lib/server/repo';

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: RequestHandler = async ({ request, cookies }) => {
	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const name = String(b.name ?? '').trim();
	const email = String(b.email ?? '').trim();
	const password = String(b.password ?? '');

	if (name.length < 2) throw error(400, 'Escribe tu nombre');
	if (!RE_EMAIL.test(email)) throw error(400, 'Correo inválido');
	if (password.length < 8) throw error(400, 'La contraseña tiene mínimo 8 caracteres');

	if (await emailTaken(email)) throw error(409, 'Ese correo ya está registrado');

	// El usuario se identifica por correo; username queda NULL (la BD lo permite).
	const user = await createUser({ name, email, passwordHash: hashPassword(password) });

	cookies.set(SESSION_COOKIE, createSession(user.id), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: 60 * 60 * 24 * 30
	});

	return json({ ok: true, user }, { status: 201 });
};
