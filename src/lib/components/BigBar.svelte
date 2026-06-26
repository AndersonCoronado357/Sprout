<script lang="ts">
	type Props = { pct: number; height?: number; hue?: string };
	let { pct, height = 8, hue }: Props = $props();
	let w = $derived(Math.max(0, Math.min(100, pct)));
	let done = $derived(pct >= 100);
</script>

<div style="position:relative;width:100%;">
	<div
		style={`position:relative;height:${height}px;border-radius:${height}px;background:var(--color-track);overflow:hidden;`}
	>
		<div
			style={`position:absolute;inset:0;width:${w}%;border-radius:${height}px;` +
				`background:${done ? 'var(--color-accent-deep)' : hue || 'var(--color-accent)'};` +
				`transition:width 1s cubic-bezier(.16,1,.3,1);`}
		></div>
	</div>
</div>
