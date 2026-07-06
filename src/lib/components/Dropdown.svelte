<script lang="ts">
	import Icon from './Icon.svelte';

	type Opt = { value: string; label: string; hue?: string; icon?: string };
	type Props = {
		options: Opt[];
		value: string;
		onChange?: (v: string) => void;
		placeholder?: string;
		big?: boolean;
		up?: boolean;
	};
	let {
		options,
		value = $bindable(''),
		onChange,
		placeholder = 'Elegir',
		big = false,
		up = false
	}: Props = $props();

	let open = $state(false);
	let cont: HTMLDivElement;
	let sel = $derived(options.find((o) => o.value === value));
	// Menú anclado a su input. En desktop usa position:fixed (escapa overflow:hidden
	// de padres); en móvil (sin esos padres recortando) usa position:absolute para
	// quedar siempre alineado, inmune a zoom/transform del viewport.
	let menuPos = $state({ top: 0, left: 0, width: 200 });
	let goUp = $state(false);
	let mobUI = $state(false);

	function toggle() {
		if (open) {
			open = false;
			return;
		}
		mobUI = typeof window !== 'undefined' && window.innerWidth < 860;
		if (cont && typeof window !== 'undefined') {
			const rect = cont.getBoundingClientRect();
			const menuH = Math.min(252, options.length * 46 + 12);
			const spaceBelow = window.innerHeight - rect.bottom;
			goUp = up || (spaceBelow < menuH + 12 && rect.top > spaceBelow);
			if (!mobUI) {
				const top = goUp ? rect.top - menuH - 8 : rect.bottom + 8;
				menuPos = { top: Math.max(12, top), left: rect.left, width: rect.width };
			}
		}
		open = true;
	}

	function pick(v: string) {
		value = v;
		open = false;
		if (onChange) onChange(v);
	}

	function onDocClick(e: MouseEvent) {
		if (open && cont && !cont.contains(e.target as Node)) open = false;
	}
	function onKey(e: KeyboardEvent) {
		if (open && e.key === 'Escape') open = false;
	}
	$effect(() => {
		if (!open) return;
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	});
</script>

<div bind:this={cont} style="position:relative;">
	<button
		type="button"
		onclick={toggle}
		style={`width:100%;font-family:var(--font-body);font-weight:700;font-size:${big ? 18 : 15.5}px;` +
			`background:color-mix(in oklab, var(--color-ink) ${open ? 10 : 6}%, var(--color-surface-2));` +
			`border:1.5px solid transparent;` +
			`border-radius:14px;padding:14px 16px;cursor:pointer;color:var(--color-ink);` +
			`display:flex;align-items:center;justify-content:space-between;outline:none;`}
	>
		<span
			style={`display:inline-flex;align-items:center;gap:10px;color:${sel ? 'var(--color-ink)' : 'var(--color-faint)'};min-width:0;`}
		>
			{#if sel?.hue}
				<span
					style={`width:9px;height:9px;border-radius:99px;background:${sel.hue};flex-shrink:0;`}
				></span>
			{/if}
			{#if sel?.icon}
				<Icon name={sel.icon} size={18} />
			{/if}
			<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
				{sel ? sel.label : placeholder}
			</span>
		</span>
		<span
			style={`color:var(--color-faint);transform:${open ? 'rotate(180deg)' : 'none'};transition:transform .2s ease;flex-shrink:0;`}
		>
			<Icon name="chevD" size={18} />
		</span>
	</button>
	{#if open}
		<div
			style={mobUI
				? `position:absolute;${goUp ? 'bottom' : 'top'}:calc(100% + 8px);left:0;right:0;z-index:9999;` +
					`background:var(--color-surface);border-radius:16px;padding:6px;max-height:252px;overflow-y:auto;` +
					`box-shadow:0 16px 40px -8px rgba(0,0,0,0.5);`
				: `position:fixed;top:${menuPos.top}px;left:${menuPos.left}px;width:${menuPos.width}px;z-index:9999;` +
					`background:var(--color-surface);border-radius:16px;padding:6px;max-height:252px;overflow-y:auto;` +
					`box-shadow:0 16px 40px -8px rgba(0,0,0,0.5);`}
		>
			{#each options as o (o.value)}
				{@const a = o.value === value}
				<button
					type="button"
					onclick={() => pick(o.value)}
					style={`width:100%;display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:11px;border:none;cursor:pointer;` +
						`background:${a ? 'var(--color-surface-2)' : 'transparent'};` +
						`color:${a ? 'var(--color-ink)' : 'var(--color-muted)'};` +
						`font-family:var(--font-body);font-weight:700;font-size:14.5px;text-align:left;`}
					onmouseenter={(e) => {
						if (!a)
							(e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
					}}
					onmouseleave={(e) => {
						if (!a) (e.currentTarget as HTMLElement).style.background = 'transparent';
					}}
				>
					{#if o.hue}
						<span
							style={`width:9px;height:9px;border-radius:99px;background:${o.hue};flex-shrink:0;`}
						></span>
					{/if}
					{#if o.icon}
						<Icon name={o.icon} size={17} />
					{/if}
					<span style="flex:1;">{o.label}</span>
					{#if a}
						<Icon name="check" size={16} color="var(--color-accent)" />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
