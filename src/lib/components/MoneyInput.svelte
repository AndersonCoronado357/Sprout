<script lang="ts">
	import { CURRENCIES, type CurrencyCode } from '$lib/format';

	type Props = {
		value: number | '';
		oninput?: (v: number | '') => void;
		cur?: CurrencyCode;
		autofocus?: boolean;
		big?: boolean;
		compact?: boolean;
		max?: number;
	};
	let {
		value = $bindable(0),
		oninput,
		cur = 'COP',
		autofocus = false,
		big = false,
		compact = false,
		max
	}: Props = $props();
	let foc = $state(false);
	let c = $derived(CURRENCIES[cur] || CURRENCIES.COP);
	let display = $derived(
		value === '' || value == null
			? ''
			: Number(value).toLocaleString('es-CO').replace(/[.,]/g, c.sep)
	);

	function handle(e: Event) {
		const t = e.target as HTMLInputElement;
		const raw = t.value.replace(/\D/g, '');
		let v: number | '' = raw === '' ? '' : Number(raw);
		// Clamp al máximo si está definido
		if (typeof v === 'number' && typeof max === 'number' && v > max) {
			v = max;
		}
		value = v;
		// Forzar el valor del input al display formateado (clampeado)
		// para que el usuario no vea dígitos extras al teclear más allá del max.
		const cdef = CURRENCIES[cur] || CURRENCIES.COP;
		const newDisplay =
			v === '' ? '' : Number(v).toLocaleString('es-CO').replace(/[.,]/g, cdef.sep);
		if (t.value !== newDisplay) {
			t.value = newDisplay;
			const end = newDisplay.length;
			try {
				t.setSelectionRange(end, end);
			} catch {}
		}
		if (oninput) oninput(v);
	}

	// Bloquea cualquier tecla que no sea un dígito o una tecla de control
	// (navegación, borrado, copiar/pegar). Resultado: el usuario solo puede
	// teclear números, y solo si no excede el max.
	function onKeyDown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		if (e.key.length > 1) return; // Backspace, ArrowLeft, Tab, Enter, etc.
		if (!/[0-9]/.test(e.key)) {
			e.preventDefault();
			return;
		}
		// Si ya estoy en el max, bloquear dígitos extra
		if (typeof max === 'number' && typeof value === 'number' && value >= max) {
			const t = e.target as HTMLInputElement;
			// permitir si hay texto seleccionado (reemplazo)
			if (t.selectionStart !== t.selectionEnd) return;
			e.preventDefault();
		}
	}

	function onPaste(e: ClipboardEvent) {
		const txt = e.clipboardData?.getData('text') || '';
		if (!/^\d+$/.test(txt.replace(/\s/g, ''))) {
			e.preventDefault();
			const cleaned = txt.replace(/\D/g, '');
			if (cleaned) {
				const v = Number(cleaned);
				value = v;
				if (oninput) oninput(v);
			}
		}
	}

	let padH = $derived(big ? '16px 18px' : compact ? '4px 14px' : '12px 16px');
	let symbolSize = $derived(big ? 30 : compact ? 15 : 20);
	let inputSize = $derived(big ? 34 : compact ? 15 : 22);
	let minH = $derived(big ? 'auto' : compact ? '42px' : 'auto');
</script>

<div
	class="money"
	class:focused={foc}
	style={`padding:${padH};min-height:${minH};border-radius:${compact ? 12 : 16}px;`}
>
	<span
		class="sym"
		style={`font-size:${symbolSize}px;`}
	>
		{c.symbol}
	</span>
	<input
		inputmode="numeric"
		value={display}
		placeholder="0"
		{autofocus}
		oninput={handle}
		onkeydown={onKeyDown}
		onpaste={onPaste}
		onfocus={() => (foc = true)}
		onblur={() => (foc = false)}
		class="input"
		style={`font-size:${inputSize}px;`}
	/>
</div>

<style>
	.money {
		position: relative;
		display: flex;
		align-items: center;
		background: var(--color-surface-2);
		border: 1.5px solid var(--color-border);
		border-radius: 16px;
		transition:
			border-color 160ms cubic-bezier(0.4, 0, 0.2, 1),
			background-color 160ms cubic-bezier(0.4, 0, 0.2, 1);
	}
	.money.focused {
		background: var(--color-surface);
		border-color: var(--color-border-strong);
	}
	.sym {
		font-family: var(--font-disp);
		font-weight: 700;
		color: var(--color-muted);
		margin-right: 8px;
	}
	.input {
		flex: 1;
		border: none;
		outline: none !important;
		background: transparent;
		font-family: var(--font-disp);
		font-weight: 700;
		color: var(--color-ink);
		width: 100%;
		letter-spacing: -0.01em;
	}
</style>
