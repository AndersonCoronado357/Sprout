<script lang="ts">
	import type { Snippet } from 'svelte';
	type Props = { label: string; hint?: string; error?: string; children: Snippet };
	let { label, hint, error, children }: Props = $props();
</script>

<label style="display:block;">
	<div
		style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;"
	>
		<span
			style="font-family:var(--font-body);font-weight:700;font-size:13.5px;color:var(--color-ink);"
		>
			{label}
		</span>
		{#if hint}
			<span
				style="font-family:var(--font-body);font-weight:600;font-size:12px;color:var(--color-faint);"
			>
				{hint}
			</span>
		{/if}
	</div>
	{@render children()}
	{#if error}
		<div
			style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:#D8584E;margin-top:6px;"
		>
			{error}
		</div>
	{/if}
</label>
