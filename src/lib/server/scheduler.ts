// Programador interno: revisa cada 30 min y, una vez al día (después de las 8am
// hora Colombia), envía los recordatorios de los aportes que vencen. Corre dentro
// del proceso del servidor (adapter-node), así que no necesita cron externo.
import { sendDueReminders, pushEnabled } from './push';

let started = false;

export function startScheduler(): void {
	if (started) return;
	started = true;
	if (!pushEnabled()) return; // sin claves VAPID no hay nada que enviar

	const CHECK_MS = 30 * 60 * 1000; // 30 min
	let lastRun = '';

	const tick = async () => {
		try {
			const co = new Date(Date.now() - 5 * 3600 * 1000); // hora Colombia (UTC-5)
			const today = co.toISOString().slice(0, 10);
			const hour = co.getUTCHours();
			if (hour >= 8 && lastRun !== today) {
				lastRun = today;
				await sendDueReminders(today);
			}
		} catch {
			/* no interrumpir el servidor por un fallo de envío */
		}
	};

	setInterval(tick, CHECK_MS);
	void tick();
}
