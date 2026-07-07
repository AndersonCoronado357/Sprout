import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, verifySession } from '$lib/server/auth';
import { getUserById } from '$lib/server/repo';
import { startScheduler } from '$lib/server/scheduler';
import { touchSeen } from '$lib/server/acmsyMirror';

// Arranca el programador de recordatorios una vez, al iniciar el servidor.
startScheduler();

// En cada request: si hay cookie de sesión válida, carga el usuario en locals.
export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	const userId = verifySession(token);
	event.locals.user = userId ? await getUserById(userId) : null;
	// Marca "en línea" para el panel de acmsy (best-effort, no bloquea).
	if (event.locals.user?.email) void touchSeen(event.locals.user.email);
	return resolve(event);
};
