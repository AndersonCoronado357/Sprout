<script lang="ts">
	import type { Snippet } from 'svelte';
	type Props = { pad?: number | string; style?: string; onclick?: () => void; children: Snippet };
	let { pad = 22, style = '', onclick, children }: Props = $props();
	let padCss = $derived(typeof pad === 'number' ? `${pad}px` : pad);
</script>

<div
	{onclick}
	style={`background:var(--color-surface);border-radius:22px;padding:${padCss};${style}`}
>
	{@render children()}
</div>
