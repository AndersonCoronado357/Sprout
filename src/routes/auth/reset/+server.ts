import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashResetToken, hashPassword } from '$lib/server/auth';
import { findValidReset, markResetUsed, updateUserPassword } from '$lib/server/repo';

// Aplica una nueva contraseña usando un token de recuperación válido.
export const POST: RequestHandler = async ({ request }) => {
	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const token = String(b.token ?? '').trim();
	const password = String(b.password ?? '');

	if (!token) throw error(400, 'Falta el token');
	if (password.length < 8) throw error(400, 'La contraseña tiene mínimo 8 caracteres');

	const tokenHash = hashResetToken(token);
	const userId = await findValidReset(tokenHash);
	if (!userId) throw error(400, 'El enlace es inválido o ya expiró. Pide uno nuevo.');

	await updateUserPassword(userId, hashPassword(password));
	await markResetUsed(tokenHash);

	return json({ ok: true });
};
