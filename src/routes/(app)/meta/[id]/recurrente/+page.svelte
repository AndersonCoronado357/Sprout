<script lang="ts">
	// RecurringScreen portado 1:1 desde sprout-screens2.jsx
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import Card from '$lib/components/Card.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Field from '$lib/components/Field.svelte';
	import MoneyInput from '$lib/components/MoneyInput.svelte';
	import SegSwitch from '$lib/components/SegSwitch.svelte';
	import DateField from '$lib/components/DateField.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { appState } from '$lib/state.svelte';
	import { fmtMoney, fmtDateShort } from '$lib/format';

	let cur = $derived(appState.cur);
	let id = $derived(page.params.id ?? '');
	let goal = $derived(appState.goalById(id));

	let amount = $state<number | ''>(100000);
	let every = $state<'semana' | 'quincena' | 'mes'>('semana');
	let start = $state('2026-06-15');
	let on = $state(false);

	$effect(() => {
		if (goal?.recurring) {
			amount = goal.recurring.amount;
			every = goal.recurring.every;
			start = goal.recurring.next;
			on = true;
		}
	});

	let mob = $state(typeof window !== 'undefined' && window.matchMedia('(max-width: 859px)').matches);
	function calcMob() {
		mob = typeof window !== 'undefined' && window.matchMedia('(max-width: 859px)').matches;
	}
	onMount(() => {
		calcMob();
		window.addEventListener('resize', calcMob);
		return () => window.removeEventListener('resize', calcMob);
	});

	let perMonth = $derived(
		every === 'semana'
			? Number(amount) * 4.33
			: every === 'quincena'
				? Number(amount) * 2
				: Number(amount)
	);

	let guardando = $state(false);
	async function save() {
		if (!goal || guardando) return;
		guardando = true;
		const goalId = goal.id;
		await appState.setRecurring(
			goalId,
			on ? { amount: Number(amount), every, next: start } : null
		);
		goto(`/meta/${goalId}`);
	}
</script>

<svelte:head>
	<title>Aporte automático — Sprout</title>
</svelte:head>

{#if goal}
	<div style="display:flex;flex-direction:column;flex:1;min-height:0;width:100%;">
		<TopBar onBack={() => goto(`/meta/${goal.id}`)} title="Aporte automático" sub={goal.name} />
		<div
			style={`display:grid;grid-template-columns:${mob ? '1fr' : '1fr 0.82fr'};gap:${mob ? 0 : '28px'};flex:1;min-height:0;align-items:stretch;`}
		>
			<div style="display:flex;flex-direction:column;gap:18px;min-height:0;">
				<Card>
					<div style="display:flex;align-items:center;gap:14px;">
						<span
							style="width:46px;height:46px;border-radius:13px;background:var(--color-accent-soft);
							color:var(--color-accent-deep);display:grid;place-items:center;"
						>
							<Icon name="repeat" size={22} />
						</span>
						<div style="flex:1;">
							<div
								style="font-family:var(--font-disp);font-weight:600;font-size:17px;color:var(--color-ink);"
							>
								Apartar automático
							</div>
							<div
								style="font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);"
							>
								Sprout te recuerda registrar este aporte.
							</div>
						</div>
						<button
							onclick={() => (on = !on)}
							style={`width:52px;height:31px;border-radius:99px;border:none;cursor:pointer;` +
								`background:${on ? 'var(--color-accent)' : 'var(--color-track)'};position:relative;transition:background .2s;`}
							aria-label="Toggle"
						>
							<span
								style={`position:absolute;top:3px;left:${on ? 24 : 3}px;width:25px;height:25px;border-radius:99px;background:#fff;transition:left .2s;`}
							></span>
						</button>
					</div>
				</Card>

				<div
					style={`opacity:${on ? 1 : 0.4};pointer-events:${on ? 'auto' : 'none'};transition:opacity .2s;` +
						`display:flex;flex-direction:column;gap:18px;`}
				>
					<Card>
						<Field label="Monto de cada aporte">
							<MoneyInput bind:value={amount} {cur} big />
						</Field>
					</Card>
					<Card>
						<Field label="Frecuencia">
							<SegSwitch
								full
								bind:value={every}
								options={[
									{ value: 'semana', label: 'Cada semana' },
									{ value: 'quincena', label: 'Quincenal' },
									{ value: 'mes', label: 'Mensual' }
								]}
							/>
						</Field>
						<div style="margin-top:16px;">
							<Field label="Primer aporte">
								<DateField bind:value={start} />
							</Field>
						</div>
					</Card>
				</div>

				<div style="margin-top:auto;padding-top:6px;">
					<Btn size="lg" full icon="check" onclick={save}>
						{on ? 'Activar aporte automático' : 'Guardar'}
					</Btn>
				</div>
			</div>

			{#if !mob}
				<div
					style="background:var(--color-accent-deep);color:#fff;border-radius:26px;
					padding:36px 34px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;"
				>
					<svg
						viewBox="0 0 400 400"
						style="position:absolute;right:-28%;top:-20%;width:90%;opacity:0.16;color:#fff;"
						fill="none"
						stroke="currentColor"
					>
						{#each [150, 110, 72] as r}
							<circle cx="200" cy="200" {r} stroke-width="2" />
						{/each}
					</svg>
					<div style="position:relative;">
						<div
							style="font-family:var(--font-body);font-weight:800;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;opacity:0.75;"
						>
							Proyección
						</div>
						<div
							style="font-family:var(--font-disp);font-weight:700;font-size:52px;letter-spacing:-0.03em;line-height:1;margin:12px 0 6px;"
						>
							{fmtMoney(perMonth, cur)}
						</div>
						<div
							style="font-family:var(--font-body);font-weight:600;font-size:14.5px;opacity:0.85;"
						>
							apartado cada mes, automático.
						</div>
						<div style="height:1px;background:rgba(255,255,255,0.2);margin:24px 0;"></div>
						{#each [['Cada aporte', `${fmtMoney(Number(amount), cur)} · ${every}`], ['Primer aporte', fmtDateShort(start)], ['En un año', `≈ ${fmtMoney(perMonth * 12, cur)}`]] as [l, v]}
							<div
								style="display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;"
							>
								<span
									style="font-family:var(--font-body);font-weight:600;font-size:14px;opacity:0.8;"
								>
									{l}
								</span>
								<span style="font-family:var(--font-disp);font-weight:700;font-size:16px;">
									{v}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
