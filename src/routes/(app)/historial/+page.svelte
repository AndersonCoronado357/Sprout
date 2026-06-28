<script lang="ts">
	// HistoryScreen portado 1:1 desde sprout-screens3.jsx
	import { goto } from '$app/navigation';
	import TopBar from '$lib/components/TopBar.svelte';
	import Card from '$lib/components/Card.svelte';
	import ListRow from '$lib/components/ListRow.svelte';
	import { CATS, type Goal } from '$lib/data/mock';
	import { appState } from '$lib/state.svelte';
	import { fmtMoney, fmtDateShort, MES_LARGO } from '$lib/format';

	let cur = $derived(appState.cur);
	let GOALS = $derived(appState.goals);

	type Row = { id: string; amount: number; date: string; note?: string; goal: Goal };
	let all = $derived.by(() => {
		const out: Row[] = [];
		GOALS.forEach((g) => g.contribs.forEach((c) => out.push({ ...c, goal: g })));
		out.sort((a, b) => b.date.localeCompare(a.date));
		return out;
	});

	let groups = $derived.by(() => {
		const m: Record<string, Row[]> = {};
		all.forEach((c) => {
			const k = c.date.slice(0, 7);
			(m[k] = m[k] || []).push(c);
		});
		return m;
	});
	let keys = $derived(Object.keys(groups).sort((a, b) => b.localeCompare(a)));
	function monthName(k: string) {
		const [y, m] = k.split('-');
		return `${MES_LARGO[+m - 1]} ${y}`;
	}
</script>

<svelte:head>
	<title>Historial — Sprout</title>
</svelte:head>

<div style="width:100%;flex:1;min-height:0;display:flex;flex-direction:column;">
	<TopBar big title="Historial" sub="Cada aporte que has registrado." />
	<div style="display:flex;flex-direction:column;gap:22px;width:100%;">
		{#each keys as k, ki (k)}
			{@const total = groups[k].reduce((s, c) => s + c.amount, 0)}
			<div class="enter-cascade" style="animation-delay:{60 + ki * 90}ms;">
				<div
					style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;padding:0 4px;"
				>
					<span
						style="font-family:var(--font-disp);font-weight:600;font-size:17px;color:var(--color-ink);text-transform:capitalize;white-space:nowrap;"
					>
						{monthName(k)}
					</span>
					<span
						style="font-family:var(--font-disp);font-weight:700;font-size:16px;color:var(--color-accent-deep);"
					>
						+{fmtMoney(total, cur)}
					</span>
				</div>
				<Card pad="2px 20px">
					{#each groups[k] as c, i (c.id)}
						<ListRow
							icon={c.goal.icon}
							iconHue={CATS[c.goal.cat].hue}
							title={c.goal.name}
							sub={c.note || `${fmtDateShort(c.date)} · ${CATS[c.goal.cat].label}`}
							right={`+${fmtMoney(c.amount, cur)}`}
							rightSub={fmtDateShort(c.date)}
							last={i === groups[k].length - 1}
							onclick={() => goto(`/meta/${c.goal.id}`)}
						/>
					{/each}
				</Card>
			</div>
		{/each}
	</div>
</div>
