<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = {
		variant?: 'primary' | 'deep' | 'ghost' | 'soft' | 'plain' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		icon?: string;
		iconRight?: string;
		full?: boolean;
		type?: 'button' | 'submit';
		disabled?: boolean;
		href?: string;
		onclick?: (e: MouseEvent) => void;
		style?: string;
		children?: Snippet;
	};

	let {
		variant = 'primary',
		size = 'md',
		icon,
		iconRight,
		full = false,
		type = 'button',
		disabled = false,
		href,
		onclick,
		style = '',
		children
	}: Props = $props();

	const SIZES = {
		sm: { p: '9px 14px', f: 14, h: 36 },
		md: { p: '13px 20px', f: 15.5, h: 48 },
		lg: { p: '16px 26px', f: 17, h: 56 }
	};
	let s = $derived(SIZES[size]);
	let hov = $state(false);

	const VARIANTS = {
		primary: 'background:var(--color-accent);color:#062a12;border:1px solid transparent;',
		deep: 'background:var(--color-accent-deep);color:#fff;border:1px solid transparent;',
		ghost: 'background:var(--color-surface-2);color:var(--color-ink);border:1px solid transparent;',
		soft: 'background:var(--color-accent-soft);color:var(--color-accent-deep);border:1px solid transparent;',
		plain: 'background:transparent;color:var(--color-muted);border:1px solid transparent;',
		danger: 'background:transparent;color:#D8584E;border:1px solid rgba(216,88,78,0.32);'
	};

	const BTN_LEAF = 'M8 92C8 38 46 8 92 8 92 62 54 92 8 92Z';
	const BTN_LEAVES = [
		{ x: '5%', y: '16%', r: -22, sz: 18 },
		{ x: '84%', y: '54%', r: 38, sz: 16 },
		{ x: '70%', y: '10%', r: -62, sz: 13 },
		{ x: '12%', y: '64%', r: 205, sz: 15 }
	];

	let leafCol = $derived(
		variant === 'danger'
			? 'rgba(255,255,255,0.34)'
			: variant === 'primary' || variant === 'deep'
				? 'rgba(6,40,20,0.20)'
				: 'var(--color-accent-soft)'
	);

	// La variante danger se rellena de rojo al pasar el cursor (texto blanco),
	// conservando la animación de hojitas (que aparece justo en hover).
	let variantStyle = $derived(
		variant === 'danger' && hov && !disabled
			? 'background:#D8584E;color:#fff;border:1px solid #D8584E;'
			: VARIANTS[variant]
	);

	let baseStyle = $derived(
		`position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;` +
			`font-family:var(--font-disp);font-weight:600;font-size:${s.f}px;padding:${s.p};min-height:${s.h}px;` +
			`border-radius:999px;cursor:${disabled ? 'not-allowed' : 'pointer'};` +
			`width:${full ? '100%' : 'auto'};opacity:${disabled ? 0.5 : 1};` +
			`letter-spacing:0.01em;white-space:nowrap;text-decoration:none;` +
			`transition:transform .12s ease, background .2s ease, color .2s ease, border-color .2s ease, opacity .2s ease;` +
			variantStyle +
			style
	);

	function press(e: MouseEvent) {
		if (disabled) return;
		(e.currentTarget as HTMLElement).style.transform = 'scale(0.975)';
	}
	function unpress(e: MouseEvent) {
		(e.currentTarget as HTMLElement).style.transform = 'scale(1)';
	}
</script>

{#snippet inner()}
	<span
		style="position:absolute;inset:0;pointer-events:none"
		aria-hidden="true"
	>
		{#each BTN_LEAVES as p, i}
			<span
				style={`position:absolute;left:${p.x};top:${p.y};color:${leafCol};` +
					`opacity:${hov ? 1 : 0};` +
					`transform:rotate(${p.r}deg) scale(${hov ? 1 : 0.3});transform-origin:center;` +
					`transition:opacity .3s ease ${i * 0.04}s, transform .35s cubic-bezier(.34,1.56,.64,1) ${i * 0.04}s;`}
			>
				<svg width={p.sz} height={p.sz} viewBox="0 0 100 100" fill="currentColor">
					<path d={BTN_LEAF} />
				</svg>
			</span>
		{/each}
	</span>
	<span
		style="position:relative;z-index:1;display:inline-flex;align-items:center;gap:9px;"
	>
		{#if icon}
			<Icon name={icon} size={s.f + 3} stroke={2.2} />
		{/if}
		{#if children}{@render children()}{/if}
		{#if iconRight}
			<Icon name={iconRight} size={s.f + 2} stroke={2.2} />
		{/if}
	</span>
{/snippet}

{#if href}
	<a
		{href}
		style={baseStyle}
		onmouseenter={() => (hov = true)}
		onmouseleave={(e) => {
			hov = false;
			(e.currentTarget as HTMLElement).style.transform = 'scale(1)';
		}}
		onmousedown={press}
		onmouseup={unpress}
		role="button"
		tabindex={disabled ? -1 : 0}
		aria-disabled={disabled}
	>
		{@render inner()}
	</a>
{:else}
	<button
		{type}
		{onclick}
		{disabled}
		style={baseStyle}
		onmouseenter={() => {
			if (!disabled) hov = true;
		}}
		onmouseleave={(e) => {
			hov = false;
			(e.currentTarget as HTMLElement).style.transform = 'scale(1)';
		}}
		onmousedown={press}
		onmouseup={unpress}
	>
		{@render inner()}
	</button>
{/if}
