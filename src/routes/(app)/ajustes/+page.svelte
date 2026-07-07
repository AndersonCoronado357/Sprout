<script lang="ts">
	// SettingsScreen portado 1:1 desde sprout-screens3.jsx
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import TopBar from '$lib/components/TopBar.svelte';
	import Card from '$lib/components/Card.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import SegSwitch from '$lib/components/SegSwitch.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Sprig from '$lib/components/Sprig.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import RecorteFoto from '$lib/components/RecorteFoto.svelte';
	import { appState } from '$lib/state.svelte';
	import { fmtMoney, goalSaved, goalPct, CURRENCIES, type CurrencyCode } from '$lib/format';

	let mob = $state(false);
	function calcMob() {
		mob = typeof window !== 'undefined' && window.matchMedia('(max-width: 859px)').matches;
	}
	onMount(() => {
		calcMob();
		window.addEventListener('resize', calcMob);
		return () => window.removeEventListener('resize', calcMob);
	});

	let GOALS = $derived(appState.goals);
	let USER = $derived(appState.user);
	let notif = $state(false);
	let notifMsg = $state('');

	// ── Perfil: nombre editable + foto ────────────────────────────────
	let fileInput = $state<HTMLInputElement>();
	let subiendoFoto = $state(false);
	let perfilMsg = $state('');
	let nombre = $state('');
	// Sincroniza el nombre local con el del servidor (al cargar y tras guardar).
	$effect(() => {
		nombre = USER.name;
	});

	// Archivo elegido pendiente de recortar (abre el modal RecorteFoto).
	let archivoFoto = $state<File | null>(null);

	function abrirSelectorFoto() {
		perfilMsg = '';
		fileInput?.click();
	}

	// Al elegir un archivo, abre el recortador (no sube de una).
	function onArchivo(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const f = input.files?.[0];
		if (f) {
			perfilMsg = '';
			archivoFoto = f;
		}
		input.value = '';
	}

	// El recortador devuelve el data URL final. Cierra el modal de inmediato
	// (síncrono, igual que Cancelar) y sube la foto en segundo plano.
	// El recortador devuelve el data URL final. Cierra el modal y sube en segundo plano.
	function fotoRecortada(dataUrl: string) {
		archivoFoto = null;
		subiendoFoto = true;
		perfilMsg = '';
		(async () => {
			const ok = await appState.updateProfile({ avatar: dataUrl });
			if (!ok) perfilMsg = 'No se pudo guardar la foto.';
			subiendoFoto = false;
		})();
	}

	function cancelarRecorte() {
		archivoFoto = null;
	}

	async function quitarFoto() {
		subiendoFoto = true;
		perfilMsg = '';
		await appState.updateProfile({ avatar: null });
		subiendoFoto = false;
	}

	async function guardarNombre() {
		const v = nombre.trim();
		if (!v || v === USER.name) {
			nombre = USER.name;
			return;
		}
		await appState.updateProfile({ name: v });
	}
	function onNombreKey(e: KeyboardEvent) {
		const el = e.currentTarget as HTMLInputElement;
		if (e.key === 'Enter') {
			e.preventDefault();
			el.blur();
		} else if (e.key === 'Escape') {
			nombre = USER.name;
			el.blur();
		}
	}

	// Al activar Recordatorios: pide permiso y muestra una notificación de
	// ejemplo (cómo se vería un recordatorio de aporte).
	async function toggleNotif() {
		const prendiendo = !notif;
		notif = prendiendo;
		notifMsg = '';
		if (!prendiendo) return;

		if (typeof Notification === 'undefined') {
			notifMsg = 'Tu navegador no soporta notificaciones.';
			notif = false;
			return;
		}
		let permiso = Notification.permission;
		if (permiso === 'default') permiso = await Notification.requestPermission();
		if (permiso !== 'granted') {
			notifMsg = 'Activa los permisos de notificación del navegador para recibir recordatorios.';
			notif = false;
			return;
		}

		// Ejemplo con una meta real: la que tiene aporte automático, o una activa.
		const meta =
			GOALS.find((g) => g.recurring) || GOALS.find((g) => goalPct(g) < 100) || GOALS[0];
		const monto = meta?.recurring
			? fmtMoney(meta.recurring.amount, appState.cur)
			: fmtMoney(50000, appState.cur);
		const nombre = meta?.name || 'tu meta';

		try {
			const n = new Notification('Sprout · Recordatorio', {
				body: `Hoy toca tu aporte a "${nombre}". Aparta ${monto} para seguir creciendo.`,
				icon: '/icon-192.png',
				badge: '/icon-192.png',
				tag: 'sprout-demo'
			});
			setTimeout(() => n.close(), 8000);
			notifMsg = 'Así se verá cada recordatorio de aporte.';
		} catch {
			notifMsg = 'No se pudo mostrar la notificación de ejemplo.';
		}
	}

	async function cerrarSesion() {
		await fetch('/auth/logout', { method: 'POST' });
		await invalidateAll();
		goto('/login');
	}

	let total = $derived(GOALS.reduce((s, g) => s + goalSaved(g), 0));
	let activeG = $derived(GOALS.filter((g) => goalPct(g) < 100));
	let aggTarget = $derived(activeG.reduce((s, g) => s + g.target, 0));
	let aggSaved = $derived(activeG.reduce((s, g) => s + goalSaved(g), 0));
	let aggPct = $derived(aggTarget ? Math.round((aggSaved / aggTarget) * 100) : 0);
	let doneCount = $derived(GOALS.filter((g) => goalPct(g) >= 100).length);
</script>

<svelte:head>
	<title>Ajustes — Sprout</title>
</svelte:head>

<div style="width:100%;flex:1;min-height:0;display:flex;flex-direction:column;">
	<TopBar big title="Ajustes" sub="Tu cuenta y preferencias." />

	<div
		style={`display:grid;grid-template-columns:${mob ? '1fr' : '1.35fr 1fr'};gap:18px;flex:1;min-height:0;align-items:stretch;`}
	>
		<div style={`display:flex;flex-direction:column;gap:${mob ? 12 : 18}px;min-height:0;`}>
			<div class="enter-soft" style="animation-delay:60ms;">
				<Card pad={mob ? 14 : 22} style={`display:flex;align-items:center;gap:${mob ? 14 : 20}px;`}>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					onchange={onArchivo}
					style="display:none;"
				/>
				<button
					type="button"
					onclick={abrirSelectorFoto}
					disabled={subiendoFoto}
					aria-label="Cambiar foto"
					class="avatar-btn"
					style={`position:relative;flex-shrink:0;border:none;background:none;padding:0;` +
						`cursor:${subiendoFoto ? 'wait' : 'pointer'};border-radius:999px;` +
						`width:${mob ? 74 : 140}px;height:${mob ? 74 : 140}px;`}
				>
					<span
						class="avatar-foto"
						style="display:block;width:100%;height:100%;border-radius:999px;overflow:hidden;
						background:var(--color-accent-soft);color:var(--color-accent-deep);transition:filter .18s ease;"
					>
						{#if USER.avatar}
							<img
								src={USER.avatar}
								alt="Tu foto"
								style="width:100%;height:100%;object-fit:cover;display:block;"
							/>
						{:else}
							<span
								style={`width:100%;height:100%;display:grid;place-items:center;` +
									`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 32 : 48}px;`}
							>
								{USER.initials}
							</span>
						{/if}
					</span>
					<span
						class="cam-badge"
						style={`position:absolute;right:2%;bottom:2%;width:${mob ? 30 : 38}px;height:${mob ? 30 : 38}px;` +
							`border-radius:999px;color:#062a12;` +
							`display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.28);` +
							`border:3px solid var(--color-surface);`}
					>
						{#if subiendoFoto}
							<span
								style="width:14px;height:14px;border-radius:99px;border:2px solid rgba(6,42,18,0.35);border-top-color:#062a12;display:block;animation:spin .7s linear infinite;"
							></span>
						{:else}
							<Icon name="camera" size={mob ? 15 : 18} />
						{/if}
					</span>
				</button>
				<div
					style="flex:1;min-width:0;align-self:stretch;display:flex;flex-direction:column;justify-content:center;gap:6px;"
				>
					<input
						bind:value={nombre}
						onblur={guardarNombre}
						onkeydown={onNombreKey}
						maxlength="60"
						placeholder="Tu nombre"
						aria-label="Tu nombre"
						class="nombre-edit"
						style={`width:100%;box-sizing:border-box;border-radius:12px;padding:6px 10px;margin-left:-10px;` +
							`font-family:var(--font-disp);font-weight:600;font-size:${mob ? 24 : 30}px;color:var(--color-ink);letter-spacing:-0.015em;outline:none;`}
					/>
					<div
						style="font-family:var(--font-body);font-weight:600;font-size:15px;color:var(--color-muted);"
					>
						{USER.email}
					</div>
					{#if USER.avatar || perfilMsg}
						<div style="display:flex;align-items:center;gap:12px;margin-top:6px;">
							{#if USER.avatar}
								<button
									type="button"
									onclick={quitarFoto}
									disabled={subiendoFoto}
									class="quitar-foto"
									style="background:none;border:none;cursor:pointer;padding:2px 0;
									font-family:var(--font-body);font-weight:700;font-size:13px;color:var(--color-muted);"
								>
									Quitar foto
								</button>
							{/if}
							{#if perfilMsg}
								<span
									style="font-family:var(--font-body);font-weight:600;font-size:13px;color:#E5786F;"
								>
									{perfilMsg}
								</span>
							{/if}
						</div>
					{/if}
				</div>
			</Card>
			</div>

			<div class="enter-soft" style="animation-delay:180ms;flex:{mob ? '0 0 auto' : '1'};display:flex;">
			<Card
				pad={mob ? '2px 16px' : '6px 22px'}
				style={`flex:${mob ? '0 0 auto' : 1};display:flex;flex-direction:column;justify-content:${mob ? 'flex-start' : 'center'};width:100%;`}
			>
				<!-- Tema -->
				<div
					style={`display:flex;align-items:center;gap:14px;padding:${mob ? 13 : 16}px 0;border-bottom:1px solid var(--color-border);`}
				>
					<span
						style={`width:${mob?34:42}px;height:${mob?34:42}px;border-radius:11px;background:var(--color-surface-2);color:var(--color-accent-deep);display:grid;place-items:center;flex-shrink:0;`}
					>
						<Icon name={appState.theme === 'dark' ? 'moon' : 'sun'} size={20} />
					</span>
					<div style="flex:1;">
						<div
							style="font-family:var(--font-body);font-weight:700;font-size:15px;color:var(--color-ink);"
						>
							Tema
						</div>
						<div
							style={`font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);margin-top:2px;${mob ? "display:none;" : ""}`}
						>
							Claro u oscuro
						</div>
					</div>
					<SegSwitch
						value={appState.theme}
						onChange={(v) => (appState.theme = v as 'light' | 'dark')}
						options={[
							{ value: 'light', label: 'Claro', icon: 'sun' },
							{ value: 'dark', label: 'Oscuro', icon: 'moon' }
						]}
					/>
				</div>

				<!-- Moneda -->
				<div
					style={`display:flex;align-items:center;gap:14px;padding:${mob ? 13 : 16}px 0;border-bottom:1px solid var(--color-border);`}
				>
					<span
						style={`width:${mob?34:42}px;height:${mob?34:42}px;border-radius:11px;background:var(--color-surface-2);color:var(--color-accent-deep);display:grid;place-items:center;flex-shrink:0;`}
					>
						<Icon name="coins" size={20} />
					</span>
					<div style="flex:1;">
						<div
							style="font-family:var(--font-body);font-weight:700;font-size:15px;color:var(--color-ink);"
						>
							Moneda
						</div>
						<div
							style={`font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);margin-top:2px;${mob ? "display:none;" : ""}`}
						>
							Para mostrar tus montos
						</div>
					</div>
					<div style="width:150px;">
						<Dropdown
							compact
							value={appState.cur}
							onChange={(v) => (appState.cur = v as CurrencyCode)}
							options={Object.keys(CURRENCIES).map((k) => ({
								value: k,
								label: `${k} · ${CURRENCIES[k as CurrencyCode].symbol}`
							}))}
						/>
					</div>
				</div>

				<!-- Recordatorios -->
				<div
					style={`display:flex;align-items:center;gap:14px;padding:${mob ? 13 : 16}px 0;border-bottom:1px solid var(--color-border);`}
				>
					<span
						style={`width:${mob?34:42}px;height:${mob?34:42}px;border-radius:11px;background:var(--color-surface-2);color:var(--color-accent-deep);display:grid;place-items:center;flex-shrink:0;`}
					>
						<Icon name="bell" size={20} />
					</span>
					<div style="flex:1;">
						<div
							style="font-family:var(--font-body);font-weight:700;font-size:15px;color:var(--color-ink);"
						>
							Recordatorios
						</div>
						<div
							style={`font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);margin-top:2px;${mob ? "display:none;" : ""}`}
						>
							Avisos de aportes automáticos
						</div>
						{#if notifMsg}
							<div
								style="font-family:var(--font-body);font-weight:600;font-size:12px;color:var(--color-accent-deep);margin-top:5px;"
							>
								{notifMsg}
							</div>
						{/if}
					</div>
					<button
						onclick={toggleNotif}
						style={`width:52px;height:31px;border-radius:99px;border:none;cursor:pointer;flex-shrink:0;` +
							`background:${notif ? 'var(--color-accent)' : 'var(--color-track)'};position:relative;transition:background .2s;`}
						aria-label="Toggle recordatorios"
					>
						<span
							style={`position:absolute;top:3px;left:${notif ? 24 : 3}px;width:25px;height:25px;border-radius:99px;background:#fff;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,0.25);`}
						></span>
					</button>
				</div>

				<!-- Privacidad -->
				<div
					style={`display:flex;align-items:center;gap:14px;padding:${mob ? 13 : 16}px 0;`}
				>
					<span
						style={`width:${mob?34:42}px;height:${mob?34:42}px;border-radius:11px;background:var(--color-surface-2);color:var(--color-accent-deep);display:grid;place-items:center;flex-shrink:0;`}
					>
						<Icon name="user" size={20} />
					</span>
					<div style="flex:1;">
						<div
							style="font-family:var(--font-body);font-weight:700;font-size:15px;color:var(--color-ink);"
						>
							Privacidad
						</div>
						<div
							style={`font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);margin-top:2px;${mob ? "display:none;" : ""}`}
						>
							Tus metas solo las ves tú
						</div>
					</div>
				</div>
			</Card>
			</div>

			<div class="enter-soft" style="animation-delay:300ms;">
				<Btn full variant="danger" icon="arrowL" onclick={cerrarSesion}>
					Cerrar sesión
				</Btn>
			</div>
		</div>

		{#if !mob}
			<div
				class="enter-slide-r"
				style="background:var(--color-accent-deep);color:#fff;border-radius:24px;
				padding:clamp(26px, 2.6vw, 36px);position:relative;overflow:hidden;display:flex;flex-direction:column;animation-delay:120ms;"
			>
				<svg
					viewBox="0 0 400 400"
					style="position:absolute;right:-24%;bottom:-26%;width:94%;opacity:0.18;color:#fff;"
					fill="none"
					stroke="currentColor"
				>
					{#each [176, 130, 86, 44] as r}
						<circle cx="200" cy="200" {r} stroke-width="2" />
					{/each}
				</svg>
				<div
					style="position:relative;display:flex;align-items:center;justify-content:space-between;"
				>
					<span style="display:flex;align-items:center;gap:10px;">
						<Sprig size={26} color="#fff" />
						<span
							style="font-family:var(--font-disp);font-weight:700;font-size:21px;"
						>Sprout</span>
					</span>
					<span
						style="font-family:var(--font-body);font-weight:800;font-size:11px;letter-spacing:0.12em;opacity:0.7;"
					>TU JARDÍN</span>
				</div>
				<div
					style="position:relative;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
					gap:16px;text-align:center;padding:20px 0;"
				>
					<svg width="118" height="128" viewBox="0 0 118 128" fill="none">
						<path d="M59 128 V44" stroke="#fff" stroke-width="3.4" stroke-linecap="round" />
						<path d="M59 86c0-20-14-33-34-33 0 20 14 33 34 33Z" fill="#fff" opacity="0.95" />
						<path d="M59 68c0-17 12-29 31-29 0 17-13 29-31 29Z" fill="#fff" opacity="0.78" />
						<path d="M59 106c0-15 11-25 27-25 0 15-12 25-27 25Z" fill="#fff" opacity="0.6" />
						<path d="M59 50c0-13-9-22-23-22 0 13 10 22 23 22Z" fill="#fff" opacity="0.85" />
						<path d="M59 46c0-12 8-20 21-20 0 12-9 20-21 20Z" fill="#fff" />
					</svg>
					<div
						style="font-family:var(--font-disp);font-weight:700;font-size:clamp(19px, 2vw, 25px);
						letter-spacing:-0.02em;line-height:1.15;max-width:260px;"
					>
						Tus ahorros crecen poco a poco.
					</div>
				</div>
				<div style="position:relative;">
					<div
						style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;"
					>
						<span
							style="font-family:var(--font-body);font-weight:700;font-size:12px;opacity:0.78;letter-spacing:0.03em;"
						>
							AHORRADO EN TOTAL
						</span>
						<span
							style="font-family:var(--font-body);font-weight:700;font-size:12.5px;opacity:0.85;"
						>
							{aggPct}% de tus metas
						</span>
					</div>
					<div
						style="font-family:var(--font-disp);font-weight:700;font-size:clamp(26px, 3vw, 34px);letter-spacing:-0.03em;line-height:1;white-space:nowrap;"
					>
						{fmtMoney(total, appState.cur)}
					</div>
					<div
						style="height:6px;border-radius:6px;background:rgba(255,255,255,0.24);overflow:hidden;margin:14px 0 18px;"
					>
						<div
							style={`height:100%;width:${aggPct}%;background:#fff;border-radius:6px;`}
						></div>
					</div>
					<div style="display:flex;gap:26px;">
						{#each [['Metas', GOALS.length], ['Cumplidas', doneCount], ['Racha', `${USER.streak}d`]] as [l, v]}
							<div>
								<div
									style="font-family:var(--font-disp);font-weight:700;font-size:20px;"
								>
									{v}
								</div>
								<div
									style="font-family:var(--font-body);font-weight:600;font-size:12px;opacity:0.78;margin-top:2px;"
								>
									{l}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if archivoFoto}
	<RecorteFoto archivo={archivoFoto} onCancelar={cancelarRecorte} onListo={fotoRecortada} />
{/if}

<style>
	.avatar-btn {
		display: block;
	}
	.cam-badge {
		background: var(--color-accent);
		transition:
			transform 0.18s ease,
			box-shadow 0.18s ease,
			background 0.18s ease;
	}
	.avatar-btn:hover:not(:disabled) .cam-badge {
		transform: scale(1.12);
		box-shadow: 0 2px 12px rgba(52, 224, 126, 0.5);
	}
	.avatar-btn:hover:not(:disabled) .avatar-foto {
		filter: brightness(0.78);
	}
	.nombre-edit {
		background: transparent;
		border: 1.5px solid transparent;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}
	.nombre-edit:hover {
		background: var(--color-surface-2);
	}
	.nombre-edit:focus {
		background: var(--color-surface-2);
		border-color: var(--color-border-strong);
	}
	.quitar-foto {
		transition: color 0.15s ease;
	}
	.quitar-foto:hover {
		color: #e5786f;
	}
</style>
