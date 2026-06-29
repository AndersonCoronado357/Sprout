import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { listGoals } from '$lib/server/repo';

// Protege las vistas autenticadas: sin sesión → al login. Con sesión, carga
// el usuario (del hook) y sus metas.
export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	const goals = await listGoals(locals.user.id);
	return { user: locals.user, goals };
};
