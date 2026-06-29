import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateContrib, deleteContrib } from '$lib/server/repo';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	const id = params.id!;
	const b = await request.json().catch(() => null);
	if (!b) throw error(400, 'Cuerpo inválido');

	const patch: Partial<{ amount: number; date: string; note: string | null }> = {};
	if (b.amount !== undefined) {
		const amount = Number(b.amount);
		if (!Number.isFinite(amount) || amount === 0) throw error(400, 'Monto inválido');
		patch.amount = amount;
	}
	if (b.date !== undefined) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.date))) throw error(400, 'Fecha inválida');
		patch.date = String(b.date);
	}
	if (b.note !== undefined) patch.note = b.note != null ? String(b.note) : null;

	await updateContrib(id, patch, locals.user.id);
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'No autenticado');
	await deleteContrib(params.id!, locals.user.id);
	return json({ ok: true });
};
