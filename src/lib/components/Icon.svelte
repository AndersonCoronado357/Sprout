<script lang="ts">
	// Portado 1:1 desde sprout-core.jsx
	type Props = { name: string; size?: number; stroke?: number; style?: string; color?: string };
	let { name, size = 22, stroke = 2, style = '', color }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	style={`color:${color || 'currentColor'};${style}`}
	aria-hidden="true"
>
	{#if name === 'home'}
		<path d="M3 11.5 12 4l9 7.5" />
		<path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
	{:else if name === 'chart'}
		<path d="M4 20V4" />
		<path d="M4 20h16" />
		<rect x="7" y="12" width="3" height="5" rx="1" />
		<rect x="12" y="8" width="3" height="9" rx="1" />
		<rect x="17" y="14" width="3" height="3" rx="1" />
	{:else if name === 'clock'}
		<circle cx="12" cy="12" r="8.5" />
		<path d="M12 7.5V12l3 2" />
	{:else if name === 'gear'}
		<circle cx="12" cy="12" r="3.2" />
		<path
			d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3"
		/>
	{:else if name === 'plus'}
		<path d="M12 5v14M5 12h14" />
	{:else if name === 'leaf'}
		<path d="M5 19c0-8 6-13 14-13 0 9-5 14-14 14" />
		<path d="M5 19c2-5 5-8 9-10" />
	{:else if name === 'sprout'}
		<path d="M12 21v-7" />
		<path d="M12 14c0-3.6-2.4-6-6-6 0 3.6 2.4 6 6 6Z" />
		<path d="M12 12c0-3 2-5 5.5-5 0 3-2.2 5-5.5 5Z" />
	{:else if name === 'target'}
		<circle cx="12" cy="12" r="8.5" />
		<circle cx="12" cy="12" r="4.2" />
		<circle cx="12" cy="12" r="0.6" fill="currentColor" />
	{:else if name === 'calendar'}
		<rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
		<path d="M3.5 9.5h17M8 3v4M16 3v4" />
	{:else if name === 'coins'}
		<ellipse cx="9" cy="7" rx="5.5" ry="2.6" />
		<path d="M3.5 7v4c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6V7" />
		<path d="M9.5 13.6c.6 2 3 3.2 6 3.2 3 0 5.5-1.2 5.5-2.6v-4" />
	{:else if name === 'check'}
		<path d="M5 12.5 10 17.5 19.5 7" />
	{:else if name === 'chevR'}
		<path d="M9 6l6 6-6 6" />
	{:else if name === 'chevL'}
		<path d="M15 6l-6 6 6 6" />
	{:else if name === 'chevD'}
		<path d="M6 9l6 6 6-6" />
	{:else if name === 'arrowL'}
		<path d="M19 12H5M11 6l-6 6 6 6" />
	{:else if name === 'arrowUp'}
		<path d="M12 19V5M6 11l6-6 6 6" />
	{:else if name === 'edit'}
		<path d="M14 4.5 19.5 10 8 21.5H3v-5z" />
		<path d="M12.5 6 18 11.5" />
	{:else if name === 'trash'}
		<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" />
	{:else if name === 'repeat'}
		<path d="M4 9V7a2 2 0 0 1 2-2h11l-2.5-2.5M20 15v2a2 2 0 0 1-2 2H7l2.5 2.5" />
	{:else if name === 'share'}
		<circle cx="6" cy="12" r="2.6" />
		<circle cx="17" cy="6" r="2.6" />
		<circle cx="17" cy="18" r="2.6" />
		<path d="M8.3 10.8 14.7 7.3M8.3 13.2l6.4 3.5" />
	{:else if name === 'link'}
		<path d="M10 13.5a4 4 0 0 0 5.7.3l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
		<path d="M14 10.5a4 4 0 0 0-5.7-.3L5.7 12.8a4 4 0 0 0 5.7 5.7l1.4-1.4" />
	{:else if name === 'bell'}
		<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
		<path d="M10.5 20a2 2 0 0 0 3 0" />
	{:else if name === 'user'}
		<circle cx="12" cy="8" r="3.6" />
		<path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
	{:else if name === 'eye'}
		<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
		<circle cx="12" cy="12" r="3" />
	{:else if name === 'eyeOff'}
		<path d="M3 3l18 18" />
		<path d="M10.6 6.1A9 9 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.9 3.5" />
		<path d="M6.4 7.6A15 15 0 0 0 2.5 12S6 18 12 18a8.7 8.7 0 0 0 3.6-.8" />
		<path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
	{:else if name === 'lock'}
		<rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
		<path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
	{:else if name === 'note'}
		<path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
		<path d="M14 4v5h5M8 13h8M8 16.5h5" />
	{:else if name === 'sun'}
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2M19 5l-1.8 1.8M6.8 17.2 5 19M19 19l-1.8-1.8M6.8 6.8 5 5" />
	{:else if name === 'moon'}
		<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
	{:else if name === 'flame'}
		<path d="M12 3c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 2 1.5 2.5 1.5 2.5S11 8 12 3Z" />
	{:else if name === 'wallet'}
		<rect x="3" y="6" width="18" height="13" rx="2.5" />
		<path d="M3 9.5h18M17 13h.01" />
		<path d="M16 6V4.5a1 1 0 0 0-1.3-.95L4 6" />
	{:else if name === 'filter'}
		<path d="M4 6h16M7 12h10M10 18h4" />
	{:else if name === 'pause'}
		<path d="M8.5 5v14M15.5 5v14" />
	{:else if name === 'x'}
		<path d="M6 6l12 12M18 6 6 18" />
	{:else if name === 'play'}
		<path d="M7 5l12 7-12 7z" />
	{:else if name === 'camera'}
		<path
			d="M14.5 4.5h-5L8 7H5A1.5 1.5 0 0 0 3.5 8.5V18A1.5 1.5 0 0 0 5 19.5h14A1.5 1.5 0 0 0 20.5 18V8.5A1.5 1.5 0 0 0 19 7h-3z"
		/>
		<circle cx="12" cy="12.8" r="3.3" />
	{/if}
</svg>
