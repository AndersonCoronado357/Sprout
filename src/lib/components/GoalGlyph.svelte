<script lang="ts">
	import Icon from './Icon.svelte';
	import { hueTint } from '$lib/format';
	import { CATS, type Goal } from '$lib/data/mock';

	type Props = { goal: Pick<Goal, 'cat' | 'icon'>; size?: number };
	let { goal, size = 46 }: Props = $props();
	let hue = $derived(CATS[goal.cat]?.hue || 'var(--color-accent)');
</script>

<span
	style={`width:${size}px;height:${size}px;border-radius:${size * 0.34}px;flex-shrink:0;` +
		`display:grid;place-items:center;color:${hue};background:${hueTint(hue, 0.16)};`}
>
	<Icon name={goal.icon || 'target'} size={size * 0.5} stroke={2} />
</span>
