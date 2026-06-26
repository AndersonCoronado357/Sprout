<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = {
		active?: boolean;
		onclick?: () => void;
		hue?: string;
		icon?: string;
		children: Snippet;
	};
	let { active = false, onclick, hue, icon, children }: Props = $props();
</script>

<button
	{onclick}
	style={`display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:999px;` +
		`font-family:var(--font-body);font-weight:700;font-size:13.5px;cursor:pointer;white-space:nowrap;` +
		`transition:background .16s ease,color .16s ease;letter-spacing:0.01em;border:none;` +
		(active
			? 'background:var(--color-accent-soft);color:var(--color-accent-deep);'
			: 'background:var(--color-surface-2);color:var(--color-muted);')}
	onmouseenter={(e) => {
		if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-sink)';
	}}
	onmouseleave={(e) => {
		if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
	}}
	aria-pressed={active}
>
	{#if hue}
		<span style="width:8px;height:8px;border-radius:99px;background:{hue}"></span>
	{/if}
	{#if icon}
		<Icon name={icon} size={15} />
	{/if}
	{@render children()}
</button>
