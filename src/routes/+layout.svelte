<script lang="ts">
	import './layout.css';
	import { appState } from '$lib/state.svelte';

	let { children } = $props();

	// Sincroniza el atributo data-theme del documento con el estado al cargar
	// y cuando el usuario cambia el tema desde Ajustes.
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', appState.theme);
		}
	});
</script>

{@render children()}
