<script lang="ts">
	type Props = { run?: boolean };
	let { run = true }: Props = $props();

	// Datos generados una sola vez en mount para evitar Math.random en SSR.
	let items = $state<
		{ id: number; x: number; dx: number; dy: number; rot: number; dur: number; delay: number; size: number; kind: 'leaf' | 'dot'; col: string }[]
	>([]);

	import { onMount } from 'svelte';
	onMount(() => {
		items = [...Array(34)].map((_, i) => ({
			id: i,
			x: 6 + Math.random() * 88,
			dx: (Math.random() - 0.5) * 220,
			dy: 240 + Math.random() * 360,
			rot: (Math.random() - 0.5) * 720,
			dur: 1.6 + Math.random() * 1.4,
			delay: Math.random() * 0.5,
			size: 9 + Math.random() * 13,
			kind: Math.random() > 0.45 ? 'leaf' : 'dot',
			col: ['var(--color-accent)', 'var(--color-accent-deep)', '#C9961A', '#2E86C9', '#C9663C'][
				i % 5
			]
		}));
	});
</script>

{#if run}
	<div
		style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:30;"
	>
		<style>
			@keyframes lb-fall {
				0% {
					transform: translate(0, -30px) rotate(0);
					opacity: 0;
				}
				10% {
					opacity: 1;
				}
				100% {
					transform: translate(var(--dx), var(--dy)) rotate(var(--rot));
					opacity: 0;
				}
			}
		</style>
		{#each items as it (it.id)}
			<span
				style={`position:absolute;top:12%;left:${it.x}%;width:${it.size}px;height:${it.size}px;color:${it.col};` +
					`--dx:${it.dx}px;--dy:${it.dy}px;--rot:${it.rot}deg;` +
					`animation:lb-fall ${it.dur}s cubic-bezier(.4,.1,.7,1) ${it.delay}s forwards;`}
			>
				{#if it.kind === 'leaf'}
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						width={it.size}
						height={it.size}
					>
						<path d="M4 20C4 9 12 4 22 4 22 14 14 20 4 20Z" />
					</svg>
				{:else}
					<span
						style={`display:block;width:${it.size}px;height:${it.size}px;border-radius:99px;background:currentColor;`}
					></span>
				{/if}
			</span>
		{/each}
	</div>
{/if}
