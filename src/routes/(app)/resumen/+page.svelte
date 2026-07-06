<script lang="ts">
	// SummaryScreen portado 1:1 desde sprout-screens3.jsx
	import { onMount } from 'svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import Card from '$lib/components/Card.svelte';
	import MonthBars from '$lib/components/MonthBars.svelte';
	import SegSwitch from '$lib/components/SegSwitch.svelte';
	import { CATS } from '$lib/data/mock';
	import { appState } from '$lib/state.svelte';
	import { fmtMoney, fmtCompact, goalSaved, goalPct, MES } from '$lib/format';

	let cur = $derived(appState.cur);
	let USER = $derived(appState.user);
	let GOALS = $derived(appState.goals);

	let mob = $state(false);
	// En móvil se muestra una vista a la vez (Meses / Categoría) para que quepa sin scroll.
	let vista = $state<'meses' | 'cat'>('meses');
	function calcMob() {
		mob = typeof window !== 'undefined' && window.innerWidth < 860;
	}
	onMount(() => {
		calcMob();
		window.addEventListener('resize', calcMob);
		return () => window.removeEventListener('resize', calcMob);
	});

	let allSaved = $derived(GOALS.reduce((s, g) => s + goalSaved(g), 0));
	let activeGoals = $derived(GOALS.filter((g) => goalPct(g) < 100));
	let completed = $derived(GOALS.filter((g) => goalPct(g) >= 100));

	let months = $derived.by(() => {
		const out: { key: string; label: string; value: number }[] = [];
		const base = new Date('2026-06-01T12:00:00');
		for (let i = 5; i >= 0; i--) {
			const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
			out.push({
				key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
				label: MES[d.getMonth()],
				value: 0
			});
		}
		GOALS.forEach((g) =>
			g.contribs.forEach((c) => {
				const k = c.date.slice(0, 7);
				const m = out.find((x) => x.key === k);
				if (m) m.value += c.amount;
			})
		);
		return out;
	});

	let byCat = $derived.by(() => {
		const m: Record<string, number> = {};
		GOALS.forEach((g) => {
			m[g.cat] = (m[g.cat] || 0) + goalSaved(g);
		});
		return m;
	});
	let catRows = $derived(Object.entries(byCat).sort((a, b) => b[1] - a[1]));
	let catMax = $derived(Math.max(1, ...catRows.map((r) => r[1])));
	let thisMonth = $derived(months[months.length - 1].value);
</script>

<svelte:head>
	<title>Resumen — Sprout</title>
</svelte:head>

<div
	style={`display:flex;flex-direction:column;gap:${mob ? 14 : 22}px;flex:1;min-height:0;width:100%;`}
>
	<TopBar big title="Tu resumen" sub="Todo lo que has hecho crecer, en un vistazo." />

	<div
		class="enter-slide-l"
		style={`border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border);padding:${mob ? 14 : 22}px 0;` +
			`display:flex;flex-direction:${mob ? 'column' : 'row'};flex-wrap:wrap;gap:${mob ? 10 : 40}px;row-gap:10px;` +
			`align-items:${mob ? 'flex-start' : 'center'};justify-content:space-between;flex-shrink:0;`}
	>
		<div>
			<div
				style="font-family:var(--font-body);font-weight:700;font-size:12.5px;color:var(--color-muted);
				letter-spacing:0.04em;text-transform:uppercase;"
			>
				Ahorrado en total
			</div>
			<div
				style={`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 34 : 42}px;letter-spacing:-0.03em;line-height:1;margin-top:6px;color:var(--color-ink);white-space:nowrap;`}
			>
				{fmtMoney(allSaved, cur)}
			</div>
			<div
				style="font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);margin-top:7px;"
			>
				entre {GOALS.length} metas · {completed.length} ya cumplidas
			</div>
		</div>
		<div
			style={`display:flex;gap:${mob ? 28 : 40}px;margin-top:${mob ? '6px' : 0};flex-shrink:0;`}
		>
			{#each [['Este mes', fmtCompact(thisMonth, cur)], ['Activas', activeGoals.length], ['Racha', `${USER.streak} días`]] as [l, v]}
				<div>
					<div
						style="font-family:var(--font-disp);font-weight:700;font-size:22px;color:var(--color-ink);white-space:nowrap;"
					>
						{v}
					</div>
					<div
						style="font-family:var(--font-body);font-weight:600;font-size:12px;color:var(--color-muted);margin-top:4px;white-space:nowrap;"
					>
						{l}
					</div>
				</div>
			{/each}
		</div>
	</div>

	{#if mob}
		<div class="enter-slide-r" style="animation-delay:100ms;">
			<SegSwitch
				full
				value={vista}
				onChange={(v) => (vista = v as 'meses' | 'cat')}
				options={[
					{ value: 'meses', label: 'Meses', icon: 'chart' },
					{ value: 'cat', label: 'Categoría', icon: 'filter' }
				]}
			/>
		</div>
	{/if}

	<div
		class="enter-slide-r"
		style={`display:grid;grid-template-columns:${mob ? '1fr' : '1.35fr 1fr'};gap:18px;align-items:stretch;flex:1;min-height:0;animation-delay:120ms;`}
	>
		{#if !mob || vista === 'meses'}
			<Card style="height:100%;min-height:0;display:flex;flex-direction:column;">
			<div
				style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-shrink:0;"
			>
				<span
					style="font-family:var(--font-disp);font-weight:600;font-size:18px;color:var(--color-ink);"
				>
					Aportes por mes
				</span>
				<span
					style="font-family:var(--font-body);font-weight:700;font-size:13px;color:var(--color-accent-deep);
					background:var(--color-accent-soft);padding:5px 11px;border-radius:99px;"
				>
					últimos 6 meses
				</span>
			</div>
			<div style={`flex:1;min-height:0;`}>
				<MonthBars data={months} {cur} />
			</div>
		</Card>
		{/if}

		{#if !mob || vista === 'cat'}
		<Card style="height:100%;min-height:0;display:flex;flex-direction:column;">
			<span
				style="font-family:var(--font-disp);font-weight:600;font-size:18px;color:var(--color-ink);flex-shrink:0;"
			>
				Por categoría
			</span>
			<div
				style="margin-top:16px;flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;justify-content:space-between;gap:14px;"
			>
				{#each catRows as [k, v]}
					<div>
						<div
							style="display:flex;justify-content:space-between;margin-bottom:7px;"
						>
							<span
								style="font-family:var(--font-body);font-weight:700;font-size:14px;color:var(--color-ink);
								display:inline-flex;align-items:center;gap:8px;"
							>
								<span
									style={`width:9px;height:9px;border-radius:9px;background:${CATS[k as keyof typeof CATS].hue};`}
								></span>
								{CATS[k as keyof typeof CATS].label}
							</span>
							<span
								style="font-family:var(--font-disp);font-weight:700;font-size:15px;color:var(--color-ink);white-space:nowrap;"
							>
								{fmtMoney(v, cur)}
							</span>
						</div>
						<div
							style="height:9px;border-radius:9px;background:var(--color-track);overflow:hidden;"
						>
							<div
								style={`height:100%;width:${(v / catMax) * 100}%;background:${CATS[k as keyof typeof CATS].hue};border-radius:9px;`}
							></div>
						</div>
					</div>
				{/each}
			</div>
		</Card>
		{/if}
	</div>
</div>
