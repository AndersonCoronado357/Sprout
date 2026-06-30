<script lang="ts">
	// El layout de auth ahora solo deja pasar; el Login propio dibuja todo el shell.
	let { children } = $props();
</script>

{@render children()}
