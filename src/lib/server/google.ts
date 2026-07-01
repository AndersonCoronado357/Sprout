// OAuth con Google (solo servidor). Las credenciales vienen por entorno
// (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). En acmsy las inyecta el agente;
// en local, si faltan, el flujo degrada con un mensaje claro.
import { env } from '$env/dynamic/private';

export const GOOGLE_STATE_COOKIE = 'sprout_gstate';

export type GoogleConfig = {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	configured: boolean;
};

export function googleConfig(origin: string): GoogleConfig {
	const clientId = env.GOOGLE_CLIENT_ID ?? '';
	const clientSecret = env.GOOGLE_CLIENT_SECRET ?? '';
	// Detrás del proxy usar ORIGIN fijo (url.origin llega como localhost).
	const base = env.ORIGIN || origin;
	const redirectUri = env.GOOGLE_REDIRECT_URI || `${base}/auth/google/callback`;
	return { clientId, clientSecret, redirectUri, configured: !!(clientId && clientSecret) };
}

export function googleAuthUrl(cfg: GoogleConfig, state: string): string {
	const p = new URLSearchParams({
		client_id: cfg.clientId,
		redirect_uri: cfg.redirectUri,
		response_type: 'code',
		scope: 'openid email profile',
		state,
		access_type: 'offline',
		include_granted_scopes: 'true',
		prompt: 'select_account'
	});
	return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export type GoogleProfile = { email: string; name: string; verified: boolean };

// Intercambia el code por tokens y recupera el perfil del usuario.
export async function exchangeGoogleCode(
	cfg: GoogleConfig,
	code: string
): Promise<GoogleProfile | null> {
	const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			client_id: cfg.clientId,
			client_secret: cfg.clientSecret,
			redirect_uri: cfg.redirectUri,
			grant_type: 'authorization_code'
		}).toString()
	});
	if (!tokenRes.ok) return null;
	const tokens = (await tokenRes.json()) as { access_token?: string };
	if (!tokens.access_token) return null;

	const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
		headers: { Authorization: `Bearer ${tokens.access_token}` }
	});
	if (!userRes.ok) return null;
	const info = (await userRes.json()) as {
		email?: string;
		name?: string;
		email_verified?: boolean;
	};
	if (!info.email) return null;
	return {
		email: info.email,
		name: info.name || info.email.split('@')[0],
		verified: info.email_verified !== false
	};
}
