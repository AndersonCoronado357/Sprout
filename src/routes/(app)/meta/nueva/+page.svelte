<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import TopBar from '$lib/components/TopBar.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Chip from '$lib/components/Chip.svelte';
	import Field from '$lib/components/Field.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import MoneyInput from '$lib/components/MoneyInput.svelte';
	import DateField from '$lib/components/DateField.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import GoalCard from '$lib/components/GoalCard.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { CATS, type GoalCategory, type GoalIcon, type Goal } from '$lib/data/mock';
	import { appState } from '$lib/state.svelte';
	import { fmtMoney, fmtDate, daysBetween, TODAY, hueTint, suggestion } from '$lib/format';

	let cur = $derived(appState.cur);
	const ICONS: GoalIcon[] = [
		'target',
		'wallet',
		'leaf',
		'flame',
		'repeat',
		'note',
		'coins',
		'calendar',
		'sprout',
		'home'
	];

	// Modo edición: ?edit=<id> precarga una meta existente.
	let editId = $derived(page.url.searchParams.get('edit'));
	let editing = $derived(editId ? appState.goalById(editId) : null);

	let step = $state(0);
	let name = $state('');
	let cat = $state<GoalCategory>('viaje');
	let icon = $state<GoalIcon>('target');
	let target = $state<number | ''>('');
	let date = $state('2026-12-31');

	// Precarga los campos una sola vez cuando la meta a editar esté disponible.
	let precargado = $state(false);
	$effect(() => {
		if (editing && !precargado) {
			name = editing.name;
			cat = editing.cat;
			icon = editing.icon;
			target = editing.target;
			date = editing.date;
			precargado = true;
		}
	});

	let mob = $state(false);
	function calcMob() {
		mob = typeof window !== 'undefined' && window.innerWidth < 860;
	}
	onMount(() => {
		calcMob();
		window.addEventListener('resize', calcMob);
		return () => window.removeEventListener('resize', calcMob);
	});

	let hue = $derived(CATS[cat].hue);

	let preview = $derived<Goal>({
		id: 'preview',
		name: name || 'Tu meta',
		cat,
		icon,
		target: Number(target) || 0,
		date,
		created: '2026-06-09',
		recurring: null,
		contribs: []
	});

	let sug = $derived(suggestion({ target: Number(target) || 0, date }, 0));
	let canNext = $derived([name.trim().length > 0, Number(target) > 0, true][step]);

	const steps = ['Qué quieres lograr', 'Cuánto y para cuándo', 'Revisa y crea'];

	let creando = $state(false);
	async function finish() {
		if (creando) return;
		creando = true;
		const payload = { name, cat, icon, target: Number(target), date };
		if (editId && editing) {
			await appState.updateGoal(editId, payload);
			goto(`/meta/${editId}`);
		} else {
			await appState.addGoal(payload);
			goto('/inicio');
		}
	}

	// Dirección de la transición: avanzar (right→left) o retroceder (left→right)
	let prevStep = $state(0);
	let dir = $state<1 | -1>(1);
	$effect(() => {
		if (step !== prevStep) {
			dir = step > prevStep ? 1 : -1;
			prevStep = step;
		}
	});
</script>

<svelte:head>
	<title>{editing ? 'Editar meta' : 'Nueva meta'} — Sprout</title>
</svelte:head>

<div
	style={`display:flex;flex-direction:column;flex:1;min-height:0;width:100%;` +
		(mob ? 'overflow:hidden;' : '')}
>
	<TopBar
		onBack={() =>
			step === 0 ? goto(editing ? `/meta/${editId}` : '/inicio') : (step = step - 1)}
		title={editing ? 'Editar meta' : 'Nueva meta'}
		sub={steps[step]}
	/>

	<div
		style={mob
			? 'display:flex;flex-direction:column;flex:1;min-height:0;'
			: 'display:grid;grid-template-columns:1.05fr 0.95fr;gap:30px;flex:1;min-height:0;align-items:stretch;'}
	>
		<div class="enter-bloom" style="display:flex;flex-direction:column;flex:1;min-height:0;animation-delay:60ms;">
			<!-- Step dots -->
			<div style={`display:flex;gap:8px;margin-bottom:${mob ? 14 : 22}px;flex-shrink:0;`}>
				{#each steps as s, i}
					<div style="flex:1;">
						<div
							style={`height:5px;border-radius:9px;background:${i <= step ? 'var(--color-accent)' : 'var(--color-track)'};transition:background .3s;`}
						></div>
						<div
							style={`font-family:var(--font-body);font-weight:700;font-size:11.5px;` +
								`color:${i === step ? 'var(--color-accent-deep)' : 'var(--color-faint)'};margin-top:7px;`}
						>
							{i + 1}. {s}
						</div>
					</div>
				{/each}
			</div>

			<div style={mob ? 'flex:1;min-height:0;overflow-y:auto;position:relative;' : 'flex:1;position:relative;overflow:hidden;'}>
				{#key step}
					<div
						style="position:relative;"
						in:fly={{ x: 24 * dir, duration: 280, easing: cubicOut, delay: 60 }}
					>
						{#if step === 0}
							<div style="display:flex;flex-direction:column;gap:22px;">
								<Field label="Nombre de la meta">
									<TextInput
										bind:value={name}
										placeholder="Ej. Viaje a San Andrés"
										big
										autofocus
									/>
								</Field>
								<div>
									<div
										style="font-family:var(--font-body);font-weight:700;font-size:13.5px;color:var(--color-ink);margin-bottom:10px;"
									>
										Categoría
									</div>
									<div style="display:flex;gap:9px;flex-wrap:wrap;">
										{#each Object.entries(CATS) as [k, v]}
											<Chip
												active={cat === k}
												onclick={() => (cat = k as GoalCategory)}
												hue={v.hue}
											>
												{v.label}
											</Chip>
										{/each}
									</div>
								</div>
								<div>
									<div
										style="font-family:var(--font-body);font-weight:700;font-size:13.5px;color:var(--color-ink);margin-bottom:10px;"
									>
										Ícono
									</div>
									<div style="display:flex;gap:10px;flex-wrap:wrap;">
										{#each ICONS as ic}
											{@const active = icon === ic}
											<button
												onclick={() => (icon = ic)}
												style={`cursor:pointer;border:none;background:none;padding:0;`}
												aria-label={ic}
											>
												<span
													style={`width:50px;height:50px;border-radius:15px;display:grid;place-items:center;` +
														`color:${active ? hue : 'var(--color-muted)'};` +
														`background:${active ? hueTint(hue, 0.14) : 'var(--color-surface-2)'};` +
														`border:1.5px solid ${active ? hueTint(hue, 0.3) : 'var(--color-border)'};transition:all .15s;`}
												>
													<Icon name={ic} size={23} />
												</span>
											</button>
										{/each}
									</div>
								</div>
							</div>
						{:else if step === 1}
							<div style={`display:flex;flex-direction:column;gap:${mob ? 12 : 22}px;`}>
								<Field label="Monto objetivo" hint="¿Cuánto necesitas reunir?">
									<MoneyInput bind:value={target} {cur} big={!mob} autofocus />
								</Field>
								<Field label="Fecha tentativa" hint="¿Para cuándo lo quieres?">
									<DateField bind:value={date} big={!mob} />
								</Field>
								{#if Number(target) >= 0}
									<div
										style={`background:var(--color-accent-soft);border-radius:18px;padding:${mob ? '10px 16px' : '18px 20px'};`}
									>
										<div
											style={`font-family:var(--font-body);font-weight:700;font-size:12.5px;color:var(--color-accent-deep);
											margin-bottom:${mob ? 6 : 10}px;display:flex;align-items:center;gap:7px;`}
										>
											<Icon name="sprout" size={16} />
											Para llegar a tiempo tendrías que ahorrar
										</div>
										<div style={`display:flex;gap:${mob ? 16 : 22}px;`}>
											<div>
												<span
													style={`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 22 : 28}px;color:var(--color-accent-deep);`}
												>
													{fmtMoney(sug.perWeek, cur)}
												</span>
												<span
													style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-accent-deep);opacity:0.8;"
												>
													/semana
												</span>
											</div>
											<div>
												<span
													style={`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 22 : 28}px;color:var(--color-accent-deep);`}
												>
													{fmtMoney(sug.perMonth, cur)}
												</span>
												<span
													style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-accent-deep);opacity:0.8;"
												>
													/mes
												</span>
											</div>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div style="display:flex;flex-direction:column;gap:18px;">
								<GoalCard goal={preview} {cur} onOpen={() => {}} />
								<div
									style="background:var(--color-surface-2);border-radius:18px;padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;"
								>
									{#each [['Objetivo', fmtMoney(Number(target), cur)], ['Fecha', fmtDate(date)], ['Categoría', CATS[cat].label], ['Faltan', `${daysBetween(TODAY, date)} días`]] as [l, v]}
										<div>
											<div
												style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);"
											>
												{l}
											</div>
											<div
												style="font-family:var(--font-disp);font-weight:600;font-size:17px;color:var(--color-ink);margin-top:2px;"
											>
												{v}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/key}
			</div>

			<div style={`display:flex;gap:12px;margin-top:${mob ? 14 : 26}px;flex-shrink:0;`}>
				{#if step < 2}
					<Btn size="lg" full={mob} iconRight="chevR" disabled={!canNext} onclick={() => (step = step + 1)}>
						Continuar
					</Btn>
				{:else}
					<Btn size="lg" full={mob} icon="check" onclick={finish}>
						{editing ? 'Guardar cambios' : 'Crear meta'}
					</Btn>
				{/if}
				{#if step > 0}
					<Btn size="lg" variant="ghost" onclick={() => (step = step - 1)}>Atrás</Btn>
				{/if}
			</div>
		</div>

		{#if !mob}
			<div
				class="enter-bloom"
				style="background:var(--color-surface-2);border-radius:26px;padding:30px;
				display:flex;flex-direction:column;justify-content:center;gap:20px;animation-delay:200ms;"
			>
				<div
					style="font-family:var(--font-body);font-weight:800;font-size:12px;color:var(--color-faint);letter-spacing:0.1em;text-transform:uppercase;"
				>
					Vista previa
				</div>
				<GoalCard goal={preview} {cur} onOpen={() => {}} />
				<div
					style="text-align:center;color:var(--color-muted);display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:6px;"
				>
					<Logo size={48} />
					<p
						style="font-family:var(--font-body);font-weight:600;font-size:14px;max-width:240px;line-height:1.5;margin:0;"
					>
						Así se verá tu meta. Cada aporte la hará crecer un poco más.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
