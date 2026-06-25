import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// La raíz manda al inicio si hay sesión, si no al login.
export const load: PageServerLoad = ({ locals }) => {
	throw redirect(303, locals.user ? '/inicio' : '/login');
};
