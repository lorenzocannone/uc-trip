<script lang="ts">
	import Header from './Header.svelte';
	import './../app.css';
	let { children } = $props();
	
</script>

<div class="app grid h-screen grid-rows-[auto_1fr_auto]">
	<Header />
	<div class="h-full p-8">
	<!-- Left Sidebar. -->
	<main class="h-full">
		{@render children()}
	</main>
	</div>
	<footer>
	</footer>
</div>

  

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
