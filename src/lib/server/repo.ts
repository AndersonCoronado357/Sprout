// Repositorio de datos (solo servidor). Traduce filas MySQL ⇄ tipos del front.
// Todo lo de metas/aportes está aislado por user_id.
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from './db';
import type { Goal, GoalCategory, GoalIcon, GoalStatus, Contrib } from '$lib/data/mock';

export type AuthUser = {
	id: number;
	name: string;
	username: string | null;
	email: string;
	initials: string;
	streak: number;
	avatar: string | null;
};

function genId(prefix: string): string {
	return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function initialsFrom(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const ini = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
	return (ini || name.slice(0, 2) || 'U').toUpperCase();
}

// ── Usuarios / auth ───────────────────────────────────────────────

type UserRow = RowDataPacket & {
	id: number;
	name: string;
	username: string | null;
	email: string;
	initials: string;
	streak: number;
	avatar?: string | null;
	password_hash?: string | null;
};

function mapUser(r: UserRow): AuthUser {
	return {
		id: r.id,
		name: r.name,
		username: r.username,
		email: r.email,
		initials: r.initials,
		streak: r.streak,
		avatar: r.avatar ?? null
	};
}

export async function getUserById(id: number): Promise<AuthUser | null> {
	const [rows] = await pool.query<UserRow[]>(
		'SELECT id, name, username, email, initials, streak, avatar FROM users WHERE id = ? LIMIT 1',
		[id]
	);
	return rows[0] ? mapUser(rows[0]) : null;
}

// Busca por correo o username (para el login). Incluye el hash.
export async function findUserForLogin(
	login: string
): Promise<(AuthUser & { password_hash: string | null }) | null> {
	const [rows] = await pool.query<UserRow[]>(
		`SELECT id, name, username, email, initials, streak, avatar, password_hash
		 FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1`,
		[login, login]
	);
	const r = rows[0];
	if (!r) return null;
	return { ...mapUser(r), password_hash: r.password_hash ?? null };
}

export async function emailTaken(email: string): Promise<boolean> {
	const [rows] = await pool.query<RowDataPacket[]>(
		'SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
		[email]
	);
	return rows.length > 0;
}

export async function usernameTaken(username: string): Promise<boolean> {
	const [rows] = await pool.query<RowDataPacket[]>(
		'SELECT 1 FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
		[username]
	);
	return rows.length > 0;
}

export async function createUser(input: {
	name: string;
	username?: string | null;
	email: string;
	passwordHash: string;
}): Promise<AuthUser> {
	const [res] = await pool.query<ResultSetHeader>(
		'INSERT INTO users (name, username, email, initials, streak, password_hash) VALUES (?, ?, ?, ?, 0, ?)',
		[input.name, input.username ?? null, input.email, initialsFrom(input.name), input.passwordHash]
	);
	const user = await getUserById(res.insertId);
	return user!;
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
	await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}

// Actualiza nombre y/o foto. name recalcula las iniciales; avatar acepta
// string (nueva foto), null (quitar) o undefined (no tocar).
export async function updateUserProfile(
	userId: number,
	patch: { name?: string; avatar?: string | null }
): Promise<void> {
	const sets: string[] = [];
	const vals: unknown[] = [];
	if (patch.name !== undefined) {
		sets.push('name = ?', 'initials = ?');
		vals.push(patch.name, initialsFrom(patch.name));
	}
	if (patch.avatar !== undefined) {
		sets.push('avatar = ?');
		vals.push(patch.avatar);
	}
	if (sets.length === 0) return;
	vals.push(userId);
	await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
}

// Login con proveedor externo (Google): reutiliza la cuenta si el correo ya
// existe; si no, crea una nueva sin contraseña (password_hash NULL).
export async function findOrCreateOAuthUser(input: {
	name: string;
	email: string;
}): Promise<AuthUser> {
	const existing = await findUserForLogin(input.email);
	if (existing) {
		const { password_hash: _ph, ...user } = existing;
		return user;
	}

	let base =
		input.email
			.split('@')[0]
			.replace(/[^a-zA-Z0-9_]/g, '')
			.slice(0, 18) || 'user';
	if (base.length < 3) base = `${base}user`;
	let username = base;
	let i = 0;
	while (await usernameTaken(username)) {
		i += 1;
		username = `${base.slice(0, 16)}${i}`;
	}

	const [res] = await pool.query<ResultSetHeader>(
		'INSERT INTO users (name, username, email, initials, streak, password_hash) VALUES (?, ?, ?, ?, 0, NULL)',
		[input.name, username, input.email, initialsFrom(input.name)]
	);
	return (await getUserById(res.insertId))!;
}

// ── Recuperación de contraseña ────────────────────────────────────

// Crea un token (invalida los anteriores sin usar del mismo usuario).
export async function createPasswordReset(
	userId: number,
	tokenHash: string,
	expiresAt: Date
): Promise<void> {
	await pool.query('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL', [userId]);
	await pool.query(
		'INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
		[tokenHash, userId, expiresAt]
	);
}

// Devuelve el user_id si el token existe, no está usado y no ha expirado.
export async function findValidReset(tokenHash: string): Promise<number | null> {
	const [rows] = await pool.query<RowDataPacket[]>(
		'SELECT user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1',
		[tokenHash]
	);
	return rows[0] ? Number(rows[0].user_id) : null;
}

export async function markResetUsed(tokenHash: string): Promise<void> {
	await pool.query('UPDATE password_resets SET used_at = NOW() WHERE token_hash = ?', [tokenHash]);
}

// ── Metas / aportes (aislados por user_id) ────────────────────────

type GoalRow = RowDataPacket & {
	id: string;
	name: string;
	cat: GoalCategory;
	icon: GoalIcon;
	target: number | string;
	target_date: string;
	created_date: string;
	completed_date: string | null;
	status: GoalStatus;
	recurring_amount: number | string | null;
	recurring_every: string | null;
	recurring_next: string | null;
};

type ContribRow = RowDataPacket & {
	id: string;
	goal_id: string;
	amount: number | string;
	occurred_on: string;
	note: string | null;
};

function mapContrib(r: ContribRow): Contrib {
	const c: Contrib = { id: r.id, amount: Number(r.amount), date: r.occurred_on };
	if (r.note) c.note = r.note;
	return c;
}

function mapGoal(r: GoalRow, contribs: Contrib[]): Goal {
	const g: Goal = {
		id: r.id,
		name: r.name,
		cat: r.cat,
		icon: r.icon,
		target: Number(r.target),
		date: r.target_date,
		created: r.created_date,
		status: r.status ?? 'active',
		recurring:
			r.recurring_amount != null
				? {
						amount: Number(r.recurring_amount),
						every: (r.recurring_every || 'semana') as 'semana' | 'quincena' | 'mes',
						next: r.recurring_next || ''
					}
				: null,
		contribs
	};
	if (r.completed_date) g.completedDate = r.completed_date;
	return g;
}

export async function listGoals(userId: number): Promise<Goal[]> {
	const [goalRows] = await pool.query<GoalRow[]>(
		'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC, id ASC',
		[userId]
	);
	if (goalRows.length === 0) return [];
	const ids = goalRows.map((g) => g.id);
	const [contribRows] = await pool.query<ContribRow[]>(
		`SELECT * FROM contribs WHERE goal_id IN (${ids.map(() => '?').join(',')}) ORDER BY occurred_on DESC, created_at DESC`,
		ids
	);
	const byGoal = new Map<string, Contrib[]>();
	for (const cr of contribRows) {
		const arr = byGoal.get(cr.goal_id) ?? [];
		arr.push(mapContrib(cr));
		byGoal.set(cr.goal_id, arr);
	}
	return goalRows.map((gr) => mapGoal(gr, byGoal.get(gr.id) ?? []));
}

// Devuelve la meta solo si pertenece al usuario.
export async function getGoal(id: string, userId: number): Promise<Goal | null> {
	const [goalRows] = await pool.query<GoalRow[]>(
		'SELECT * FROM goals WHERE id = ? AND user_id = ? LIMIT 1',
		[id, userId]
	);
	const gr = goalRows[0];
	if (!gr) return null;
	const [contribRows] = await pool.query<ContribRow[]>(
		'SELECT * FROM contribs WHERE goal_id = ? ORDER BY occurred_on DESC, created_at DESC',
		[id]
	);
	return mapGoal(gr, contribRows.map(mapContrib));
}

export type NewGoalInput = {
	name: string;
	cat: GoalCategory;
	icon: GoalIcon;
	target: number;
	date: string;
};

export async function createGoal(input: NewGoalInput, userId: number): Promise<Goal> {
	const id = genId('g');
	const today = new Date().toISOString().slice(0, 10);
	await pool.query(
		`INSERT INTO goals (id, user_id, name, cat, icon, target, target_date, created_date)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		[id, userId, input.name, input.cat, input.icon, Math.round(input.target), input.date, today]
	);
	return (await getGoal(id, userId))!;
}

export type GoalPatch = Partial<{
	name: string;
	cat: GoalCategory;
	icon: GoalIcon;
	target: number;
	date: string;
	completedDate: string | null;
	status: GoalStatus;
}>;

export async function updateGoal(id: string, patch: GoalPatch, userId: number): Promise<void> {
	const sets: string[] = [];
	const vals: unknown[] = [];
	if (patch.name !== undefined) (sets.push('name = ?'), vals.push(patch.name));
	if (patch.cat !== undefined) (sets.push('cat = ?'), vals.push(patch.cat));
	if (patch.icon !== undefined) (sets.push('icon = ?'), vals.push(patch.icon));
	if (patch.target !== undefined) (sets.push('target = ?'), vals.push(Math.round(patch.target)));
	if (patch.date !== undefined) (sets.push('target_date = ?'), vals.push(patch.date));
	if (patch.completedDate !== undefined)
		(sets.push('completed_date = ?'), vals.push(patch.completedDate));
	if (patch.status !== undefined) (sets.push('status = ?'), vals.push(patch.status));
	if (sets.length === 0) return;
	vals.push(id, userId);
	await pool.query(`UPDATE goals SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, vals);
}

export async function deleteGoal(id: string, userId: number): Promise<void> {
	await pool.query('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, userId]);
}

export async function setRecurring(
	goalId: string,
	rec: { amount: number; every: string; next: string } | null,
	userId: number
): Promise<void> {
	if (rec) {
		await pool.query(
			'UPDATE goals SET recurring_amount = ?, recurring_every = ?, recurring_next = ? WHERE id = ? AND user_id = ?',
			[Math.round(rec.amount), rec.every, rec.next, goalId, userId]
		);
	} else {
		await pool.query(
			'UPDATE goals SET recurring_amount = NULL, recurring_every = NULL, recurring_next = NULL WHERE id = ? AND user_id = ?',
			[goalId, userId]
		);
	}
}

export type NewContribInput = { amount: number; date: string; note?: string };

export async function addContrib(
	goalId: string,
	input: NewContribInput,
	userId: number
): Promise<{ ok: boolean; completed: boolean }> {
	const [goalRows] = await pool.query<GoalRow[]>(
		'SELECT target, completed_date FROM goals WHERE id = ? AND user_id = ? LIMIT 1',
		[goalId, userId]
	);
	const gr = goalRows[0];
	if (!gr) return { ok: false, completed: false };

	const id = genId('c');
	await pool.query(
		'INSERT INTO contribs (id, goal_id, amount, occurred_on, note) VALUES (?, ?, ?, ?, ?)',
		[id, goalId, Math.round(input.amount), input.date, input.note?.trim() || null]
	);

	const [sumRows] = await pool.query<RowDataPacket[]>(
		'SELECT COALESCE(SUM(amount),0) AS total FROM contribs WHERE goal_id = ?',
		[goalId]
	);
	const total = Number(sumRows[0].total);
	const target = Number(gr.target);
	let completed = false;
	if (total >= target && !gr.completed_date) {
		await pool.query('UPDATE goals SET completed_date = ? WHERE id = ?', [input.date, goalId]);
		completed = true;
	}
	return { ok: true, completed };
}

export async function updateContrib(
	id: string,
	patch: Partial<{ amount: number; date: string; note: string | null }>,
	userId: number
): Promise<void> {
	const sets: string[] = [];
	const vals: unknown[] = [];
	if (patch.amount !== undefined) (sets.push('c.amount = ?'), vals.push(Math.round(patch.amount)));
	if (patch.date !== undefined) (sets.push('c.occurred_on = ?'), vals.push(patch.date));
	if (patch.note !== undefined) (sets.push('c.note = ?'), vals.push(patch.note?.trim() || null));
	if (sets.length === 0) return;
	vals.push(id, userId);
	await pool.query(
		`UPDATE contribs c JOIN goals g ON c.goal_id = g.id SET ${sets.join(', ')} WHERE c.id = ? AND g.user_id = ?`,
		vals
	);
}

export async function deleteContrib(id: string, userId: number): Promise<void> {
	await pool.query(
		'DELETE c FROM contribs c JOIN goals g ON c.goal_id = g.id WHERE c.id = ? AND g.user_id = ?',
		[id, userId]
	);
}
