<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = {
		title: string;
		sub?: string;
		subSnippet?: Snippet;
		onBack?: () => void;
		right?: Snippet;
		big?: boolean;
	};
	let { title, sub, subSnippet, onBack, right, big = false }: Props = $props();
</script>

<div
	style={`display:flex;align-items:flex-start;gap:12px;margin-bottom:${big ? 20 : 16}px;`}
>
	{#if onBack}
		<button
			onclick={onBack}
			style="margin-top:2px;width:42px;height:42px;border-radius:14px;flex-shrink:0;
			background:var(--color-surface);color:var(--color-ink);cursor:pointer;border:none;
			display:grid;place-items:center;transition:background .15s;"
			onmouseenter={(e) =>
				((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
			onmouseleave={(e) =>
				((e.currentTarget as HTMLElement).style.background = 'var(--color-surface)')}
			aria-label="Volver"
		>
			<Icon name="arrowL" size={20} />
		</button>
	{/if}
	<div style="flex:1;min-width:0;">
		<h1
			style={`font-family:var(--font-disp);font-weight:700;font-size:${big ? 25 : 21}px;` +
				`color:var(--color-ink);margin:0;letter-spacing:-0.02em;line-height:1.15;`}
		>
			{title}
		</h1>
		{#if sub}
			<p
				style="font-family:var(--font-body);font-weight:600;font-size:14px;color:var(--color-muted);margin:6px 0 0;"
			>
				{sub}
			</p>
		{:else if subSnippet}
			<p
				style="font-family:var(--font-body);font-weight:600;font-size:14px;color:var(--color-muted);margin:6px 0 0;"
			>
				{@render subSnippet()}
			</p>
		{/if}
	</div>
	{#if right}
		{@render right()}
	{/if}
</div>
