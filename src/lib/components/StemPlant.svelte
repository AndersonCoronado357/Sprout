<script lang="ts">
	// Tallo + hojas que crecen. Portado 1:1 desde sprout-visuals.jsx (estado final estático).
	type Props = { pct: number; height?: number };
	let { pct, height = 200 }: Props = $props();

	let MAX = $derived(height - 54);
	let grow = $derived(Math.max(0, Math.min(1, (pct || 0) / 100)));
	let stemPx = $derived(MAX * grow);
	let done = $derived(pct >= 100);

	const leaves = [
		{ at: 16, side: -1, y: 0.24 },
		{ at: 36, side: 1, y: 0.4 },
		{ at: 56, side: -1, y: 0.58 },
		{ at: 78, side: 1, y: 0.74 }
	];
	let visibleLeaves = $derived(leaves.filter((l) => pct >= l.at));
</script>

<div style={`position:relative;width:130px;height:${height}px;margin:0 auto;`}>
	<!-- tierra -->
	<div
		style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:92px;height:40px;
		border-radius:50% 50% 14px 14px / 60% 60% 14px 14px;background:var(--color-surface-sink);border:1px solid var(--color-border);"
	></div>
	{#each Array(5) as _, i}
		<span
			style={`position:absolute;bottom:${14 + (i % 2) * 6}px;left:${28 + i * 16}px;width:4px;height:4px;border-radius:9px;` +
				`background:var(--color-accent-deep);opacity:0.35;`}
		></span>
	{/each}

	<!-- tallo -->
	<div
		style={`position:absolute;bottom:34px;left:50%;margin-left:-2.5px;width:5px;height:${Math.max(2, stemPx)}px;` +
			`background:var(--color-accent-deep);border-radius:9px;transition:height .9s cubic-bezier(.16,1,.3,1);`}
	></div>

	<!-- hojas alcanzadas -->
	{#each visibleLeaves as l, i}
		<span
			style={`position:absolute;width:46px;height:30px;bottom:${34 + stemPx * l.y}px;left:50%;` +
				`margin-left:${l.side > 0 ? 0 : -46}px;transform:scaleX(${l.side});transform-origin:center bottom;color:var(--color-accent);`}
		>
			<svg width="46" height="30" viewBox="0 0 46 30" fill="currentColor" style="display:block;">
				<path d="M2 28C2 12 18 2 44 2 44 18 28 28 2 28Z" />
			</svg>
		</span>
	{/each}

	<!-- brote superior -->
	{#if pct > 3}
		<span
			style={`position:absolute;width:34px;height:30px;bottom:${34 + stemPx - 8}px;left:50%;margin-left:-17px;` +
				`color:${done ? 'var(--color-accent-deep)' : 'var(--color-accent)'};`}
		>
			<svg
				width="34"
				height="30"
				viewBox="0 0 34 30"
				fill="currentColor"
				style="display:block;"
			>
				<path d="M17 30c0-10-5-15-15-15 0 9 6 15 15 15Z" />
				<path d="M17 26c0-9 5-13 14-13 0 8-6 13-14 13Z" opacity="0.6" />
			</svg>
		</span>
	{/if}
</div>
