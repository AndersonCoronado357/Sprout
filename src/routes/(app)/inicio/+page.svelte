<script lang="ts">
	// HomeScreen portado 1:1 desde sprout-screens1.jsx
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Chip from '$lib/components/Chip.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import GoalCard from '$lib/components/GoalCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { CATS, type GoalCategory } from '$lib/data/mock';
	import { appState } from '$lib/state.svelte';
	import { fmtMoney, goalSaved, goalPct, goalDone } from '$lib/format';

	type Filter = 'activas' | 'todas' | 'completas' | 'pausadas' | 'canceladas' | GoalCategory;
	let filter = $state<Filter>('activas');

	const st = (g: { status?: string }) => g.status ?? 'active';

	let mob = $state(false);
	function calcMob() {
		mob = typeof window !== 'undefined' && window.innerWidth < 860;
	}
	onMount(() => {
		calcMob();
		window.addEventListener('resize', calcMob);
		return () => window.removeEventListener('resize', calcMob);
	});

	let cur = $derived(appState.cur);
	let USER = $derived(appState.user);
	let goals = $derived(appState.goals);

	// "Activas" = en progreso y no pausadas/canceladas. Los totales solo cuentan estas.
	let active = $derived(goals.filter((g) => !goalDone(g) && st(g) === 'active'));
	let totalSaved = $derived(active.reduce((s, g) => s + goalSaved(g), 0));
	let totalTarget = $derived(active.reduce((s, g) => s + g.target, 0));
	let aggPct = $derived(totalTarget ? (totalSaved / totalTarget) * 100 : 0);

	let hayPausadas = $derived(goals.some((g) => st(g) === 'paused'));
	let hayCanceladas = $derived(goals.some((g) => st(g) === 'cancelled'));

	let list = $derived.by(() => {
		if (filter === 'activas') return active;
		if (filter === 'completas')
			return goals.filter((g) => goalDone(g) && st(g) !== 'cancelled');
		if (filter === 'pausadas') return goals.filter((g) => st(g) === 'paused');
		if (filter === 'canceladas') return goals.filter((g) => st(g) === 'cancelled');
		if (filter === 'todas') return goals;
		return goals.filter((g) => g.cat === filter && st(g) === 'active');
	});

	let cats = $derived([...new Set(active.map((g) => g.cat))]);
</script>

<svelte:head>
	<title>Sprout — Inicio</title>
</svelte:head>

<div
	style="display:flex;flex-direction:column;gap:20px;flex:1;min-height:0;width:100%;"
>
	<TopBar
		big
		title={`Hola, ${USER.name.split(' ')[0]}`}
		sub="Esto es lo que estás haciendo crecer hoy."
	>
		{#snippet right()}
			{#if !mob}
				<Btn icon="plus" onclick={() => goto('/meta/nueva')}>Nueva meta</Btn>
			{/if}
		{/snippet}
	</TopBar>

	<!-- HERO -->
	<div
		class="enter-rise"
		style={`border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border);padding:${mob ? '20px 0' : '22px 0'};` +
			`display:flex;flex-direction:${mob ? 'column' : 'row'};flex-wrap:wrap;` +
			`gap:${mob ? 18 : 40}px;row-gap:18px;align-items:${mob ? 'flex-start' : 'center'};justify-content:space-between;`}
	>
		<div>
			<div
				style="font-family:var(--font-body);font-weight:700;font-size:12.5px;color:var(--color-muted);
				letter-spacing:0.04em;text-transform:uppercase;"
			>
				Ahorro total activo
			</div>
			<div style="display:flex;align-items:baseline;gap:10px;margin-top:6px;">
				<span
					style={`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 32 : 36}px;color:var(--color-ink);` +
						`letter-spacing:-0.03em;line-height:1;white-space:nowrap;`}
				>
					{fmtMoney(totalSaved, cur)}
				</span>
				<span
					style="font-family:var(--font-body);font-weight:600;font-size:13.5px;color:var(--color-faint);white-space:nowrap;"
				>
					de {fmtMoney(totalTarget, cur)}
				</span>
			</div>
			<div
				style="font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);
				margin-top:7px;display:flex;align-items:center;gap:12px;"
			>
				<span>{active.length} metas activas</span>
				<span
					style="display:inline-flex;align-items:center;gap:5px;color:var(--color-accent-deep);"
				>
					<Icon name="flame" size={14} />
					{USER.streak} días seguidos
				</span>
			</div>
		</div>
		<div style={`width:${mob ? '100%' : '360px'};`}>
			<div
				style="height:6px;border-radius:6px;background:var(--color-track);overflow:hidden;"
			>
				<div
					style={`height:100%;width:${aggPct}%;background:var(--color-accent);border-radius:6px;` +
						`transition:width 1s cubic-bezier(.16,1,.3,1);`}
				></div>
			</div>
			<div
				style="display:flex;justify-content:space-between;margin-top:9px;
				font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);"
			>
				<span>
					<strong style="color:var(--color-ink);font-weight:700;">
						{Math.round(aggPct)}%
					</strong>
					del total
				</span>
				<span>Te falta {fmtMoney(totalTarget - totalSaved, cur)}</span>
			</div>
		</div>
	</div>

	<!-- Filtros -->
	<div
		class="enter-rise"
		style="display:flex;gap:9px;overflow-x:auto;padding-bottom:2px;margin:0 -2px;animation-delay:90ms;"
	>
		<Chip active={filter === 'activas'} onclick={() => (filter = 'activas')} icon="sprout">
			Activas
		</Chip>
		<Chip active={filter === 'todas'} onclick={() => (filter = 'todas')}>Todas</Chip>
		<Chip active={filter === 'completas'} onclick={() => (filter = 'completas')} icon="check">
			Completadas
		</Chip>
		{#if hayPausadas}
			<Chip active={filter === 'pausadas'} onclick={() => (filter = 'pausadas')} icon="pause">
				Pausadas
			</Chip>
		{/if}
		{#if hayCanceladas}
			<Chip active={filter === 'canceladas'} onclick={() => (filter = 'canceladas')} icon="x">
				Canceladas
			</Chip>
		{/if}
		{#each cats as c (c)}
			<Chip active={filter === c} onclick={() => (filter = c)} hue={CATS[c].hue}>
				{CATS[c].label}
			</Chip>
		{/each}
	</div>

	<!-- GRID DE METAS -->
	{#if list.length === 0}
		<div style="text-align:center;padding:50px 20px;color:var(--color-muted);">
			<Logo size={52} />
			<p style="font-family:var(--font-body);font-weight:600;margin-top:12px;">
				Aún no hay metas aquí.
			</p>
			<div style="margin-top:8px;display:inline-block;">
				<Btn icon="plus" onclick={() => goto('/meta/nueva')}>Crear meta</Btn>
			</div>
		</div>
	{:else}
		<div
			style={`display:grid;gap:16px;align-content:start;` +
				`grid-template-columns:${mob ? '1fr' : 'repeat(auto-fill, minmax(330px, 1fr))'};`}
		>
			{#each list as g, i (g.id)}
				<div class="enter-rise" style="animation-delay:{160 + i * 50}ms;">
					<GoalCard goal={g} {cur} onOpen={() => goto(`/meta/${g.id}`)} />
				</div>
			{/each}
		</div>
	{/if}
</div>
