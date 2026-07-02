import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateUserProfile, getUserById } from '$lib/server/repo';

// Actualiza el perfil del usuario autenticado: nombre y/o foto.
export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');

	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const patch: { name?: string; avatar?: string | null } = {};

	if (b.name !== undefined) {
		const name = String(b.name).trim();
		if (name.length < 2) throw error(400, 'El nombre es muy corto');
		if (name.length > 60) throw error(400, 'El nombre es muy largo');
		patch.name = name;
	}

	if (b.avatar !== undefined) {
		if (b.avatar === null) {
			patch.avatar = null;
		} else {
			const avatar = String(b.avatar);
			if (!avatar.startsWith('data:image/')) throw error(400, 'Formato de imagen inválido');
			if (avatar.length > 2_000_000) throw error(400, 'La imagen es muy grande');
			patch.avatar = avatar;
		}
	}

	await updateUserProfile(locals.user.id, patch);
	const user = await getUserById(locals.user.id);
	return json({ user });
};
