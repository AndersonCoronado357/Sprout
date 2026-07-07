<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import TopBar from '$lib/components/TopBar.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import BigBar from '$lib/components/BigBar.svelte';
	import StemPlant from '$lib/components/StemPlant.svelte';
	import MoneyInput from '$lib/components/MoneyInput.svelte';
	import Field from '$lib/components/Field.svelte';
	import DateField from '$lib/components/DateField.svelte';
	import ListRow from '$lib/components/ListRow.svelte';
	import LeafBurst from '$lib/components/LeafBurst.svelte';
	import { CATS, type GoalStatus } from '$lib/data/mock';
	import { appState } from '$lib/state.svelte';
	import {
		fmtMoney,
		fmtCompact,
		fmtDate,
		fmtDateShort,
		goalSaved,
		goalPct,
		goalDone,
		suggestion,
		relativeDays
	} from '$lib/format';

	// "Hoy" del demo (la app usa 2026-06-09 como fecha de referencia).
	const HOY = '2026-06-09';

	let id = $derived(page.params.id ?? '');
	let goal = $derived(appState.goalById(id));
	let cur = $derived(appState.cur);

	let amt = $state<number | ''>('');
	let date = $state('2026-06-09');
	let celebrando = $state(false);
	// Aporte (suma) o retiro (resta). El retiro se guarda como monto negativo.
	let tipo = $state<'aporte' | 'retiro'>('aporte');
	let esRetiro = $derived(tipo === 'retiro');

	// Edición de un aporte existente (inline en la lista).
	let editandoId = $state<string | null>(null);
	let eAmt = $state<number | ''>('');
	let eDate = $state('2026-06-09');
	let eNote = $state('');
	let eGuardando = $state(false);

	function abrirEdicion(c: { id: string; amount: number; date: string; note?: string }) {
		editandoId = c.id;
		eAmt = Math.abs(c.amount);
		eDate = c.date;
		eNote = c.note ?? '';
	}
	function cerrarEdicion() {
		editandoId = null;
		eAmt = '';
		eNote = '';
	}
	async function guardarEdicion(original: { id: string; amount: number }) {
		if (eGuardando || !eAmt || (typeof eAmt === 'number' && eAmt <= 0)) return;
		eGuardando = true;
		// Conserva el signo original (retiro sigue siendo retiro).
		const signo = original.amount < 0 ? -1 : 1;
		await appState.updateContrib(original.id, {
			amount: signo * Number(eAmt),
			date: eDate,
			note: eNote.trim() || null
		});
		eGuardando = false;
		cerrarEdicion();
	}
	async function borrarAporte(cid: string) {
		if (eGuardando) return;
		eGuardando = true;
		await appState.deleteContrib(cid);
		eGuardando = false;
		cerrarEdicion();
	}

	let mob = $state(false);
	function calcMob() {
		mob = typeof window !== 'undefined' && window.matchMedia('(max-width: 859px)').matches;
	}
	onMount(() => {
		calcMob();
		window.addEventListener('resize', calcMob);
		return () => window.removeEventListener('resize', calcMob);
	});

	let saved = $derived(goal ? goalSaved(goal) : 0);
	let pct = $derived(goal ? goalPct(goal) : 0);
	let s = $derived(goal ? suggestion(goal, saved) : null);
	let done = $derived(goal ? goalDone(goal) : false); // finalizada (alcanzó o cerró)
	let alcanzada = $derived(pct >= 100); // llegó al 100%
	let cerrada = $derived(done && pct < 100); // cerrada sin alcanzar el objetivo

	// Estado de la meta: activa / pausada / cancelada.
	let estado = $derived<GoalStatus>(goal?.status ?? 'active');
	let pausada = $derived(estado === 'paused');
	let cancelada = $derived(estado === 'cancelled');
	let archivada = $derived(pausada || cancelada);

	// Vencida: pasó la fecha, sigue incompleta y no está archivada ni cerrada.
	let venida = $derived(!!s?.overdue && !archivada && !done);

	let cambiandoEstado = $state(false);
	async function cambiarEstado(nuevo: GoalStatus) {
		if (!goal || cambiandoEstado) return;
		cambiandoEstado = true;
		await appState.setStatus(goal.id, nuevo);
		cambiandoEstado = false;
	}

	// Meta vencida: extender el plazo o cerrarla incompleta.
	let extendiendo = $state(false);
	let nuevaFecha = $state('');
	let procesandoVenc = $state(false);
	function abrirExtender() {
		nuevaFecha = goal ? goal.date : HOY;
		extendiendo = true;
	}
	async function guardarExtension() {
		if (!goal || procesandoVenc || nuevaFecha <= HOY) return;
		procesandoVenc = true;
		await appState.updateGoal(goal.id, { date: nuevaFecha });
		procesandoVenc = false;
		extendiendo = false;
	}
	async function cerrarIncompleta() {
		if (!goal || procesandoVenc) return;
		procesandoVenc = true;
		await appState.updateGoal(goal.id, { completedDate: HOY });
		procesandoVenc = false;
	}
	async function reabrir() {
		if (!goal || procesandoVenc) return;
		procesandoVenc = true;
		await appState.updateGoal(goal.id, { completedDate: null });
		procesandoVenc = false;
	}
	let hue = $derived(goal ? CATS[goal.cat].hue : '#fff');
	let contribs = $derived(
		goal ? [...goal.contribs].sort((a, b) => b.date.localeCompare(a.date)) : []
	);

	let quickAmounts = $derived(
		[50000, 100000, 200000, s && s.perWeek > 0 ? Math.round(s.perWeek / 1000) * 1000 : 0]
			.filter((q): q is number => q !== null && q > 0)
			.filter((q, i, a) => a.indexOf(q) === i)
	);
	// En móvil, menos chips para que compartan fila con el switch sin partirse.
	let visibleQuickAmounts = $derived(mob ? quickAmounts.slice(0, 2) : quickAmounts);

	let promedioAporte = $derived(
		contribs.length > 0 ? Math.round(saved / contribs.length) : 0
	);
	let diasAhorrando = $derived.by(() => {
		if (!goal) return 0;
		const start = new Date(goal.created + 'T12:00:00').getTime();
		const today = new Date().getTime();
		return Math.max(1, Math.round((today - start) / 86400000));
	});

	let guardando = $state(false);

	// Tope del input: aporte no pasa del faltante; retiro no pasa del saldo actual.
	let maxAmt = $derived(
		esRetiro ? (saved > 0 ? saved : undefined) : s?.remaining || undefined
	);

	async function aportar() {
		if (!goal || !amt || (typeof amt === 'number' && amt <= 0) || guardando) return;
		guardando = true;
		const goalId = goal.id;
		const monto = esRetiro ? -Number(amt) : Number(amt);
		const result = await appState.addContrib(goalId, { amount: monto, date });
		amt = '';
		guardando = false;
		if (result === 'completed') {
			// Celebración full-screen 3.5s, luego a /inicio.
			celebrando = true;
			setTimeout(() => {
				goto('/inicio');
			}, 3500);
		}
	}

	function cancelar() {
		amt = '';
		date = '2026-06-09';
		tipo = 'aporte';
	}

	async function eliminar() {
		if (!goal) return;
		const goalId = goal.id;
		await appState.deleteGoal(goalId);
		goto('/inicio');
	}
</script>

<svelte:head>
	<title>{goal?.name || 'Meta'} — Sprout</title>
</svelte:head>

{#if !goal}
	<div style="padding:40px 20px;text-align:center;color:var(--color-muted);">
		<p>No encontramos esta meta.</p>
		<a href="/inicio" style="color:var(--color-accent-deep);font-weight:700;">Volver al inicio</a>
	</div>
{:else}
	<div
		style={`display:flex;flex-direction:column;gap:18px;width:100%;` +
			(mob ? '' : 'height:100%;min-height:0;overflow:hidden;')}
	>
		<TopBar onBack={() => goto('/inicio')} title={goal.name}>
			{#snippet subSnippet()}
				<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">
					<span
						style={`width:8px;height:8px;border-radius:9px;background:${hue};`}
					></span>
					{CATS[goal.cat].label} · {fmtDateShort(goal.date)}
				</span>
			{/snippet}
			{#snippet right()}
				<Btn
					size="sm"
					variant="ghost"
					icon="edit"
					onclick={() => goto(`/meta/nueva?edit=${goal.id}`)}
				>
					{#if !mob}Editar{/if}
				</Btn>
			{/snippet}
		</TopBar>

		<!-- BANNER DE ESTADO (pausada / cancelada) -->
		{#if archivada}
			<div
				in:fly={{ y: -8, duration: 260, easing: cubicOut }}
				style={`display:flex;align-items:center;gap:14px;flex-shrink:0;border-radius:18px;padding:15px 18px;` +
					`background:${pausada ? 'color-mix(in oklab, #C9961A 16%, var(--color-surface-2))' : 'color-mix(in oklab, #D8584E 14%, var(--color-surface-2))'};`}
			>
				<span
					style={`width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex-shrink:0;color:#fff;` +
						`background:${pausada ? '#C9961A' : '#D8584E'};`}
				>
					<Icon name={pausada ? 'pause' : 'x'} size={20} stroke={2.5} />
				</span>
				<div style="flex:1;min-width:0;">
					<div
						style="font-family:var(--font-disp);font-weight:600;font-size:15.5px;color:var(--color-ink);"
					>
						{pausada ? 'Meta en pausa' : 'Meta cancelada'}
					</div>
					<div
						style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);"
					>
						{pausada
							? 'No cuenta en tu ahorro activo ni recibe recordatorios.'
							: 'La archivaste. Puedes reactivarla cuando quieras.'}
					</div>
				</div>
				<Btn
					size="sm"
					variant="primary"
					icon="play"
					disabled={cambiandoEstado}
					onclick={() => cambiarEstado('active')}
				>
					Reactivar
				</Btn>
			</div>
		{/if}

		<!-- BANNER META VENCIDA -->
		{#if venida}
			<div
				in:fly={{ y: -8, duration: 260, easing: cubicOut }}
				style="display:flex;flex-direction:column;gap:12px;flex-shrink:0;border-radius:18px;padding:15px 18px;
				background:color-mix(in oklab, #C9663C 15%, var(--color-surface-2));"
			>
				<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
					<span
						style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex-shrink:0;
						color:#fff;background:#C9663C;"
					>
						<Icon name="calendar" size={20} />
					</span>
					<div style="flex:1;min-width:180px;">
						<div
							style="font-family:var(--font-disp);font-weight:600;font-size:15.5px;color:var(--color-ink);"
						>
							Se cumplió el plazo
						</div>
						<div
							style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);"
						>
							Venció el {fmtDate(goal.date)}{s ? ` y aún te falta ${fmtMoney(s.remaining, cur)}` : ''}.
						</div>
					</div>
					{#if !extendiendo}
						<div style="display:flex;gap:8px;align-items:center;">
							<Btn size="sm" variant="primary" icon="calendar" onclick={abrirExtender}>
								Extender plazo
							</Btn>
							<Btn
								size="sm"
								variant="ghost"
								icon="check"
								disabled={procesandoVenc}
								onclick={cerrarIncompleta}
							>
								Cerrar
							</Btn>
						</div>
					{/if}
				</div>
				{#if extendiendo}
					<div
						style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;"
						in:fly={{ y: -6, duration: 220, easing: cubicOut }}
					>
						<div style="flex:1 1 200px;min-width:170px;">
							<DateField bind:value={nuevaFecha} compact />
						</div>
						<Btn size="sm" variant="plain" onclick={() => (extendiendo = false)}>Cancelar</Btn>
						<Btn
							size="sm"
							variant="primary"
							icon="check"
							disabled={procesandoVenc || nuevaFecha <= HOY}
							onclick={guardarExtension}
						>
							Guardar plazo
						</Btn>
					</div>
				{/if}
			</div>
		{/if}

		<!-- PANEL REGISTRAR APORTE — con respiro -->
		{#if !done && !archivada}
			<div
				class="enter-focus"
				style="background:var(--color-surface-2);border-radius:20px;padding:18px 20px;flex-shrink:0;
				display:flex;flex-direction:column;gap:14px;animation-delay:60ms;"
			>
				<!-- Fila 1: selector Aporte/Retiro + chips (una sola fila, sin partirse) -->
				<div style={`display:flex;align-items:center;justify-content:space-between;gap:8px;${mob ? 'flex-wrap:nowrap;' : 'flex-wrap:wrap;'}`}>
					<div
						style="display:inline-flex;background:var(--color-surface);border-radius:999px;padding:3px;gap:2px;flex-shrink:0;"
					>
						{#each [['aporte', 'Aporte'], ['retiro', 'Retiro']] as [val, label]}
							{@const on = tipo === val}
							<button
								type="button"
								onclick={() => (tipo = val as 'aporte' | 'retiro')}
								style={`padding:${mob ? '6px 12px' : '7px 16px'};border-radius:999px;border:none;cursor:pointer;` +
									`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 13 : 14}px;transition:all .15s;white-space:nowrap;` +
									(on
										? val === 'retiro'
											? 'background:#B45309;color:#fff;'
											: 'background:var(--color-accent);color:#062a12;'
										: 'background:transparent;color:var(--color-muted);')}
							>
								{label}
							</button>
						{/each}
					</div>
					<div style={`display:flex;gap:${mob ? 6 : 8}px;justify-content:flex-end;min-width:0;${mob ? 'flex-wrap:nowrap;' : 'flex-wrap:wrap;'}`}>
						{#each visibleQuickAmounts as q}
							<button
								type="button"
								onclick={() => (amt = (Number(amt) || 0) + q)}
								style={`padding:${mob ? '6px 10px' : '7px 13px'};border-radius:999px;border:none;background:var(--color-surface);` +
									`cursor:pointer;font-family:var(--font-body);font-weight:700;font-size:${mob ? 11.5 : 12.5}px;` +
									`color:${esRetiro ? '#D08326' : 'var(--color-accent-deep)'};` +
									`transition:background .15s;white-space:nowrap;`}
								onmouseenter={(e) =>
									((e.currentTarget as HTMLElement).style.background =
										esRetiro
											? 'color-mix(in oklab, var(--color-surface) 70%, #B45309 30%)'
											: 'color-mix(in oklab, var(--color-surface) 70%, var(--color-accent) 30%)')}
								onmouseleave={(e) =>
									((e.currentTarget as HTMLElement).style.background = 'var(--color-surface)')}
							>
								{esRetiro ? '−' : '+'}{fmtCompact(q, cur)}
							</button>
						{/each}
					</div>
				</div>

				<!-- Filas: monto / fecha (su propia fila) / botones — apiladas en móvil -->
				<div
					style={mob
						? 'display:flex;flex-direction:column;gap:12px;'
						: 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;'}
				>
					<div style={mob ? '' : 'flex:1 1 220px;min-width:180px;'}>
						<MoneyInput bind:value={amt} {cur} compact max={maxAmt} />
					</div>
					<div style={mob ? '' : 'flex:0 1 180px;min-width:140px;'}>
						<DateField bind:value={date} compact />
					</div>
					<div
						style={mob
							? 'display:flex;gap:8px;align-items:center;justify-content:flex-end;'
							: 'display:flex;gap:6px;align-items:center;'}
					>
						<Btn size="sm" variant="plain" onclick={cancelar}>Cancelar</Btn>
						<Btn
							size="sm"
							variant="primary"
							onclick={aportar}
							icon={esRetiro ? 'arrowUp' : 'check'}
							disabled={!amt || (typeof amt === 'number' && amt <= 0)}
						>
							{esRetiro ? 'Retirar' : 'Guardar'}
						</Btn>
					</div>
				</div>
			</div>
		{/if}

		<!-- 2-col grid: hero+sugerencia / aportes — stretch para ocupar 100% -->
		<div
			style={mob
				? 'display:flex;flex-direction:column;gap:18px;'
				: 'display:grid;grid-template-columns:1.3fr 1fr;grid-template-rows:minmax(0, 1fr);gap:18px;align-items:stretch;flex:1;min-height:0;overflow:hidden;'}
		>
			<div style="display:flex;flex-direction:column;gap:18px;min-height:0;align-self:stretch;">
				<!-- HERO BLOCK (crece para llenar) -->
				<div
					class="enter-focus"
					style={`background:var(--color-surface);border-radius:24px;padding:${mob ? 22 : 28}px;` +
						`display:${mob ? 'block' : 'grid'};grid-template-columns:${mob ? 'unset' : '230px 1fr'};` +
						`gap:28px;align-items:center;animation-delay:140ms;${mob ? '' : 'flex:2 1 auto;'}`}
				>
					<StemPlant {pct} height={mob ? 180 : 229} />
					<div style={`margin-top:${mob ? '8px' : 0};`}>
						<div
							style={`display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;justify-content:${mob ? 'center' : 'flex-start'};`}
						>
							<span
								style={`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 30 : 34}px;color:var(--color-ink);letter-spacing:-0.03em;white-space:nowrap;`}
							>
								{fmtMoney(saved, cur)}
							</span>
							<span
								style="font-family:var(--font-body);font-weight:600;font-size:15px;color:var(--color-faint);"
							>
								de {fmtMoney(goal.target, cur)}
							</span>
						</div>
						<div style="margin-top:16px;">
							<BigBar {pct} height={10} />
						</div>
						<div style="display:flex;justify-content:space-between;margin-top:14px;gap:12px;">
							<div>
								<div
									style="font-family:var(--font-disp);font-weight:700;font-size:22px;color:var(--color-accent-deep);"
								>
									{Math.round(pct)}%
								</div>
								<div
									style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);"
								>
									completado
								</div>
							</div>
							{#if !done && s}
								<div style="text-align:right;">
									<div
										style="font-family:var(--font-disp);font-weight:700;font-size:22px;color:var(--color-ink);"
									>
										{fmtMoney(s.remaining, cur)}
									</div>
									<div
										style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);"
									>
										te falta
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- SUGGESTION (crece para llenar) -->
				<div
					class="enter-focus"
					style={`background:${alcanzada ? 'var(--color-accent-soft)' : cerrada ? 'var(--color-surface-2)' : 'var(--color-surface)'};border-radius:20px;padding:18px 20px;animation-delay:240ms;` +
						`display:flex;flex-direction:column;justify-content:center;${mob ? '' : 'flex:1 1 auto;'}`}
				>
					{#if alcanzada}
						<div
							style="display:flex;align-items:center;gap:13px;color:var(--color-accent-deep);"
						>
							<span
								style="width:42px;height:42px;border-radius:12px;background:var(--color-accent);
								color:#fff;display:grid;place-items:center;"
							>
								<Icon name="check" size={24} stroke={3} />
							</span>
							<div>
								<div
									style="font-family:var(--font-disp);font-weight:600;font-size:17px;color:var(--color-accent-deep);"
								>
									¡Meta cumplida!
								</div>
								<div
									style="font-family:var(--font-body);font-weight:600;font-size:13.5px;color:var(--color-muted);"
								>
									Lograste {fmtMoney(goal.target, cur)}. Felicidades
								</div>
							</div>
						</div>
					{:else if cerrada}
						<div style="display:flex;align-items:center;gap:13px;">
							<span
								style="width:42px;height:42px;border-radius:12px;background:var(--color-surface);
								color:var(--color-muted);display:grid;place-items:center;flex-shrink:0;"
							>
								<Icon name="check" size={22} stroke={2.6} />
							</span>
							<div>
								<div
									style="font-family:var(--font-disp);font-weight:600;font-size:17px;color:var(--color-ink);"
								>
									Meta cerrada
								</div>
								<div
									style="font-family:var(--font-body);font-weight:600;font-size:13.5px;color:var(--color-muted);"
								>
									Guardaste {fmtMoney(saved, cur)} de {fmtMoney(goal.target, cur)} ({Math.round(pct)}%).
								</div>
							</div>
						</div>
					{:else if s}
						<div
							style="display:flex;align-items:center;gap:8px;color:var(--color-muted);margin-bottom:12px;"
						>
							<Icon name="target" size={17} />
							<span style="font-family:var(--font-body);font-weight:700;font-size:13px;">
								{s.overdue
									? 'La fecha ya pasó — ritmo sugerido'
									: `Para llegar ${fmtDateShort(goal.date)} (${relativeDays(goal.date)})`}
							</span>
						</div>
						<div style="display:flex;gap:12px;">
							{#each [['por semana', s.perWeek], ['por mes', s.perMonth]] as [label, v]}
								<div
									style="flex:1;background:var(--color-surface-2);border-radius:14px;padding:14px 16px;text-align:center;"
								>
									<div
										style={`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 22 : 26}px;color:var(--color-accent-deep);letter-spacing:-0.02em;`}
									>
										{fmtMoney(v as number, cur)}
									</div>
									<div
										style="font-family:var(--font-body);font-weight:600;font-size:12.5px;color:var(--color-muted);margin-top:3px;"
									>
										{label}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				{#if goal.recurring}
					<div
						class="enter-focus"
						style="background:var(--color-surface);border-radius:20px;padding:16px 20px;display:flex;align-items:center;gap:14px;flex-shrink:0;animation-delay:340ms;"
					>
						<span
							style="width:42px;height:42px;border-radius:12px;background:var(--color-accent-soft);
							color:var(--color-accent-deep);display:grid;place-items:center;flex-shrink:0;"
						>
							<Icon name="repeat" size={20} />
						</span>
						<div style="flex:1;min-width:0;">
							<div
								style="font-family:var(--font-body);font-weight:700;font-size:14.5px;color:var(--color-ink);"
							>
								Aporte automático activo
							</div>
							<div
								style="font-family:var(--font-body);font-weight:600;font-size:13px;color:var(--color-muted);"
							>
								{fmtMoney(goal.recurring.amount, cur)} cada {goal.recurring.every} · próximo {fmtDateShort(
									goal.recurring.next
								)}
							</div>
						</div>
						<Btn
							size="sm"
							variant="plain"
							onclick={() => goto(`/meta/${goal.id}/recurrente`)}
						>
							Ajustar
						</Btn>
					</div>
				{:else if !done && !archivada}
					<button
						onclick={() => goto(`/meta/${goal.id}/recurrente`)}
						style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;cursor:pointer;
						background:var(--color-surface-2);border:1px dashed var(--color-border-strong);border-radius:20px;padding:15px 20px;
						flex-shrink:0;"
					>
						<Icon name="repeat" size={20} color="var(--color-accent)" />
						<span
							style="font-family:var(--font-body);font-weight:700;font-size:14px;color:var(--color-ink);"
						>
							Programar aporte automático
						</span>
						<span style="margin-left:auto;color:var(--color-faint);">
							<Icon name="chevR" size={18} />
						</span>
					</button>
				{/if}
			</div>

			<!-- APORTES — estirada al row track (align-self: stretch del grid) -->
			<div
				class="enter-focus"
				style={`background:var(--color-surface);border-radius:20px;padding:20px 22px;` +
					`display:flex;flex-direction:column;align-self:stretch;animation-delay:200ms;` +
					(mob ? '' : 'min-height:0;overflow:hidden;')}
			>
				<div
					style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-shrink:0;"
				>
					<span
						style="font-family:var(--font-disp);font-weight:600;font-size:18px;color:var(--color-ink);"
					>
						Aportes
					</span>
					<span
						style="font-family:var(--font-body);font-weight:700;font-size:13px;color:var(--color-muted);"
					>
						{contribs.length}
					</span>
				</div>
				<div
					style={`margin:0 -4px;padding:0 4px;` +
						(mob ? '' : 'flex:1 1 0;min-height:0;overflow-y:auto;')}
				>
					{#if contribs.length === 0}
						<div
							style="padding:24px 8px;text-align:center;color:var(--color-faint);font-family:var(--font-body);font-weight:600;font-size:13px;"
						>
							Aún no hay aportes. Registra el primero arriba.
						</div>
					{:else}
						{#each contribs as c, i (c.id)}
							<div in:fade={{ duration: 220, easing: cubicOut }}>
								{#if editandoId === c.id}
									<!-- Editor inline del aporte -->
									<div
										style="background:var(--color-surface-2);border-radius:14px;padding:12px;margin:4px 0;display:flex;flex-direction:column;gap:9px;"
									>
										<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
											<div style="flex:1 1 150px;min-width:130px;">
												<MoneyInput bind:value={eAmt} {cur} compact />
											</div>
											<div style="flex:1 1 150px;min-width:130px;">
												<DateField bind:value={eDate} compact up />
											</div>
										</div>
										<input
											bind:value={eNote}
											placeholder="Nota (opcional)"
											style="width:100%;background:var(--color-surface);border:1.5px solid transparent;
											border-radius:12px;padding:9px 14px;font-family:var(--font-body);font-size:14px;color:var(--color-ink);outline:none;"
										/>
										<div style="display:flex;gap:8px;justify-content:flex-end;align-items:center;">
											<button
												type="button"
												onclick={() => borrarAporte(c.id)}
												disabled={eGuardando}
												style="display:inline-flex;align-items:center;gap:5px;background:transparent;border:none;cursor:pointer;
												color:var(--color-danger, #D8584E);font-family:var(--font-disp);font-weight:700;font-size:13px;padding:8px 10px;"
											>
												<Icon name="trash" size={15} />
												Borrar
											</button>
											<span style="flex:1;"></span>
											<button
												type="button"
												onclick={cerrarEdicion}
												style="background:transparent;border:none;cursor:pointer;color:var(--color-muted);
												font-family:var(--font-disp);font-weight:700;font-size:13px;padding:8px 12px;"
											>
												Cancelar
											</button>
											<button
												type="button"
												onclick={() => guardarEdicion(c)}
												disabled={eGuardando || !eAmt}
												style={`background:var(--color-accent);color:#062a12;border:none;border-radius:11px;padding:8px 16px;` +
													`cursor:${eGuardando || !eAmt ? 'not-allowed' : 'pointer'};opacity:${eGuardando || !eAmt ? 0.5 : 1};` +
													`font-family:var(--font-disp);font-weight:700;font-size:13px;`}
											>
												Guardar
											</button>
										</div>
									</div>
								{:else}
									<ListRow
										icon="arrowUp"
										iconHue={c.amount < 0 ? '#B45309' : hue}
										title={`${c.amount < 0 ? '− ' : ''}${fmtMoney(Math.abs(c.amount), cur)}`}
										sub={c.note || fmtDate(c.date)}
										right={fmtDateShort(c.date)}
										last={i === contribs.length - 1}
										onclick={() => abrirEdicion(c)}
									/>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
				{#if cerrada}
					<div style="margin-top:14px;flex-shrink:0;">
						<Btn
							size="sm"
							variant="ghost"
							icon="repeat"
							full
							disabled={procesandoVenc}
							onclick={reabrir}
						>
							Reabrir meta
						</Btn>
					</div>
				{:else if !cancelada && !done}
					<div style="display:flex;gap:8px;margin-top:14px;flex-shrink:0;">
						{#if estado === 'active'}
							<div style="flex:1;">
								<Btn
									size="sm"
									variant="ghost"
									icon="pause"
									full
									disabled={cambiandoEstado}
									onclick={() => cambiarEstado('paused')}
								>
									Pausar
								</Btn>
							</div>
						{/if}
						<div style="flex:1;">
							<Btn
								size="sm"
								variant="ghost"
								icon="x"
								full
								disabled={cambiandoEstado}
								onclick={() => cambiarEstado('cancelled')}
							>
								Cancelar meta
							</Btn>
						</div>
					</div>
				{/if}
				<div style="margin-top:8px;flex-shrink:0;">
					<Btn full variant="danger" size="sm" icon="trash" onclick={eliminar}>
						Borrar meta
					</Btn>
				</div>
			</div>
		</div>
	</div>

	<!-- Overlay de celebración: full-screen 3.5s, luego va a /inicio -->
	{#if celebrando}
		<div
			class="celebrate-overlay"
			in:fade={{ duration: 360, easing: cubicOut }}
			out:fade={{ duration: 300, easing: cubicOut }}
		>
			<LeafBurst run />
			<div class="celebrate-content">
				<div
					class="celebrate-icon"
					in:scale={{ start: 0.35, duration: 750, easing: backOut, delay: 150 }}
				>
					<Icon name="check" size={92} stroke={3.5} color="#062a12" />
				</div>
				<h2
					class="celebrate-title"
					in:fly={{ y: 24, duration: 540, easing: cubicOut, delay: 560 }}
				>
					¡Lo lograste!
				</h2>
				<p
					class="celebrate-sub"
					in:fly={{ y: 16, duration: 500, easing: cubicOut, delay: 780 }}
				>
					Completaste <strong>{goal.name}</strong>
				</p>
				<div class="celebrate-stats">
					<div in:fly={{ y: 22, duration: 500, easing: cubicOut, delay: 1000 }}>
						<div class="stat-v">{fmtMoney(goal.target, cur)}</div>
						<div class="stat-l">Ahorrado</div>
					</div>
					<div in:fly={{ y: 22, duration: 500, easing: cubicOut, delay: 1150 }}>
						<div class="stat-v">
							{Math.max(1, Math.round((new Date('2026-06-10').getTime() - new Date(goal.created + 'T12:00:00').getTime()) / 86400000))} días
						</div>
						<div class="stat-l">En</div>
					</div>
					<div in:fly={{ y: 22, duration: 500, easing: cubicOut, delay: 1300 }}>
						<div class="stat-v">{goal.contribs.length}</div>
						<div class="stat-l">Aportes</div>
					</div>
				</div>
				<p
					class="celebrate-hint"
					in:fade={{ duration: 500, delay: 1700 }}
				>
					Te llevamos al inicio…
				</p>
			</div>
		</div>
	{/if}
{/if}

<style>
	.celebrate-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		background: var(--color-bg);
		overflow: hidden;
	}
	.celebrate-content {
		position: relative;
		z-index: 31;
		text-align: center;
		color: var(--color-ink);
		padding: 32px;
		max-width: 600px;
		margin: 0 auto;
	}
	.celebrate-icon {
		width: 160px;
		height: 160px;
		margin: 0 auto;
		border-radius: 46px;
		background: var(--color-accent);
		display: grid;
		place-items: center;
		animation: pulseGlow 2.4s cubic-bezier(0.4, 0, 0.2, 1) 200ms infinite;
	}
	@keyframes pulseGlow {
		0%,
		100% {
			box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-accent) 0%, transparent);
		}
		50% {
			box-shadow:
				0 0 0 28px color-mix(in oklab, var(--color-accent) 0%, transparent),
				0 0 0 14px color-mix(in oklab, var(--color-accent) 22%, transparent);
		}
	}
	.celebrate-title {
		font-family: var(--font-disp);
		font-weight: 700;
		font-size: clamp(40px, 6vw, 64px);
		letter-spacing: -0.03em;
		color: var(--color-ink);
		margin: 36px 0 0;
		line-height: 1;
	}
	.celebrate-sub {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: clamp(16px, 1.8vw, 20px);
		color: var(--color-muted);
		margin: 18px 0 0;
		max-width: 40ch;
	}
	.celebrate-sub strong {
		color: var(--color-ink);
		font-weight: 700;
	}
	.celebrate-stats {
		display: flex;
		gap: 14px;
		justify-content: center;
		margin: 40px 0 0;
		flex-wrap: wrap;
	}
	.celebrate-stats > div {
		background: var(--color-surface);
		border-radius: 18px;
		padding: 18px 24px;
		min-width: 120px;
	}
	.stat-v {
		font-family: var(--font-disp);
		font-weight: 700;
		font-size: 22px;
		color: var(--color-accent-deep);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}
	.stat-l {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 12.5px;
		color: var(--color-muted);
		margin-top: 4px;
	}
	.celebrate-hint {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 13px;
		color: var(--color-faint);
		margin: 44px 0 0;
		letter-spacing: 0.02em;
	}
	@media (prefers-reduced-motion: reduce) {
		.celebrate-icon {
			animation: none;
		}
	}

</style>
