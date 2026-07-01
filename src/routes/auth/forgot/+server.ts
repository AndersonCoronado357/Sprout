import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { newResetToken } from '$lib/server/auth';
import { findUserForLogin, createPasswordReset } from '$lib/server/repo';
import { sendPasswordResetEmail, shouldExposeResetLink } from '$lib/server/email';

// Solicita un enlace de recuperación. Responde siempre igual (no revela si el
// correo existe). Si hay usuario, genera token y envía el correo.
export const POST: RequestHandler = async ({ request, url }) => {
	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const login = String(b.email ?? b.login ?? '').trim();
	if (login.length < 3) throw error(400, 'Escribe tu correo');

	const user = await findUserForLogin(login);
	let exposedLink: string | undefined;

	if (user) {
		const { raw, hash } = newResetToken();
		const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
		await createPasswordReset(user.id, hash, expires);
		// Detrás del proxy acmsy, url.origin llega como localhost → usar ORIGIN.
		const base = env.ORIGIN || url.origin;
		const link = `${base}/reset?token=${raw}`;
		await sendPasswordResetEmail(user.email, link);
		if (shouldExposeResetLink()) exposedLink = link; // solo local sin Resend
	}

	// Misma respuesta exista o no el usuario.
	return json({ ok: true, ...(exposedLink ? { devLink: exposedLink } : {}) });
};
