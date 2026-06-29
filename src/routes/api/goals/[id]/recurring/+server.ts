import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGoal, setRecurring } from '$lib/server/repo';

const EVERY = ['semana', 'quincena', 'mes'];

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	const goalId = params.id!;
	const existing = await getGoal(goalId, locals.user.id);
	if (!existing) throw error(404, 'Meta no encontrada');

	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	if (b.recurring == null) {
		await setRecurring(goalId, null, locals.user.id);
	} else {
		const amount = Number(b.recurring.amount);
		const every = String(b.recurring.every ?? '');
		const next = String(b.recurring.next ?? '');
		if (!Number.isFinite(amount) || amount <= 0) throw error(400, 'Monto inválido');
		if (!EVERY.includes(every)) throw error(400, 'Frecuencia inválida');
		if (!/^\d{4}-\d{2}-\d{2}$/.test(next)) throw error(400, 'Fecha inválida');
		await setRecurring(goalId, { amount, every, next }, locals.user.id);
	}

	const goal = await getGoal(goalId, locals.user.id);
	return json({ goal });
};
