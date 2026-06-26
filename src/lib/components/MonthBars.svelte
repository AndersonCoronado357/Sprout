<script lang="ts">
	import { fmtCompact, type CurrencyCode } from '$lib/format';

	type Datum = { label: string; value: number };
	type Props = { data: Datum[]; cur?: CurrencyCode };
	let { data, cur = 'COP' }: Props = $props();
	let max = $derived(Math.max(1, ...data.map((d) => d.value)));
</script>

<div
	style="display:flex;align-items:flex-end;gap:10px;height:100%;min-height:150px;padding-top:22px;"
>
	{#each data as d, i}
		{@const top = d.value === max && d.value > 0}
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end;"
		>
			<div
				style={`font-family:var(--font-body);font-weight:800;font-size:11px;color:var(--color-accent-deep);opacity:${top ? 1 : 0};`}
			>
				{fmtCompact(d.value, cur)}
			</div>
			<div
				style={`width:100%;max-width:44px;height:${Math.max(3, (d.value / max) * 100)}%;border-radius:9px;` +
					`background:${top ? 'var(--color-accent)' : 'var(--color-track)'};`}
			></div>
			<div
				style="font-family:var(--font-body);font-weight:700;font-size:11.5px;color:var(--color-muted);"
			>
				{d.label}
			</div>
		</div>
	{/each}
</div>
