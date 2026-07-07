<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Field from '$lib/components/Field.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { appState } from '$lib/state.svelte';

	type Mode = 'in' | 'up' | 'recover';
	let mode = $state<Mode>('in');
	let email = $state('');
	let pass = $state('');
	let name = $state('');
	let sent = $state(false);
	let errorMsg = $state('');
	let cargando = $state(false);

	// Limpia el error al cambiar entre entrar/registrarse/recuperar.
	$effect(() => {
		mode;
		errorMsg = '';
	});

	let mob = $state(false);
	function calcMob() {
		mob = typeof window !== 'undefined' && window.matchMedia('(max-width: 859px)').matches;
	}
	onMount(() => {
		calcMob();
		// Mensajes de vuelta del flujo de Google.
		const err = new URLSearchParams(window.location.search).get('error');
		if (err === 'google-nc') {
			errorMsg = 'El acceso con Google aún no está configurado aquí. Entra con correo y contraseña.';
		} else if (err === 'google') {
			errorMsg = 'No pudimos completar el acceso con Google. Intenta de nuevo.';
		}
		window.addEventListener('resize', calcMob);
		return () => window.removeEventListener('resize', calcMob);
	});

	async function post(url: string, body: unknown): Promise<{ ok: boolean; msg?: string }> {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (res.ok) return { ok: true };
		let msg = 'Algo salió mal';
		try {
			const d = await res.json();
			msg = d?.message || msg;
		} catch {
			/* noop */
		}
		return { ok: false, msg };
	}

	async function submit() {
		if (cargando) return;
		errorMsg = '';
		cargando = true;
		let r: { ok: boolean; msg?: string };
		if (mode === 'up') {
			r = await post('/auth/register', { name, email, password: pass });
		} else {
			r = await post('/auth/login', { login: email, password: pass });
		}
		cargando = false;
		if (r.ok) {
			await invalidateAll();
			goto('/inicio');
		} else {
			errorMsg = r.msg || 'Algo salió mal';
		}
	}

	async function recover() {
		if (cargando) return;
		errorMsg = '';
		if (email.trim().length < 3) {
			errorMsg = 'Escribe tu correo.';
			return;
		}
		cargando = true;
		const r = await post('/auth/forgot', { email });
		cargando = false;
		if (r.ok) {
			sent = true;
		} else {
			errorMsg = r.msg || 'No pudimos enviar el enlace';
		}
	}

	const COPY: Record<Mode, { eye: string; t1: string; t2: string; text: string }> = {
		in: {
			eye: 'Bienvenido de vuelta',
			t1: 'Tus metas',
			t2: 'te esperan.',
			text: 'Entra y sigue viendo crecer tus ahorros, justo donde los dejaste.'
		},
		up: {
			eye: 'Crea tu cuenta gratis',
			t1: 'Empieza a',
			t2: 'crecer hoy.',
			text: 'Planta tu primera meta y mira cómo cada aporte la hace florecer.'
		},
		recover: {
			eye: 'Recuperar acceso',
			t1: 'Recupera',
			t2: 'tu acceso.',
			text: 'Te enviamos un enlace a tu correo para crear una contraseña nueva.'
		}
	};
	const BULLETS: Record<Mode, [string, string][]> = {
		in: [
			['sprout', 'Tu progreso crece como una planta'],
			['target', 'Sabes cuánto ahorrar por semana'],
			['flame', 'Mantén tu racha viva']
		],
		up: [
			['plus', 'Crea metas en segundos'],
			['target', 'Te decimos cuánto ahorrar'],
			['repeat', 'Aportes automáticos']
		],
		recover: [
			['eye', 'Tus datos siempre privados'],
			['note', 'Enlace seguro a tu correo'],
			['check', 'Vuelves a entrar al instante']
		]
	};

	let cp = $derived(COPY[mode]);
	let bl = $derived(BULLETS[mode]);

	const leafD = 'M8 92C8 38 46 8 92 8 92 62 54 92 8 92Z';
	const LEAVES = [
		{ x: '3%', y: '-6%', w: 240, r: 24, o: 0.07 },
		{ x: '87%', y: '5%', w: 130, r: -50, o: 0.07 },
		{ x: '69%', y: '-5%', w: 80, r: 140, o: 0.06 },
		{ x: '1%', y: '68%', w: 160, r: -150, o: 0.08 },
		{ x: '19%', y: '85%', w: 92, r: 30, o: 0.06 },
		{ x: '90%', y: '72%', w: 150, r: 200, o: 0.06 },
		{ x: '45%', y: '-7%', w: 70, r: -20, o: 0.05 },
		{ x: '57%', y: '89%', w: 104, r: 120, o: 0.05 },
		{ x: '33%', y: '94%', w: 64, r: -70, o: 0.05 }
	];

	const STEM1 = [
		[100, 280, -1],
		[106, 228, 1],
		[94, 176, -1],
		[104, 120, 1],
		[98, 76, -1]
	] as [number, number, number][];
	const STEM2 = [
		[100, 230, 1],
		[94, 182, -1],
		[106, 134, 1],
		[96, 86, -1]
	] as [number, number, number][];

	// Variables reactivas según el tema actual.
	let dark = $derived(appState.theme === 'dark');
	let fg = $derived(dark ? '#fff' : 'var(--color-ink)');
	let loginBg = $derived(dark ? '#0E1B14' : '#FBFAF7');
	let decorCol = $derived(dark ? '#fff' : 'var(--color-accent)');
	let chipBg = $derived(dark ? 'rgba(255,255,255,0.15)' : 'var(--color-accent-soft)');
</script>

<svelte:head>
	<title>Sprout — Entrar</title>
</svelte:head>

<div
	style={`position:relative;width:100%;height:100dvh;overflow:hidden;background:${loginBg};color:${fg};font-family:var(--font-body);`}
>
	<!-- DECOR -->
	<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;color:{decorCol};">
		<svg
			viewBox="0 0 600 600"
			style="position:absolute;right:-12%;bottom:-16%;width:min(72vh, 660px);opacity:0.12;"
			fill="none"
			stroke="currentColor"
		>
			{#each [272, 216, 160, 104, 54] as r, i}
				<circle
					cx="300"
					cy="300"
					{r}
					stroke-width="2"
					stroke-dasharray={i % 2 ? '3 12' : 'none'}
				/>
			{/each}
		</svg>
		<svg
			viewBox="0 0 600 600"
			style="position:absolute;left:-18%;top:-20%;width:min(56vh, 520px);opacity:0.07;"
			fill="none"
			stroke="currentColor"
		>
			{#each [230, 168, 106] as r}
				<circle cx="300" cy="300" {r} stroke-width="2" stroke-dasharray="3 12" />
			{/each}
		</svg>
		{#each LEAVES as l, i}
			<svg
				viewBox="0 0 100 100"
				fill="currentColor"
				style={`position:absolute;left:${l.x};top:${l.y};` +
					`width:clamp(${Math.round(l.w * 0.5)}px, ${(l.w / 14).toFixed(1)}vw, ${l.w}px);` +
					`opacity:${l.o};transform:rotate(${l.r}deg);`}
			>
				<path d={leafD} />
			</svg>
		{/each}
		<svg
			viewBox="0 0 200 360"
			fill="none"
			stroke="currentColor"
			style="position:absolute;left:-1%;top:16%;height:66%;opacity:0.1;"
		>
			<path d="M100 360 C 64 260, 136 190, 100 50" stroke-width="3" stroke-linecap="round" />
			{#each STEM1 as [x, y, sg]}
				<path
					d={leafD}
					fill="currentColor"
					stroke="none"
					transform={`translate(${x} ${y}) scale(${0.46 * sg} 0.46) rotate(${sg > 0 ? -22 : 202})`}
				/>
			{/each}
		</svg>
		<svg
			viewBox="0 0 200 300"
			fill="none"
			stroke="currentColor"
			style="position:absolute;right:3%;bottom:1%;height:48%;opacity:0.09;"
		>
			<path d="M100 300 C 130 220, 70 160, 100 40" stroke-width="3" stroke-linecap="round" />
			{#each STEM2 as [x, y, sg]}
				<path
					d={leafD}
					fill="currentColor"
					stroke="none"
					transform={`translate(${x} ${y}) scale(${0.42 * sg} 0.42) rotate(${sg > 0 ? -24 : 204})`}
				/>
			{/each}
		</svg>
	</div>

	<!-- Logo top-left (solo desktop; en móvil va inline arriba del formulario) -->
	<div
		style={`display:${mob ? 'none' : 'flex'};position:absolute;top:clamp(20px, 3vw, 34px);left:clamp(20px, 3vw, 40px);align-items:center;gap:11px;color:${fg};z-index:2;`}
	>
		<Logo size={40} />
		<span
			style="font-family:var(--font-disp);font-weight:700;font-size:24px;letter-spacing:-0.02em;"
		>
			Sprout
		</span>
	</div>

	{#snippet Headline()}
		{#key mode}
			<div
				style={`color:${fg};max-width:500px;`}
				in:fly={{ y: 14, duration: 380, easing: cubicOut, delay: 60 }}
			>
				<div
					style={`display:${mob ? 'none' : 'block'};font-family:var(--font-body);font-weight:800;font-size:12.5px;` +
						`letter-spacing:0.14em;text-transform:uppercase;opacity:0.72;margin-bottom:14px;`}
				>
					{cp.eye}
				</div>
				<h1
					style={`font-family:var(--font-disp);font-weight:700;font-size:${mob ? 25 : 'clamp(36px, 3.8vw, 54px)'};` +
						`line-height:1.04;margin:0;letter-spacing:-0.03em;`}
				>
					{cp.t1}<br />{cp.t2}
				</h1>
				<p
					style={`display:${mob && mode !== 'recover' ? 'none' : 'block'};font-family:var(--font-body);font-weight:600;` +
						`font-size:${mob ? 15 : 17}px;opacity:0.85;margin:18px 0 0;max-width:420px;line-height:1.5;`}
				>
					{cp.text}
				</p>
				{#if !mob}
					<div style="display:flex;flex-direction:column;gap:13px;margin:34px 0 0;">
						{#each bl as [ic, t], i}
							<div
								style="display:flex;align-items:center;gap:12px;"
								in:fly={{ y: 10, duration: 350, easing: cubicOut, delay: 180 + i * 70 }}
							>
								<span
									style={`width:36px;height:36px;border-radius:11px;background:${chipBg};display:grid;place-items:center;flex-shrink:0;`}
								>
									<Icon name={ic} size={18} />
								</span>
								<span
									style="font-family:var(--font-body);font-weight:600;font-size:15px;opacity:0.94;"
								>
									{t}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/key}
	{/snippet}

	{#snippet CardForm()}
		<div
			style={`width:100%;max-width:420px;background:var(--color-surface);border-radius:26px;padding:${mob ? '20px 22px 22px' : 'clamp(28px, 2.4vw, 38px)'};`}
		>
			{#key mode + '|' + sent}
				<div in:fly={{ y: 12, duration: 320, easing: cubicOut }}>
					{#if mode === 'recover'}
						<button
							onclick={() => {
								mode = 'in';
								sent = false;
							}}
							style="display:inline-flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;
							color:var(--color-muted);font-family:var(--font-body);font-weight:700;font-size:13.5px;margin-bottom:18px;padding:0;"
						>
							<Icon name="arrowL" size={16} />
							Volver a entrar
						</button>
					{/if}

					<h2
						style="font-family:var(--font-disp);font-weight:700;font-size:24px;color:var(--color-ink);margin:0 0 6px;letter-spacing:-0.02em;"
					>
						{sent
							? 'Revisa tu correo'
							: mode === 'in'
								? 'Entra a tu cuenta'
								: mode === 'up'
									? 'Crea tu cuenta'
									: 'Recuperar contraseña'}
					</h2>
					<p
						style={`font-family:var(--font-body);font-weight:600;font-size:13.5px;color:var(--color-muted);margin:0 0 ${mob ? 16 : 22}px;`}
					>
						{sent
							? 'Sigue las instrucciones del enlace.'
							: mode === 'in'
								? 'Sigue el progreso de tus metas.'
								: mode === 'up'
									? 'Es gratis y toma menos de un minuto.'
									: 'Escribe tu correo y te ayudamos.'}
					</p>

					{#if sent}
						<div
							style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:20px 0 8px;"
						>
							<span
								style="width:56px;height:56px;border-radius:18px;background:var(--color-accent-soft);
								color:var(--color-accent-deep);display:grid;place-items:center;"
							>
								<Icon name="note" size={26} />
							</span>
							<div
								style="font-family:var(--font-disp);font-weight:600;font-size:18px;color:var(--color-ink);"
							>
								Enlace enviado
							</div>
							<div
								style="font-family:var(--font-body);font-weight:600;font-size:14px;color:var(--color-muted);max-width:280px;"
							>
								Enviamos un enlace a
								<strong style="color:var(--color-ink);">{email || 'tu correo'}</strong>
								para crear una nueva contraseña.
							</div>
							<div style="margin-top:8px;width:100%;">
								<Btn
									full
									size="lg"
									onclick={() => {
										mode = 'in';
										sent = false;
									}}
								>
									Volver a entrar
								</Btn>
							</div>
						</div>
					{:else}
						<div style={`display:flex;flex-direction:column;gap:${mob ? 10 : 14}px;`}>
							{#if mode === 'up'}
								<Field label="Tu nombre">
									<TextInput bind:value={name} placeholder="Nombre y apellido" icon="user" />
								</Field>
							{/if}
							<Field label="Correo">
								<TextInput
									bind:value={email}
									placeholder="tucorreo@email.com"
									icon="note"
									type="email"
								/>
							</Field>
							{#if mode !== 'recover'}
								<Field label="Contraseña">
									<TextInput
										bind:value={pass}
										placeholder="••••••••"
										icon="lock"
										type="password"
									/>
								</Field>
							{/if}

							{#if errorMsg}
								<div
									role="alert"
									style="background:rgba(216,88,78,0.12);color:#E5786F;border-radius:12px;
									padding:10px 14px;font-family:var(--font-body);font-weight:600;font-size:13.5px;"
								>
									{errorMsg}
								</div>
							{/if}
							{#if mode === 'in'}
								<button
									onclick={() => (mode = 'recover')}
									style="align-self:flex-end;background:none;border:none;cursor:pointer;
									color:var(--color-accent-deep);font-family:var(--font-body);font-weight:700;font-size:13px;padding:0;margin-top:-2px;"
								>
									¿Olvidaste tu contraseña?
								</button>
							{/if}
							<div style={mob ? '' : 'margin-top:4px;'}>
								<Btn
									full
									size="lg"
									disabled={cargando}
									iconRight={mode === 'recover' ? 'note' : 'chevR'}
									onclick={mode === 'recover' ? recover : submit}
								>
									{cargando
										? 'Un momento…'
										: mode === 'in'
											? 'Entrar'
											: mode === 'up'
												? 'Crear cuenta'
												: 'Enviar enlace'}
								</Btn>
							</div>
							{#if mode !== 'recover'}
								<div style={`display:flex;align-items:center;gap:12px;margin:${mob ? 0 : 2}px 0;`}>
									<span style="flex:1;height:1px;background:var(--color-border);"></span>
									<span
										style="font-family:var(--font-body);font-weight:600;font-size:12px;color:var(--color-faint);"
									>
										o
									</span>
									<span style="flex:1;height:1px;background:var(--color-border);"></span>
								</div>
								<Btn
									full
									variant="ghost"
									size="lg"
									onclick={() => (window.location.href = '/auth/google')}
								>
									<span style="display:inline-flex;width:18px;height:18px;">
										<svg viewBox="0 0 24 24" width="18" height="18">
											<path
												fill="#4285F4"
												d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.9Z"
											/>
											<path
												fill="#34A853"
												d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1-3.8 1-2.9 0-5.4-2-6.3-4.6H2v2.8A11 11 0 0 0 12 23Z"
											/>
											<path
												fill="#FBBC05"
												d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.2-1.4.4-2.1V7H2a11 11 0 0 0 0 9.9L5.7 14Z"
											/>
											<path
												fill="#EA4335"
												d="M12 4.8c1.6 0 3 .6 4.2 1.7l3.1-3.1A11 11 0 0 0 2 7l3.7 2.8C6.6 6.8 9.1 4.8 12 4.8Z"
											/>
										</svg>
									</span>
									Continuar con Google
								</Btn>
								<div
									style={`text-align:center;margin-top:${mob ? 2 : 6}px;font-family:var(--font-body);font-weight:600;font-size:14px;color:var(--color-muted);`}
								>
									{mode === 'in' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
									<button
										onclick={() => {
											mode = mode === 'in' ? 'up' : 'in';
											sent = false;
										}}
										style="background:none;border:none;cursor:pointer;
										font-family:var(--font-body);font-weight:800;font-size:14px;color:var(--color-accent-deep);padding:0;"
									>
										{mode === 'in' ? 'Regístrate' : 'Entra'}
									</button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/key}
		</div>
	{/snippet}

	{#if mob}
		<div
			style={`position:relative;z-index:3;height:100%;overflow-y:auto;display:flex;flex-direction:column;justify-content:center;` +
				`gap:${mode === 'up' ? 10 : 13}px;padding:12px 20px 14px;`}
		>
			<div style={`display:flex;align-items:center;gap:9px;color:${fg};`}>
				<Logo size={30} />
				<span style="font-family:var(--font-disp);font-weight:700;font-size:19px;letter-spacing:-0.02em;">
					Sprout
				</span>
			</div>
			<div>{@render Headline()}</div>
			<div style="display:flex;justify-content:center;">{@render CardForm()}</div>
		</div>
	{:else}
		{@const ease = 'cubic-bezier(.76,0,.24,1)'}
		{@const G = 'clamp(150px, 17vw, 340px)'}
		{@const Wh = 'min(440px, 36vw)'}
		{@const Wc = 'min(420px, 38vw)'}
		{@const pe = `50% - (${Wh} + ${G} + ${Wc}) / 2`}
		{@const hLeft = mode === 'up' ? `calc(${pe} + ${Wc} + ${G})` : `calc(${pe})`}
		{@const cLeft = mode === 'up' ? `calc(${pe})` : `calc(${pe} + ${Wh} + ${G})`}
		<div style="position:relative;z-index:3;width:100%;height:100%;">
			<div
				style={`position:absolute;top:50%;transform:translateY(-50%);left:${hLeft};width:${Wh};transition:left .6s ${ease};`}
			>
				{@render Headline()}
			</div>
			<div
				style={`position:absolute;top:50%;transform:translateY(-50%);left:${cLeft};width:${Wc};transition:left .6s ${ease};`}
			>
				{@render CardForm()}
			</div>
		</div>
	{/if}
</div>
