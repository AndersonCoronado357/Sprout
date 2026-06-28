// Pool MySQL compartido (solo servidor). Lee credenciales de entorno.
// Local: .env con DB_*. acmsy: mismas variables (o DATABASE_URL) inyectadas.
import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

function buildPool() {
	// Prioridad: DATABASE_URL (mysql://user:pass@host:port/db) si viene; si no, DB_*.
	if (env.DATABASE_URL) {
		return mysql.createPool({
			uri: env.DATABASE_URL,
			dateStrings: true,
			connectionLimit: 10,
			namedPlaceholders: false
		});
	}
	return mysql.createPool({
		host: env.DB_HOST || '127.0.0.1',
		port: Number(env.DB_PORT || 3306),
		user: env.DB_USER || 'root',
		password: env.DB_PASSWORD || '',
		database: env.DB_NAME || 'sprout',
		dateStrings: true, // DATE/DATETIME → 'YYYY-MM-DD' (el front usa strings)
		charset: 'utf8mb4',
		connectionLimit: 10,
		waitForConnections: true
	});
}

// Singleton entre recargas de HMR en dev.
const g = globalThis as unknown as { __sproutPool?: mysql.Pool };
export const pool: mysql.Pool = g.__sproutPool ?? (g.__sproutPool = buildPool());
