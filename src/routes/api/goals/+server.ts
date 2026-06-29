import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createGoal } from '$lib/server/repo';
import type { GoalCategory, GoalIcon } from '$lib/data/mock';

const CATS: GoalCategory[] = ['viaje', 'equipo', 'emergencia', 'hogar', 'salud', 'otro'];
const ICONS: GoalIcon[] = [
	'target',
	'wallet',
	'leaf',
	'flame',
	'repeat',
	'note',
	'coins',
	'calendar',
	'sprout',
	'home'
];

// Crear una meta (del usuario en sesión).
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const name = String(b.name ?? '').trim();
	const target = Number(b.target);
	const date = String(b.date ?? '');
	const cat: GoalCategory = CATS.includes(b.cat) ? b.cat : 'otro';
	const icon: GoalIcon = ICONS.includes(b.icon) ? b.icon : 'target';

	if (name.length < 2) throw error(400, 'El nombre es muy corto');
	if (!Number.isFinite(target) || target < 1000) throw error(400, 'Monto objetivo inválido');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw error(400, 'Fecha inválida');

	const goal = await createGoal({ name, cat, icon, target, date }, locals.user.id);
	return json({ goal }, { status: 201 });
};
