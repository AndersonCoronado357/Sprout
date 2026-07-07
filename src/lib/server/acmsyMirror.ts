// Espejo de usuarios/logins de Sprout hacia las tablas `auth_users`/`auth_logins`
// que lee el panel de acmsy. Todo es best-effort: si algo falla, NO debe romper
// el login. Sprout sigue usando su propia tabla `users` para lo demás.
import { pool } from './db';
import type { RowDataPacket } from 'mysql2';

const norm = (e: string) => String(e || '').trim().toLowerCase();

async function ensureAuthUser(
	email: string,
	name?: string | null,
	googleId?: string | null,
	passwordHash?: string | null
): Promise<number | null> {
	const e = norm(email);
	if (!e) return null;
	await pool.query(
		`INSERT INTO auth_users (email, name, google_id, password_hash, email_verified)
		 VALUES (?, ?, ?, ?, 1)
		 ON DUPLICATE KEY UPDATE
		   name = COALESCE(VALUES(name), name),
		   google_id = COALESCE(VALUES(google_id), google_id),
		   password_hash = COALESCE(VALUES(password_hash), password_hash)`,
		[e, name ?? null, googleId ?? null, passwordHash ?? null]
	);
	const [rows] = await pool.query<RowDataPacket[]>(
		'SELECT id FROM auth_users WHERE email = ? LIMIT 1',
		[e]
	);
	return (rows[0]?.id as number) ?? null;
}

type LoginOpts = { name?: string | null; googleId?: string | null; passwordHash?: string | null };

// Registra un inicio de sesión: crea/actualiza el espejo del usuario, marca la
// última entrada, suma al contador y guarda el evento en el historial.
export async function recordLogin(email: string, method: string, opts: LoginOpts = {}): Promise<void> {
	try {
		const id = await ensureAuthUser(email, opts.name, opts.googleId, opts.passwordHash);
		if (id == null) return;
		await pool.query(
			'UPDATE auth_users SET last_login_at = NOW(), last_seen_at = NOW(), login_count = COALESCE(login_count,0) + 1 WHERE id = ?',
			[id]
		);
		await pool.query('INSERT INTO auth_logins (user_id, method, created_at) VALUES (?, ?, NOW())', [
			id,
			method
		]);
	} catch {
		/* el espejo nunca debe romper el login */
	}
}

// Al cerrar sesión: deja de contar como "en línea".
export async function markOffline(email: string): Promise<void> {
	try {
		await pool.query('UPDATE auth_users SET last_seen_at = NULL WHERE email = ?', [norm(email)]);
	} catch {
		/* noop */
	}
}

// Marca actividad reciente (para "en línea"); solo escribe si pasaron >60s.
export async function touchSeen(email: string): Promise<void> {
	try {
		await pool.query(
			'UPDATE auth_users SET last_seen_at = NOW() WHERE email = ? AND (last_seen_at IS NULL OR last_seen_at < (NOW() - INTERVAL 60 SECOND))',
			[norm(email)]
		);
	} catch {
		/* noop */
	}
}
