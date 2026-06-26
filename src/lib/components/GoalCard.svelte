<script lang="ts">
	// Portado 1:1 desde sprout-visuals.jsx
	import BigBar from './BigBar.svelte';
	import GoalGlyph from './GoalGlyph.svelte';
	import Icon from './Icon.svelte';
	import { fmtMoney, fmtDateShort, goalSaved, goalPct, goalDone, suggestion, type CurrencyCode } from '$lib/format';
	import { CATS, type Goal } from '$lib/data/mock';

	type Props = { goal: Goal; cur?: CurrencyCode; onOpen?: () => void; href?: string };
	let { goal, cur = 'COP', onOpen, href }: Props = $props();

	let saved = $derived(goalSaved(goal));
	let pct = $derived(goalPct(goal));
	let s = $derived(suggestion(goal, saved));
	let done = $derived(goalDone(goal));
	let cerrada = $derived(done && pct < 100); // cerrada sin llegar al objetivo
	let hue = $derived(CATS[goal.cat]?.hue);
	let estado = $derived(goal.status ?? 'active');
	let pausada = $derived(estado === 'paused');
	let cancelada = $derived(estado === 'cancelled');
	let archivada = $derived(pausada || cancelada);

	function go() {
		if (onOpen) onOpen();
		else if (href) window.location.assign(href);
	}
</script>

<button
	onclick={go}
	style={`text-align:left;cursor:pointer;border:none;background:var(--color-surface);` +
		`border-radius:18px;padding:18px 18px 20px;width:100%;transition:background .2s ease, opacity .2s ease;` +
		`display:flex;flex-direction:column;gap:15px;opacity:${archivada ? 0.62 : 1};`}
	onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
	onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface)')}
>
	<div style="display:flex;align-items:center;gap:13px;">
		<GoalGlyph {goal} size={42} />
		<div style="flex:1;min-width:0;">
			<div
				style="font-family:var(--font-disp);font-weight:600;font-size:16.5px;color:var(--color-ink);
				white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
			>
				{goal.name}
			</div>
			<div
				style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);margin-top:2px;"
			>
				{CATS[goal.cat]?.label} · {done ? (cerrada ? 'cerrada' : 'cumplida') : fmtDateShort(goal.date)}
			</div>
		</div>
		{#if archivada}
			<span
				style={`flex-shrink:0;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;` +
					`font-family:var(--font-body);font-weight:700;font-size:11.5px;` +
					`color:${pausada ? '#C9961A' : '#D8584E'};background:color-mix(in oklab, ${pausada ? '#C9961A' : '#D8584E'} 15%, transparent);`}
			>
				<Icon name={pausada ? 'pause' : 'x'} size={12} stroke={2.6} />
				{pausada ? 'Pausada' : 'Cancelada'}
			</span>
		{:else if cerrada}
			<span
				style="flex-shrink:0;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;
				font-family:var(--font-body);font-weight:700;font-size:11.5px;color:var(--color-muted);
				background:var(--color-surface-2);"
			>
				<Icon name="check" size={12} stroke={2.6} />
				Cerrada
			</span>
		{:else if done}
			<span
				style="width:24px;height:24px;border-radius:99px;background:var(--color-accent-soft);
				color:var(--color-accent-deep);display:grid;place-items:center;flex-shrink:0;"
			>
				<Icon name="check" size={14} stroke={3} />
			</span>
		{/if}
	</div>

	<div>
		<div
			style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;"
		>
			<div
				style="font-family:var(--font-disp);font-weight:700;font-size:22px;color:var(--color-ink);
				letter-spacing:-0.02em;white-space:nowrap;"
			>
				{fmtMoney(saved, cur)}
				<span
					style="font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-faint);"
				>
					/ {fmtMoney(goal.target, cur)}
				</span>
			</div>
			<div
				style="font-family:var(--font-disp);font-weight:700;font-size:15px;
				color:{done ? 'var(--color-accent-deep)' : 'var(--color-muted)'};"
			>
				{Math.round(pct)}%
			</div>
		</div>

		<BigBar {pct} />

		<div
			style="margin-top:11px;font-family:var(--font-body);font-size:12.5px;font-weight:600;color:var(--color-muted);"
		>
			{#if cerrada}
				<span style="font-weight:700;">Cerrada · guardaste {fmtMoney(saved, cur)}</span>
			{:else if done}
				<span style="color:var(--color-accent-deep);font-weight:700;">Meta completada</span>
			{:else}
				<span>
					Te falta
					<strong style="color:var(--color-ink);font-weight:700;">
						{fmtMoney(s.remaining, cur)}
					</strong>
					· {fmtMoney(s.perWeek, cur)}/sem
				</span>
			{/if}
		</div>
	</div>
</button>
