<script lang="ts">
	import Icon from './Icon.svelte';
	import { hueTint } from '$lib/format';

	type Props = {
		icon?: string;
		iconHue?: string;
		title: string;
		sub?: string;
		right?: string;
		rightSub?: string;
		onclick?: () => void;
		last?: boolean;
	};
	let { icon, iconHue, title, sub, right, rightSub, onclick, last = false }: Props = $props();
</script>

<div
	{onclick}
	style={`display:flex;align-items:center;gap:14px;padding:14px 0;` +
		`border-bottom:${last ? 'none' : '1px solid var(--color-border)'};` +
		`cursor:${onclick ? 'pointer' : 'default'};`}
>
	{#if icon}
		<span
			style={`width:40px;height:40px;border-radius:12px;flex-shrink:0;display:grid;place-items:center;` +
				`color:${iconHue || 'var(--color-accent)'};background:${iconHue ? hueTint(iconHue, 0.13) : 'var(--color-accent-soft)'};`}
		>
			<Icon name={icon} size={19} />
		</span>
	{/if}
	<div style="flex:1;min-width:0;">
		<div
			style="font-family:var(--font-body);font-weight:700;font-size:15px;color:var(--color-ink);"
		>
			{title}
		</div>
		{#if sub}
			<div
				style="font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);margin-top:2px;"
			>
				{sub}
			</div>
		{/if}
	</div>
	{#if right}
		<div style="text-align:right;white-space:nowrap;flex-shrink:0;">
			<div
				style="font-family:var(--font-disp);font-weight:700;font-size:16px;color:var(--color-ink);"
			>
				{right}
			</div>
			{#if rightSub}
				<div
					style="font-family:var(--font-body);font-weight:600;font-size:12px;color:var(--color-faint);margin-top:2px;"
				>
					{rightSub}
				</div>
			{/if}
		</div>
	{/if}
</div>
