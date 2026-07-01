// Envío de correo (solo servidor). Usa Resend si hay RESEND_API_KEY;
// si no, registra el contenido en consola (útil en local sin credenciales).
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

type SendResult = { ok: boolean; skipped?: boolean; error?: string };

async function send(opts: {
	to: string;
	subject: string;
	html: string;
	text: string;
}): Promise<SendResult> {
	const key = env.RESEND_API_KEY;
	// Convención acmsy: MAIL_FROM = noreply@acmsy.com (dominio verificado),
	// MAIL_FROM_NAME = nombre visible de la app.
	const addr = env.MAIL_FROM || 'noreply@acmsy.com';
	const from = `${env.MAIL_FROM_NAME || 'Sprout'} <${addr}>`;

	if (!key) {
		// Sin credenciales: no fallamos, solo dejamos rastro para desarrollo.
		console.log(`[email:dev] Para: ${opts.to} · Asunto: ${opts.subject}\n${opts.text}`);
		return { ok: true, skipped: true };
	}

	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${key}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				from,
				to: opts.to,
				subject: opts.subject,
				html: opts.html,
				text: opts.text
			})
		});
		if (!res.ok) {
			const detail = await res.text().catch(() => '');
			console.error('[email] Resend falló', res.status, detail);
			return { ok: false, error: `Resend ${res.status}` };
		}
		return { ok: true };
	} catch (e) {
		console.error('[email] Error enviando', e);
		return { ok: false, error: 'network' };
	}
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
// URL pública fija del logo (los correos no cargan localhost ni SVG/data-uri).
const LOGO = 'https://sprout.acmsy.com/sprout-logo.png?v=2';

// HTML del correo de recuperación. Se adapta al modo claro/oscuro del lector:
// colores base claros + override con @media (prefers-color-scheme: dark). Cada
// elemento lleva clase (para el media query) e inline (respaldo si el cliente
// ignora el <style>).
export function buildResetEmailHtml(link: string): string {
	return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body, table { margin:0; padding:0; }
  .sp-bg   { background:#EEF0EB; }
  .sp-card { background:#FFFFFF; }
  .sp-ink  { color:#16181A; }
  .sp-muted{ color:#5F665E; }
  .sp-faint{ color:#9AA199; }
  .sp-brand{ color:#149E54; }
  .sp-div  { background:#E7EAE4; }
  .sp-btnbg{ background:#21B968; }
  .sp-btn  { color:#04240F; }
  .sp-url  { color:#2F8A55; }
  @media (prefers-color-scheme: dark) {
    .sp-bg   { background:#0B0C0D !important; }
    .sp-card { background:#16181A !important; }
    .sp-ink  { color:#F1F3EF !important; }
    .sp-muted{ color:#A6ADA4 !important; }
    .sp-faint{ color:#6E7A6E !important; }
    .sp-brand{ color:#34E07E !important; }
    .sp-div  { background:#26292B !important; }
    .sp-btnbg{ background:#34E07E !important; }
    .sp-btn  { color:#062A12 !important; }
    .sp-url  { color:#8FB79E !important; }
  }
</style>
</head>
<body class="sp-bg" style="margin:0;padding:0;background:#EEF0EB;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="sp-bg" style="background:#EEF0EB;">
    <tr><td align="center" style="padding:52px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="sp-card" style="max-width:480px;background:#FFFFFF;border-radius:24px;">
        <tr><td align="center" style="padding:44px 38px 0;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;"><tr>
            <td style="vertical-align:middle;">
              <img src="${LOGO}" width="38" height="38" alt="" style="display:block;width:38px;height:38px;">
            </td>
            <td class="sp-brand" style="vertical-align:middle;padding-left:11px;font-family:${FONT};font-weight:700;font-size:23px;letter-spacing:-0.01em;color:#149E54;">Sprout</td>
          </tr></table>
        </td></tr>
        <tr><td class="sp-ink" style="padding:36px 38px 0;font-family:${FONT};font-weight:700;font-size:24px;line-height:1.3;color:#16181A;text-align:center;">
          Recupera tu contraseña
        </td></tr>
        <tr><td class="sp-muted" style="padding:16px 38px 0;font-family:${FONT};font-weight:400;font-size:15px;line-height:1.7;color:#5F665E;text-align:center;">
          Recibimos una solicitud para restablecer tu contraseña. Toca el botón para crear una nueva. El enlace vence en 1 hora.
        </td></tr>
        <tr><td align="center" style="padding:36px 38px 8px;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;"><tr>
            <td class="sp-btnbg" style="border-radius:999px;background:#21B968;">
              <a href="${link}" class="sp-btn" style="display:inline-block;padding:18px 36px;font-family:${FONT};font-weight:700;font-size:15px;color:#04240F;text-decoration:none;border-radius:999px;">Crear nueva contraseña</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:42px 38px 0;">
          <div class="sp-div" style="height:1px;background:#E7EAE4;line-height:1px;font-size:0;">&nbsp;</div>
        </td></tr>
        <tr><td class="sp-faint" style="padding:26px 38px 0;font-family:${FONT};font-size:13px;line-height:1.7;color:#9AA199;text-align:center;">
          Si no fuiste tú, ignora este correo: tu contraseña seguirá igual.
        </td></tr>
        <tr><td class="sp-faint" style="padding:18px 38px 0;font-family:${FONT};font-size:13px;line-height:1.7;color:#9AA199;text-align:center;">
          O copia y pega este enlace en tu navegador:
          <div class="sp-url" style="margin-top:9px;font-size:12.5px;color:#2F8A55;word-break:break-all;">${link}</div>
        </td></tr>
        <tr><td class="sp-faint" style="padding:40px 38px 44px;font-family:${FONT};font-size:12px;line-height:1.6;color:#9AA199;text-align:center;">
          Sprout — mira crecer tus ahorros, una meta a la vez.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<SendResult> {
	const subject = 'Recupera tu contraseña de Sprout';
	const text =
		`Recupera tu contraseña de Sprout\n\n` +
		`Recibimos una solicitud para restablecer tu contraseña. Abre este enlace ` +
		`para crear una nueva (válido por 1 hora):\n${link}\n\n` +
		`Si no fuiste tú, ignora este correo: tu contraseña no cambiará.\n\n` +
		`Sprout — mira crecer tus ahorros, una meta a la vez.`;
	return send({ to, subject, html: buildResetEmailHtml(link), text });
}

// En local (sin Resend) es útil devolver el enlace para poder probar.
export function shouldExposeResetLink(): boolean {
	return dev && !env.RESEND_API_KEY;
}
