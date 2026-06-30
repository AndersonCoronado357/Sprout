import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Si ya hay sesión, no mostrar el login.
export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) throw redirect(303, '/inicio');
	return {};
};
