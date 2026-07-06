<script lang="ts">
	// Shell portado 1:1 de sprout-app.jsx
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Botanical from '$lib/components/Botanical.svelte';
	import { appState } from '$lib/state.svelte';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	// Hidrata el store con los datos del servidor (SSR + cliente) y lo re-sincroniza
	// cuando invalidateAll() refresca tras una mutación.
	appState.hydrate(data.user, data.goals);
	$effect(() => {
		appState.hydrate(data.user, data.goals);
	});

	let USER = $derived(appState.user);

	let mob = $state(false);
	function calcMob() {
		mob = typeof window !== 'undefined' && window.innerWidth < 860;
	}
	onMount(() => {
		calcMob();
		window.addEventListener('resize', calcMob);
		return () => window.removeEventListener('resize', calcMob);
	});

	const NAV = [
		{ id: 'home', href: '/inicio', label: 'Inicio', icon: 'home' },
		{ id: 'summary', href: '/resumen', label: 'Resumen', icon: 'chart' },
		{ id: 'history', href: '/historial', label: 'Historial', icon: 'clock' },
		{ id: 'settings', href: '/ajustes', label: 'Ajustes', icon: 'gear' }
	];

	function isActive(href: string): boolean {
		const p = page.url.pathname;
		if (href === '/inicio') return p === '/inicio' || p.startsWith('/meta/');
		return p === href;
	}
</script>

<div
	style={`position:relative;height:100dvh;width:100%;background:var(--color-bg);color:var(--color-ink);` +
		`overflow:hidden;display:flex;flex-direction:${mob ? 'column' : 'row'};`}
>
	<!-- Sidebar (desktop) -->
	{#if !mob}
		<aside
			style="width:clamp(214px, 19vw, 260px);flex-shrink:0;background:var(--color-surface);
			display:flex;flex-direction:column;padding:clamp(16px, 1.6vw, 26px) clamp(12px, 1.2vw, 18px) 20px;"
		>
			<div style="display:flex;align-items:center;gap:9px;padding:0 8px 24px;">
				<Logo size={38} />
				<span
					style="font-family:var(--font-disp);font-weight:700;font-size:23px;color:var(--color-ink);letter-spacing:-0.02em;"
				>
					Sprout
				</span>
			</div>

			<div style="margin-bottom:18px;">
				<Btn full icon="plus" onclick={() => goto('/meta/nueva')}>Nueva meta</Btn>
			</div>

			<nav style="display:flex;flex-direction:column;gap:4px;">
				{#each NAV as n (n.id)}
					{@const active = isActive(n.href)}
					<a
						href={n.href}
						style={`display:flex;align-items:center;gap:13px;padding:12px 14px;border-radius:13px;cursor:pointer;text-decoration:none;` +
							`background:${active ? 'var(--color-surface-2)' : 'transparent'};` +
							`color:${active ? 'var(--color-ink)' : 'var(--color-muted)'};transition:background .16s ease, color .16s ease;` +
							`font-family:var(--font-body);font-weight:${active ? 800 : 700};font-size:15px;`}
						onmouseenter={(e) => {
							if (!active)
								(e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
						}}
						onmouseleave={(e) => {
							if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
						}}
					>
						<Icon
							name={n.icon}
							size={21}
							stroke={active ? 2.4 : 2}
							color={active ? 'var(--color-accent)' : 'inherit'}
						/>
						{n.label}
					</a>
				{/each}
			</nav>

			<div style="margin-top:auto;padding-top:14px;">
				<a
					href="/ajustes"
					style="display:flex;align-items:center;gap:12px;padding:8px;width:100%;border-radius:14px;cursor:pointer;
					background:transparent;text-align:left;text-decoration:none;transition:background .15s ease;"
					onmouseenter={(e) =>
						((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
					onmouseleave={(e) =>
						((e.currentTarget as HTMLElement).style.background = 'transparent')}
				>
					<span
						style="width:42px;height:42px;border-radius:999px;background:var(--color-accent-soft);
						color:var(--color-accent-deep);display:grid;place-items:center;overflow:hidden;
						font-family:var(--font-disp);font-weight:700;font-size:16px;flex-shrink:0;"
					>
						{#if USER.avatar}
							<img
								src={USER.avatar}
								alt="Tu foto"
								style="width:100%;height:100%;object-fit:cover;display:block;"
							/>
						{:else}
							{USER.initials}
						{/if}
					</span>
					<span style="min-width:0;flex:1;">
						<span
							style="display:block;font-family:var(--font-body);font-weight:700;font-size:14px;color:var(--color-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
						>
							{USER.name}
						</span>
						<span
							style="display:block;font-family:var(--font-body);font-weight:600;font-size:12px;color:var(--color-muted);"
						>
							Ver perfil
						</span>
					</span>
					<span style="color:var(--color-faint);flex-shrink:0;">
						<Icon name="gear" size={17} />
					</span>
				</a>
			</div>
		</aside>
	{/if}

	<!-- Main -->
	<main
		style={`flex:1;min-width:0;display:flex;overflow:hidden;padding:${mob ? 0 : 'clamp(10px, 0.9vw, 16px)'};`}
	>
		<div
			style={`position:relative;flex:1;width:100%;background:var(--color-surface-sink);border-radius:${mob ? 0 : '22px'};` +
				`overflow:hidden;display:flex;flex-direction:column;`}
		>
			<Botanical />
			<div
				style="position:relative;z-index:1;flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;"
			>
				<div
					style={`width:100%;padding:${mob ? 'clamp(16px, 5vw, 26px) clamp(16px, 5vw, 26px) 24px' : 'clamp(22px, 3vw, 44px)'};` +
						(mob
							? 'display:flex;flex-direction:column;min-height:100%;'
							: 'flex:1;min-height:0;display:flex;flex-direction:column;')}
				>
					{@render children()}
				</div>
			</div>
		</div>
	</main>

	<!-- Tabbar (mobile) -->
	{#if mob}
		<nav
			style="flex-shrink:0;background:var(--color-surface);border-top:1px solid var(--color-border);
			display:flex;align-items:center;justify-content:space-around;
			padding:8px 10px calc(10px + env(safe-area-inset-bottom));position:relative;"
			aria-label="Navegación principal"
		>
			{#each NAV.slice(0, 2) as n (n.id)}
				{@const active = isActive(n.href)}
				<a
					href={n.href}
					style={`flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 0;text-decoration:none;` +
						`color:${active ? 'var(--color-accent-deep)' : 'var(--color-faint)'};`}
				>
					<Icon name={n.icon} size={23} stroke={active ? 2.5 : 2} />
					<span
						style={`font-family:var(--font-body);font-weight:${active ? 800 : 600};font-size:11px;`}
					>
						{n.label}
					</span>
				</a>
			{/each}
			<a
				href="/meta/nueva"
				style="width:52px;height:52px;border-radius:17px;background:var(--color-accent);color:#062a12;
				display:grid;place-items:center;margin-top:-8px;flex-shrink:0;text-decoration:none;"
				aria-label="Nueva meta"
			>
				<Icon name="plus" size={28} stroke={2.4} />
			</a>
			{#each NAV.slice(2) as n (n.id)}
				{@const active = isActive(n.href)}
				<a
					href={n.href}
					style={`flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 0;text-decoration:none;` +
						`color:${active ? 'var(--color-accent-deep)' : 'var(--color-faint)'};`}
				>
					<Icon name={n.icon} size={23} stroke={active ? 2.5 : 2} />
					<span
						style={`font-family:var(--font-body);font-weight:${active ? 800 : 600};font-size:11px;`}
					>
						{n.label}
					</span>
				</a>
			{/each}
		</nav>
	{/if}
</div>
