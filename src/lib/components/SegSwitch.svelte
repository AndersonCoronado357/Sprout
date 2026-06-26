<script lang="ts">
	import Icon from './Icon.svelte';

	type Opt = { value: string; label: string; icon?: string };
	type Props = { options: Opt[]; value: string; onChange?: (v: string) => void; full?: boolean };
	let { options, value = $bindable(''), onChange, full = false }: Props = $props();

	function pick(v: string) {
		value = v;
		if (onChange) onChange(v);
	}
</script>

<div
	style={`display:inline-flex;background:var(--color-surface-2);border-radius:13px;padding:4px;gap:4px;` +
		`width:${full ? '100%' : 'auto'};`}
>
	{#each options as o (o.value)}
		{@const active = o.value === value}
		<button
			onclick={() => pick(o.value)}
			style={`flex:${full ? 1 : 'none'};padding:9px 16px;border-radius:9px;border:none;cursor:pointer;` +
				`font-family:var(--font-body);font-weight:700;font-size:13.5px;` +
				`background:${active ? 'var(--color-surface)' : 'transparent'};` +
				`color:${active ? 'var(--color-ink)' : 'var(--color-muted)'};transition:all .18s;` +
				`display:inline-flex;align-items:center;justify-content:center;gap:6px;`}
		>
			{#if o.icon}
				<Icon name={o.icon} size={15} />
			{/if}
			{o.label}
		</button>
	{/each}
</div>
