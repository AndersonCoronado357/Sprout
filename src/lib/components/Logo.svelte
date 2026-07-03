<script lang="ts">
	// Logo de marca Sprout (brote de dos hojas). Imagen transparente.
	type Props = { size?: number; alt?: string };
	let { size = 28, alt = 'Sprout' }: Props = $props();
</script>

<img
	src="/sprout-logo.png"
	{alt}
	width={size}
	height={size}
	style={`display:block;width:${size}px;height:${size}px;object-fit:contain;`}
/>
