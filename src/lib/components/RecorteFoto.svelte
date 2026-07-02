<!--
	Recortador de avatar para Sprout (tema oscuro):
	 - Visor circular.
	 - Zoom con la rueda del mouse (desktop) o pellizco (táctil), sin slider.
	 - Arrastrar para encuadrar.
	 - Guías (tercios + cruz) visibles solo mientras se interactúa.
	 Devuelve un data URL JPEG cuadrado (256px) listo para guardar.
-->
<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from './Icon.svelte';

	let {
		archivo,
		onCancelar,
		onListo
	}: {
		archivo: File;
		onCancelar: () => void;
		onListo: (dataUrl: string) => void;
	} = $props();

	const C = 300; // diámetro del visor (px)
	const OUT = 256; // imagen exportada (px × px)

	let url = $state('');
	let W = $state(0);
	let H = $state(0);
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let procesando = $state(false);
	let imgEl: HTMLImageElement | null = null; // imagen ya cargada (para exportar sin await)

	const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

	$effect(() => {
		const u = URL.createObjectURL(archivo);
		url = u;
		zoom = 1;
		panX = 0;
		panY = 0;
		imgEl = null;
		const img = new Image();
		img.onload = () => {
			W = img.naturalWidth;
			H = img.naturalHeight;
			imgEl = img;
		};
		img.src = u;
		return () => URL.revokeObjectURL(u);
	});

	const coverScale = $derived(W && H ? Math.max(C / W, C / H) : 1);
	const drawScale = $derived(coverScale * zoom);
	const dispW = $derived(W * drawScale);
	const dispH = $derived(H * drawScale);
	const halfX = $derived((C - dispW) / 2);
	const halfY = $derived((C - dispH) / 2);
	const panXc = $derived(clamp(panX, halfX, -halfX));
	const panYc = $derived(clamp(panY, halfY, -halfY));
	const imgLeft = $derived(halfX + panXc);
	const imgTop = $derived(halfY + panYc);

	// === Interacción: drag + pinch + wheel ===
	type Punto = { id: number; x: number; y: number };
	let punteros = $state<Punto[]>([]);
	let lastX = 0;
	let lastY = 0;
	let pinchDist = 0;
	let pinchZoom = 1;

	let guiaVisible = $state(false);
	let timerGuia: ReturnType<typeof setTimeout> | null = null;
	function tocarGuia() {
		guiaVisible = true;
		if (timerGuia) clearTimeout(timerGuia);
		timerGuia = setTimeout(() => (guiaVisible = false), 700);
	}

	function dist(a: Punto, b: Punto) {
		return Math.hypot(a.x - b.x, a.y - b.y);
	}

	function onDown(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		punteros = [...punteros, { id: e.pointerId, x: e.clientX, y: e.clientY }];
		if (punteros.length === 1) {
			lastX = e.clientX;
			lastY = e.clientY;
		} else if (punteros.length === 2) {
			pinchDist = dist(punteros[0], punteros[1]);
			pinchZoom = zoom;
		}
		tocarGuia();
	}
	function onMove(e: PointerEvent) {
		const idx = punteros.findIndex((p) => p.id === e.pointerId);
		if (idx === -1) return;
		punteros[idx] = { id: e.pointerId, x: e.clientX, y: e.clientY };
		punteros = [...punteros];
		if (punteros.length === 1) {
			panX = clamp(panX + (e.clientX - lastX), halfX, -halfX);
			panY = clamp(panY + (e.clientY - lastY), halfY, -halfY);
			lastX = e.clientX;
			lastY = e.clientY;
		} else if (punteros.length === 2) {
			const d = dist(punteros[0], punteros[1]);
			if (pinchDist > 0) zoom = clamp(pinchZoom * (d / pinchDist), 1, 3);
		}
		tocarGuia();
	}
	function onUp(e: PointerEvent) {
		punteros = punteros.filter((p) => p.id !== e.pointerId);
		if (punteros.length === 1) {
			lastX = punteros[0].x;
			lastY = punteros[0].y;
		}
		tocarGuia();
	}
	function onWheel(e: WheelEvent) {
		e.preventDefault();
		const factor = e.deltaY > 0 ? 0.94 : 1.06;
		zoom = clamp(zoom * factor, 1, 3);
		tocarGuia();
	}

	function centrar() {
		zoom = 1;
		panX = 0;
		panY = 0;
		tocarGuia();
	}

	// Síncrono a propósito: usa la imagen ya cargada y llama onListo sin ningún
	// await previo, para que el cierre del modal en el padre reaccione bien.
	function guardar() {
		if (!imgEl || procesando) return;
		procesando = true;
		const canvas = document.createElement('canvas');
		canvas.width = OUT;
		canvas.height = OUT;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			procesando = false;
			return;
		}
		ctx.fillStyle = '#16181a';
		ctx.fillRect(0, 0, OUT, OUT);
		const s = OUT / C;
		ctx.drawImage(imgEl, imgLeft * s, imgTop * s, dispW * s, dispH * s);
		onListo(canvas.toDataURL('image/jpeg', 0.88));
	}

	function onTecla(e: KeyboardEvent) {
		if (e.key === 'Escape' && !procesando) onCancelar();
	}
</script>

<svelte:window onkeydown={onTecla} />

<div
	class="recorte-overlay"
	role="dialog"
	aria-modal="true"
	aria-label="Ajustar foto de perfil"
	in:fade={{ duration: 200 }}
>
	<div class="recorte-card" in:scale={{ start: 0.94, duration: 280, easing: cubicOut }}>
		<!-- Header -->
		<header
			style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
			padding:18px 22px;border-bottom:1px solid var(--color-border);"
		>
			<div style="min-width:0;">
				<h2
					style="font-family:var(--font-disp);font-weight:600;font-size:18px;color:var(--color-ink);margin:0;"
				>
					Ajusta tu foto
				</h2>
				<p
					style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);margin:3px 0 0;"
				>
					Arrastra para encuadrar · rueda o pellizca para acercar
				</p>
			</div>
			<button
				type="button"
				onclick={onCancelar}
				disabled={procesando}
				class="recorte-x"
				aria-label="Cerrar"
			>
				<Icon name="x" size={18} />
			</button>
		</header>

		<!-- Visor circular -->
		<div
			style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px;background:var(--color-surface-sink);"
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="recorte-visor"
				style={`width:${C}px;height:${C}px;max-width:100%;cursor:${punteros.length > 0 ? 'grabbing' : 'grab'};`}
				onpointerdown={onDown}
				onpointermove={onMove}
				onpointerup={onUp}
				onpointercancel={onUp}
				onwheel={onWheel}
			>
				{#if url}
					<img
						src={url}
						alt=""
						draggable="false"
						style={`position:absolute;max-width:none;user-select:none;pointer-events:none;` +
							`width:${dispW}px;height:${dispH}px;left:${imgLeft}px;top:${imgTop}px;`}
					/>
				{/if}

				<!-- Guías: tercios + cruz -->
				<div
					style={`position:absolute;inset:0;pointer-events:none;transition:opacity .3s;opacity:${guiaVisible ? 1 : 0};`}
				>
					<div style="position:absolute;top:0;bottom:0;left:33.33%;width:1px;background:rgba(255,255,255,0.4);"></div>
					<div style="position:absolute;top:0;bottom:0;left:66.66%;width:1px;background:rgba(255,255,255,0.4);"></div>
					<div style="position:absolute;left:0;right:0;top:33.33%;height:1px;background:rgba(255,255,255,0.4);"></div>
					<div style="position:absolute;left:0;right:0;top:66.66%;height:1px;background:rgba(255,255,255,0.4);"></div>
				</div>
				<!-- Anillo interior -->
				<div
					style="position:absolute;inset:0;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.14);pointer-events:none;"
				></div>
			</div>

			<button type="button" onclick={centrar} disabled={zoom === 1 && panX === 0 && panY === 0} class="recorte-centrar">
				<Icon name="target" size={14} />
				Centrar
			</button>
		</div>

		<!-- Acciones -->
		<footer
			style="display:flex;gap:10px;padding:16px 22px;border-top:1px solid var(--color-border);"
		>
			<button type="button" onclick={onCancelar} disabled={procesando} class="recorte-cancelar">
				Cancelar
			</button>
			<button type="button" onclick={guardar} disabled={procesando || !W} class="recorte-usar">
				{#if procesando}
					<span class="recorte-spin"></span>
					Guardando…
				{:else}
					<Icon name="check" size={16} stroke={3} />
					Usar foto
				{/if}
			</button>
		</footer>
	</div>
</div>

<style>
	.recorte-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: grid;
		place-items: center;
		background: rgba(0, 0, 0, 0.62);
		padding: 16px;
	}
	.recorte-card {
		width: 100%;
		max-width: 400px;
		background: var(--color-surface);
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
	}
	.recorte-visor {
		position: relative;
		overflow: hidden;
		border-radius: 999px;
		background: #0b0c0d;
		touch-action: none;
		user-select: none;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
		aspect-ratio: 1;
	}
	.recorte-x {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		border: none;
		border-radius: 11px;
		background: transparent;
		color: var(--color-muted);
		cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.recorte-x:hover {
		background: var(--color-surface-2);
		color: var(--color-ink);
	}
	.recorte-centrar {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: none;
		background: transparent;
		border-radius: 999px;
		padding: 7px 14px;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 12.5px;
		color: var(--color-muted);
		cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.recorte-centrar:hover:not(:disabled) {
		background: var(--color-accent-soft);
		color: var(--color-accent-deep);
	}
	.recorte-centrar:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.recorte-cancelar {
		flex: 1;
		height: 46px;
		border: 1px solid var(--color-border-strong);
		border-radius: 999px;
		background: transparent;
		font-family: var(--font-disp);
		font-weight: 600;
		font-size: 15px;
		color: var(--color-ink);
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.recorte-cancelar:hover:not(:disabled) {
		background: var(--color-surface-2);
	}
	.recorte-usar {
		flex: 1.4;
		height: 46px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: none;
		border-radius: 999px;
		background: var(--color-accent);
		color: #062a12;
		font-family: var(--font-disp);
		font-weight: 700;
		font-size: 15px;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}
	.recorte-usar:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.recorte-spin {
		width: 16px;
		height: 16px;
		border-radius: 999px;
		border: 2px solid rgba(6, 42, 18, 0.35);
		border-top-color: #062a12;
		animation: spin 0.7s linear infinite;
	}
</style>
