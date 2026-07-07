// Web Push (solo servidor). Configura VAPID, guarda/borra suscripciones y
// envía notificaciones. Incluye la lógica de recordatorios de aportes que vencen.
import webpush from 'web-push';
import { env } from '$env/dynamic/private';
import { pool } from './db';
import { createHash, randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';

let configured = false;
function ensureConfigured(): boolean {
	if (configured) return true;
	const pub = env.VAPID_PUBLIC;
	const priv = env.VAPID_PRIVATE;
	if (!pub || !priv) return false;
	webpush.setVapidDetails(env.VAPID_SUBJECT || 'mailto:noreply@acmsy.com', pub, priv);
	configured = true;
	return true;
}

export function pushEnabled(): boolean {
	return !!(env.VAPID_PUBLIC && env.VAPID_PRIVATE);
}

export function vapidPublicKey(): string {
	return env.VAPID_PUBLIC || '';
}

function hashEndpoint(endpoint: string): string {
	return createHash('sha256').update(endpoint).digest('hex');
}

export type SubInput = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function saveSubscription(userId: number, sub: SubInput): Promise<void> {
	if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return;
	await pool.query(
		`INSERT INTO push_subscriptions (id, user_id, endpoint_hash, endpoint, p256dh, auth)
		 VALUES (?, ?, ?, ?, ?, ?)
		 ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), endpoint = VALUES(endpoint),
		   p256dh = VALUES(p256dh), auth = VALUES(auth)`,
		[randomUUID(), userId, hashEndpoint(sub.endpoint), sub.endpoint, sub.keys.p256dh, sub.keys.auth]
	);
}

export async function deleteSubscription(endpoint: string): Promise<void> {
	await pool.query('DELETE FROM push_subscriptions WHERE endpoint_hash = ?', [hashEndpoint(endpoint)]);
}

type SubRow = { id: string; endpoint: string; p256dh: string; auth: string };

async function subsForUser(userId: number): Promise<SubRow[]> {
	const [rows] = await pool.query<RowDataPacket[]>(
		'SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?',
		[userId]
	);
	return rows as SubRow[];
}

async function sendTo(sub: SubRow, payload: string): Promise<boolean> {
	try {
		await webpush.sendNotification(
			{ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
			payload
		);
		return true;
	} catch (e) {
		const code = (e as { statusCode?: number })?.statusCode;
		// 404/410 = la suscripción ya no existe → se borra.
		if (code === 404 || code === 410) {
			await pool.query('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
		}
		return false;
	}
}

export async function sendToUser(userId: number, title: string, body: string): Promise<number> {
	if (!ensureConfigured()) return 0;
	const subs = await subsForUser(userId);
	const payload = JSON.stringify({ title, body });
	let ok = 0;
	for (const s of subs) if (await sendTo(s, payload)) ok++;
	return ok;
}

const fmtCOP = (n: number) =>
	new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		maximumFractionDigits: 0
	}).format(n);

// Envía el recordatorio de cada aporte recurrente que vence hoy (o está vencido)
// y aún no se ha recordado para esa fecha. `today` en formato 'YYYY-MM-DD'.
export async function sendDueReminders(today: string): Promise<{ sent: number; goals: number }> {
	if (!ensureConfigured()) return { sent: 0, goals: 0 };
	const [rows] = await pool.query<RowDataPacket[]>(
		`SELECT id, user_id, name, recurring_amount
		   FROM goals
		  WHERE status = 'active'
		    AND recurring_next IS NOT NULL
		    AND recurring_next <= ?
		    AND (recurring_reminded_on IS NULL OR recurring_reminded_on < recurring_next)`,
		[today]
	);
	const goals = rows as { id: string; user_id: number; name: string; recurring_amount: number }[];
	let sent = 0;
	for (const g of goals) {
		const monto = fmtCOP(Number(g.recurring_amount || 0));
		sent += await sendToUser(
			g.user_id,
			'Sprout · Recordatorio',
			`Hoy toca tu aporte a "${g.name}". Aparta ${monto} para seguir creciendo.`
		);
		await pool.query('UPDATE goals SET recurring_reminded_on = ? WHERE id = ?', [today, g.id]);
	}
	return { sent, goals: goals.length };
}
