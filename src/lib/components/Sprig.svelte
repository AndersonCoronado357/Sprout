<script lang="ts">
	// Logo Sprout: tres líneas (tallo + dos hojas). Portado 1:1 desde sprout-core.jsx
	type Props = { size?: number; color?: string };
	let { size = 28, color = 'var(--color-accent)' }: Props = $props();
</script>

<svg width={size} height={size} viewBox="0 0 32 32" fill="none" style="color:{color}">
	<path d="M16 30V15" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
	<path
		d="M16 17c0-4.4-3-7.4-7.4-7.4 0 4.4 3 7.4 7.4 7.4Z"
		fill="currentColor"
	/>
	<path
		d="M16 14.5c0-3.8 2.6-6.4 6.8-6.4 0 3.8-2.8 6.4-6.8 6.4Z"
		fill="currentColor"
		opacity="0.62"
	/>
</svg>
