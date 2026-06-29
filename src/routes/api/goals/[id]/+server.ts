import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGoal, updateGoal, deleteGoal, type GoalPatch } from '$lib/server/repo';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	const id = params.id!;
	const existing = await getGoal(id, locals.user.id);
	if (!existing) throw error(404, 'Meta no encontrada');

	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const patch: GoalPatch = {};
	if (b.name !== undefined) patch.name = String(b.name).trim();
	if (b.cat !== undefined) patch.cat = b.cat;
	if (b.icon !== undefined) patch.icon = b.icon;
	if (b.target !== undefined) patch.target = Number(b.target);
	if (b.date !== undefined) patch.date = String(b.date);
	if (b.completedDate !== undefined) patch.completedDate = b.completedDate;
	if (b.status !== undefined) {
		if (!['active', 'paused', 'cancelled'].includes(b.status))
			throw error(400, 'Estado inválido');
		patch.status = b.status;
	}

	await updateGoal(id, patch, locals.user.id);
	const goal = await getGoal(id, locals.user.id);
	return json({ goal });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	await deleteGoal(params.id!, locals.user.id);
	return json({ ok: true });
};
