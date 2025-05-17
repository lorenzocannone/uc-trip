<script lang="ts">
	import TripCard from './TripCard.svelte';
	import Sidebar from './Sidebar.svelte'
	let sidebar_show = false
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>
<div class="grid-flow-row grid grid-cols-4 gap-4">
  	<TripCard/>
  	<TripCard/>
	<button class="rounded-full p-2 bg-primary-500 w-54" on:click={() => sidebar_show = !sidebar_show}>+</button>
</div>
<Sidebar bind:show={sidebar_show} />

