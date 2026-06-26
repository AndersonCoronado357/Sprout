<script lang="ts">
	// Portado 1:1 desde sprout-app.jsx (Botanical)
	const leaf = 'M8 92C8 38 46 8 92 8 92 62 54 92 8 92Z';
</script>

<div
	style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;color:var(--color-accent);"
>
	<svg
		viewBox="0 0 100 100"
		fill="currentColor"
		style="position:absolute;right:-5%;top:-7%;width:clamp(200px, 26vw, 340px);opacity:0.06;transform:rotate(8deg);"
	>
		<path d={leaf} />
	</svg>
	<svg
		viewBox="0 0 100 100"
		fill="currentColor"
		style="position:absolute;right:7%;top:5%;width:clamp(80px, 9vw, 130px);opacity:0.05;transform:rotate(-30deg);"
	>
		<path d={leaf} />
	</svg>
	<svg
		viewBox="0 0 100 100"
		fill="currentColor"
		style="position:absolute;left:-6%;bottom:-8%;width:clamp(180px, 22vw, 300px);opacity:0.05;transform:rotate(-160deg);"
	>
		<path d={leaf} />
	</svg>
	<svg
		viewBox="0 0 40 300"
		preserveAspectRatio="none"
		style="position:absolute;left:3.5%;top:0;height:100%;width:40px;opacity:0.045;"
		stroke="currentColor"
		fill="none"
	>
		<path
			d="M20 0 C 6 80, 34 150, 20 300"
			stroke-width="2"
			stroke-dasharray="2 12"
			stroke-linecap="round"
		/>
	</svg>
</div>
