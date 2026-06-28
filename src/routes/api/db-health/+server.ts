import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pool } from '$lib/server/db';

// Health check de la BD (útil para verificar el deploy). No expone secretos.
export const GET: RequestHandler = async () => {
	try {
		const [counts] = (await pool.query(
			'SELECT (SELECT COUNT(*) FROM users) u, (SELECT COUNT(*) FROM goals) g, (SELECT COUNT(*) FROM contribs) c'
		)) as unknown as [Array<{ u: number; g: number; c: number }>];
		return json({ ok: true, counts: counts[0] });
	} catch (e) {
		return json({ ok: false, error: (e as Error).message }, { status: 500 });
	}
};
