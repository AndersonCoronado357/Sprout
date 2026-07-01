<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Field from '$lib/components/Field.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	let token = $derived(page.url.searchParams.get('token') ?? '');
	let pass = $state('');
	let pass2 = $state('');
	let errorMsg = $state('');
	let cargando = $state(false);
	let listo = $state(false);

	async function submit() {
		if (cargando) return;
		errorMsg = '';
		if (pass.length < 8) {
			errorMsg = 'La contraseña tiene mínimo 8 caracteres.';
			return;
		}
		if (pass !== pass2) {
			errorMsg = 'Las contraseñas no coinciden.';
			return;
		}
		cargando = true;
		const res = await fetch('/auth/reset', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ token, password: pass })
		});
		cargando = false;
		if (res.ok) {
			listo = true;
		} else {
			let msg = 'No pudimos cambiar la contraseña.';
			try {
				const d = await res.json();
				msg = d?.message || msg;
			} catch {
				/* noop */
			}
			errorMsg = msg;
		}
	}
</script>

<svelte:head>
	<title>Sprout — Nueva contraseña</title>
</svelte:head>

<div
	style="position:relative;width:100%;min-height:100dvh;display:grid;place-items:center;
	background:var(--color-bg);color:var(--color-ink);font-family:var(--font-body);padding:24px;"
>
	<div
		style="width:100%;max-width:420px;background:var(--color-surface);border-radius:26px;padding:clamp(28px, 3vw, 40px);"
		in:fly={{ y: 14, duration: 360, easing: cubicOut }}
	>
		<div style="display:flex;align-items:center;gap:11px;margin-bottom:24px;">
			<span
				style="width:42px;height:42px;border-radius:13px;background:var(--color-accent-soft);display:grid;place-items:center;"
			>
				<Logo size={30} />
			</span>
			<span
				style="font-family:var(--font-disp);font-weight:700;font-size:23px;letter-spacing:-0.02em;"
			>
				Sprout
			</span>
		</div>

		{#if !token}
			<h2
				style="font-family:var(--font-disp);font-weight:700;font-size:22px;margin:0 0 8px;letter-spacing:-0.02em;"
			>
				Enlace inválido
			</h2>
			<p
				style="font-family:var(--font-body);font-weight:600;font-size:14px;color:var(--color-muted);margin:0 0 22px;line-height:1.5;"
			>
				Este enlace de recuperación no es válido o está incompleto. Pide uno nuevo desde la pantalla de acceso.
			</p>
			<Btn full size="lg" onclick={() => goto('/login')}>Ir a entrar</Btn>
		{:else if listo}
			<div
				style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;padding:8px 0;"
			>
				<span
					style="width:60px;height:60px;border-radius:18px;background:var(--color-accent);
					color:#062a12;display:grid;place-items:center;"
				>
					<Icon name="check" size={30} stroke={3} />
				</span>
				<div
					style="font-family:var(--font-disp);font-weight:700;font-size:22px;color:var(--color-ink);"
				>
					¡Contraseña actualizada!
				</div>
				<div
					style="font-family:var(--font-body);font-weight:600;font-size:14px;color:var(--color-muted);max-width:290px;line-height:1.5;"
				>
					Ya puedes entrar a Sprout con tu nueva contraseña.
				</div>
				<div style="margin-top:8px;width:100%;">
					<Btn full size="lg" iconRight="chevR" onclick={() => goto('/login')}>
						Entrar ahora
					</Btn>
				</div>
			</div>
		{:else}
			<h2
				style="font-family:var(--font-disp);font-weight:700;font-size:24px;margin:0 0 6px;letter-spacing:-0.02em;"
			>
				Crea una nueva contraseña
			</h2>
			<p
				style="font-family:var(--font-body);font-weight:600;font-size:13.5px;color:var(--color-muted);margin:0 0 22px;"
			>
				Elige una contraseña de al menos 8 caracteres.
			</p>
			<div style="display:flex;flex-direction:column;gap:14px;">
				<Field label="Nueva contraseña">
					<TextInput bind:value={pass} placeholder="••••••••" icon="lock" type="password" />
				</Field>
				<Field label="Repite la contraseña">
					<TextInput bind:value={pass2} placeholder="••••••••" icon="lock" type="password" />
				</Field>
				{#if errorMsg}
					<div
						role="alert"
						style="background:rgba(216,88,78,0.12);color:#E5786F;border-radius:12px;
						padding:10px 14px;font-family:var(--font-body);font-weight:600;font-size:13.5px;"
					>
						{errorMsg}
					</div>
				{/if}
				<div style="margin-top:4px;">
					<Btn full size="lg" disabled={cargando} icon="lock" onclick={submit}>
						{cargando ? 'Guardando…' : 'Guardar contraseña'}
					</Btn>
				</div>
				<button
					onclick={() => goto('/login')}
					style="align-self:center;background:none;border:none;cursor:pointer;
					color:var(--color-muted);font-family:var(--font-body);font-weight:700;font-size:13px;padding:6px;"
				>
					Volver a entrar
				</button>
			</div>
		{/if}
	</div>
</div>
