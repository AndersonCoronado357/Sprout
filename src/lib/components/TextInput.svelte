<script lang="ts">
	// Portado 1:1 desde sprout-ui.jsx
	import Icon from './Icon.svelte';

	type Props = {
		value: string;
		onchange?: (v: string) => void;
		placeholder?: string;
		icon?: string;
		type?: 'text' | 'email' | 'password';
		big?: boolean;
		autofocus?: boolean;
		name?: string;
	};
	let {
		value = $bindable(''),
		onchange,
		placeholder,
		icon,
		type = 'text',
		big = false,
		autofocus = false,
		name
	}: Props = $props();

	let foc = $state(false);
	let show = $state(false);
	let isPw = $derived(type === 'password');
	let actualType = $derived(isPw ? (show ? 'text' : 'password') : type);
	let showToggle = $derived(isPw && String(value || '').length > 0);

	function handle(e: Event) {
		const t = e.target as HTMLInputElement;
		value = t.value;
		if (onchange) onchange(t.value);
	}
</script>

<div style="position:relative;display:flex;align-items:center;">
	{#if icon}
		<span
			style={`position:absolute;left:15px;top:0;bottom:0;display:flex;align-items:center;` +
				`color:${foc ? 'var(--color-accent)' : 'var(--color-faint)'};`}
		>
			<Icon name={icon} size={19} />
		</span>
	{/if}
	{#if isPw}
		<input
			type={actualType}
			{value}
			{placeholder}
			{autofocus}
			{name}
			oninput={handle}
			onfocus={() => (foc = true)}
			onblur={() => (foc = false)}
			style={`width:100%;font-family:var(--font-body);font-weight:600;font-size:${big ? 19 : 16}px;color:var(--color-ink);` +
				`background:${foc ? 'var(--color-surface)' : 'var(--color-surface-2)'};` +
				`border:1.5px solid ${foc ? 'var(--color-border-strong)' : 'var(--color-border)'};` +
				`border-radius:14px;padding:14px 16px;padding-left:${icon ? 44 : 16}px;padding-right:${showToggle ? 46 : 16}px;` +
				`outline:none;transition:border-color .16s,background .16s;box-sizing:border-box;`}
		/>
	{:else}
		<input
			type={actualType}
			{value}
			{placeholder}
			{autofocus}
			{name}
			oninput={handle}
			onfocus={() => (foc = true)}
			onblur={() => (foc = false)}
			style={`width:100%;font-family:var(--font-body);font-weight:600;font-size:${big ? 19 : 16}px;color:var(--color-ink);` +
				`background:${foc ? 'var(--color-surface)' : 'var(--color-surface-2)'};` +
				`border:1.5px solid ${foc ? 'var(--color-border-strong)' : 'var(--color-border)'};` +
				`border-radius:14px;padding:14px 16px;padding-left:${icon ? 44 : 16}px;padding-right:16px;` +
				`outline:none;transition:border-color .16s,background .16s;box-sizing:border-box;`}
		/>
	{/if}
	{#if showToggle}
		<button
			type="button"
			onclick={() => (show = !show)}
			aria-label={show ? 'Ocultar' : 'Mostrar'}
			style="position:absolute;right:8px;top:0;bottom:0;width:34px;display:flex;align-items:center;
			justify-content:center;border:none;background:none;cursor:pointer;color:var(--color-muted);padding:0;"
		>
			<Icon name={show ? 'eyeOff' : 'eye'} size={19} />
		</button>
	{/if}
</div>
