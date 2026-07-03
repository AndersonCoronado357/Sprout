<script lang="ts">
	// Calendario custom portado 1:1 desde sprout-ui.jsx
	import Icon from './Icon.svelte';
	import { parseD, TODAY, MES, MES_LARGO } from '$lib/format';
	type Props = {
		value: string;
		onChange?: (v: string) => void;
		big?: boolean;
		compact?: boolean;
		placeholder?: string;
		up?: boolean;
	};
	let {
		value = $bindable(''),
		onChange,
		big = false,
		compact = false,
		placeholder = 'Elegir fecha',
		up = false
	}: Props = $props();

	let open = $state(false);
	let cont: HTMLDivElement;
	let calPos = $state({ top: 0, left: 0, width: 300 }); // posición fija calculada
	const CAL_HEIGHT = 360;

	function abrirCerrar() {
		if (open) {
			open = false;
			return;
		}
		// position: fixed para escapar overflow:hidden de padres. El calendario
		// toma el MISMO ancho que el input y se ancla a su izquierda: lo que crece
		// es el alto, no se desplaza horizontalmente.
		if (cont && typeof window !== 'undefined') {
			const rect = cont.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			const spaceAbove = rect.top;
			// Si está forzado up, o no cabe abajo pero sí arriba → arriba
			const goUp = up || (spaceBelow < CAL_HEIGHT && spaceAbove > spaceBelow);
			const top = goUp ? rect.top - CAL_HEIGHT - 8 : rect.bottom + 8;
			calPos = { top: Math.max(12, top), left: rect.left, width: rect.width };
		}
		open = true;
	}

	const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
	let sel = $derived(value ? parseD(value) : null);
	let view = $state({ y: TODAY.getFullYear(), m: TODAY.getMonth() });

	$effect(() => {
		if (sel) view = { y: sel.getFullYear(), m: sel.getMonth() };
	});

	function shift(n: number) {
		let nm = view.m + n,
			ny = view.y;
		if (nm < 0) {
			nm = 11;
			ny--;
		}
		if (nm > 11) {
			nm = 0;
			ny++;
		}
		view = { y: ny, m: nm };
	}

	let cells = $derived.by(() => {
		const { y, m } = view;
		const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
		const ndays = new Date(y, m + 1, 0).getDate();
		return [
			...Array(firstDow).fill(null),
			...Array.from({ length: ndays }, (_, i) => i + 1)
		] as (number | null)[];
	});

	function iso(d: number) {
		return `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
	}

	function isSel(d: number) {
		return sel && sel.getFullYear() === view.y && sel.getMonth() === view.m && sel.getDate() === d;
	}
	function isToday(d: number) {
		return (
			TODAY.getFullYear() === view.y && TODAY.getMonth() === view.m && TODAY.getDate() === d
		);
	}

	function pickDay(d: number) {
		const v = iso(d);
		value = v;
		if (onChange) onChange(v);
		open = false;
	}

	function onDocClick(e: MouseEvent) {
		if (open && cont && !cont.contains(e.target as Node)) open = false;
	}
	function onKey(e: KeyboardEvent) {
		if (open && e.key === 'Escape') open = false;
	}
	$effect(() => {
		if (!open) return;
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	});

	let label = $derived(
		sel ? `${sel.getDate()} ${MES[sel.getMonth()]} ${sel.getFullYear()}` : placeholder
	);
</script>

<div bind:this={cont} style="position:relative;">
	<button
		type="button"
		onclick={abrirCerrar}
		style={`width:100%;font-family:var(--font-body);font-weight:700;font-size:${big ? 18 : compact ? 14 : 15.5}px;color:${sel ? 'var(--color-ink)' : 'var(--color-faint)'};` +
			`background:${open ? 'var(--color-surface)' : 'var(--color-surface-2)'};` +
			`border:1.5px solid transparent;` +
			`border-radius:${compact ? 12 : 14}px;padding:${compact ? '9px 14px' : '14px 16px'};outline:none;cursor:pointer;` +
			`display:flex;align-items:center;justify-content:space-between;transition:border-color .16s,background .16s;min-height:${compact ? 40 : 'auto'};`}
	>
		<span style="display:inline-flex;align-items:center;gap:10px;">
			<Icon
				name="calendar"
				size={18}
				color={open ? 'var(--color-accent)' : 'var(--color-faint)'}
			/>
			{label}
		</span>
		<span
			style={`color:var(--color-faint);transform:${open ? 'rotate(180deg)' : 'none'};transition:transform .2s ease;`}
		>
			<Icon name="chevD" size={18} />
		</span>
	</button>

	{#if open}
		<div
			style={`position:fixed;top:${calPos.top}px;left:${calPos.left}px;z-index:9999;` +
				`width:${calPos.width}px;max-width:92vw;background:var(--color-surface);border-radius:18px;padding:14px;` +
				`box-shadow:0 16px 40px -8px rgba(0,0,0,0.5), 0 0 0 1px var(--color-border);`}
		>
			<div
				style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"
			>
				<button
					type="button"
					onclick={() => shift(-1)}
					style="width:34px;height:34px;border-radius:10px;border:none;cursor:pointer;
					background:var(--color-surface-2);color:var(--color-ink);display:grid;place-items:center;"
					aria-label="Mes anterior"
				>
					<Icon name="chevL" size={18} />
				</button>
				<span
					style="font-family:var(--font-disp);font-weight:700;font-size:16px;color:var(--color-ink);text-transform:capitalize;"
				>
					{MES_LARGO[view.m]}
					{view.y}
				</span>
				<button
					type="button"
					onclick={() => shift(1)}
					style="width:34px;height:34px;border-radius:10px;border:none;cursor:pointer;
					background:var(--color-surface-2);color:var(--color-ink);display:grid;place-items:center;"
					aria-label="Mes siguiente"
				>
					<Icon name="chevR" size={18} />
				</button>
			</div>
			<div
				style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px;"
			>
				{#each DOW as d, i}
					<span
						style="text-align:center;font-family:var(--font-body);font-weight:700;font-size:11px;color:var(--color-faint);padding:4px 0;"
					>
						{d}
					</span>
				{/each}
			</div>
			<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">
				{#each cells as d, i}
					{#if d == null}
						<span></span>
					{:else}
						{@const selected = isSel(d)}
						<button
							type="button"
							onclick={() => pickDay(d)}
							style={`aspect-ratio:1;display:grid;place-items:center;border-radius:10px;border:none;cursor:pointer;position:relative;` +
								`font-family:var(--font-body);font-weight:${selected ? 800 : 600};font-size:14px;` +
								`background:${selected ? 'var(--color-accent)' : 'transparent'};color:${selected ? '#062a12' : 'var(--color-ink)'};`}
							onmouseenter={(e) => {
								if (!selected)
									(e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
							}}
							onmouseleave={(e) => {
								if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent';
							}}
						>
							{d}
							{#if isToday(d) && !selected}
								<span
									style="position:absolute;bottom:5px;width:4px;height:4px;border-radius:9px;background:var(--color-accent);"
								></span>
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
