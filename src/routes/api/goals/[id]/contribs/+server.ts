import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGoal, addContrib } from '$lib/server/repo';

// Registrar un aporte (o retiro, monto negativo) en una meta del usuario.
export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	const goalId = params.id!;

	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const amount = Number(b.amount);
	const date = String(b.date ?? '');
	const note = b.note != null ? String(b.note) : undefined;

	if (!Number.isFinite(amount) || amount === 0) throw error(400, 'Monto inválido');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw error(400, 'Fecha inválida');

	const res = await addContrib(goalId, { amount, date, note }, locals.user.id);
	if (!res.ok) throw error(404, 'Meta no encontrada');

	const goal = await getGoal(goalId, locals.user.id);
	return json({ completed: res.completed, goal }, { status: 201 });
};
