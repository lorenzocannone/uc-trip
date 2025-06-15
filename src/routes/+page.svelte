<script lang="ts">
	import { fetchTrips, tripsStore } from '$lib/stores/tripsStore';
	import TripCard from './TripCard.svelte';
	import Sidebar from './TripSidebar.svelte'
	import Plus from '@lucide/svelte/icons/plus';
	import { type Trip } from '$lib/classes/classes'
    import { onMount } from 'svelte';

	let sidebar_show = $state(false)
	let activeTrip: Trip = $state({})
	let update = $state(false)
	let trips = $derived($tripsStore)

	onMount(() => {
		trips = trips.sort((a, b) => {
		// Ordina per ruolo: owner prima, viewer poi
		// Se uno dei due ha il ruolo 'owner' e l'altro no, quello 'owner' viene prima
		if (a.role !== b.role) {
			if (a.role === 'owner') return -1;
			if (b.role === 'owner') return 1;
			if (a.role === 'viewer') return -1;
			if (b.role === 'viewer') return 1;
		}
		
		// Se i ruoli sono uguali oppure se nessuno è owner/viewer, ordina per data (first_night)
		if (!a.first_night && b.first_night) return 1;
		if (!b.first_night && a.first_night) return -1;
		
		const dateA = new Date(a.first_night?.toString())
		const dateB = new Date(b.first_night?.toString())
		
		return dateA - dateB;
		})
		console.log('trips', trips)
	})

	$effect(() => {
		console.log('update triggered!')
		if (update === true) {
			console.log('update == TRUE')
			fetchTrips()
			update = false
    	}
	});

	/** Determine if on the current step. */
	function sidebarOpener(selectedTrip: Trip) {
		activeTrip = selectedTrip? selectedTrip : {}
		if (sidebar_show == false) { sidebar_show = true }
	}

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>
{#if trips === undefined}
  <!-- Lo store non è ancora stato popolato -->
  <p>Caricamento in corso…</p>
{:else if trips.length === 0}
  <!-- Array vuoto -->
  <p>Nessun viaggio trovato. Aggiungine uno!</p>
  <div class="col-span-1 content-center">
		<button onclick={() => sidebarOpener({})} class="w-8 h-8 flex text-white items-center justify-center rounded-full border border-white bg-linear-to-tr from-cyan-300 to-green-300 45-deg text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
		<Plus/>
		</button>
	</div>
{:else}
<div class="grid-flow-row grid grid-cols-3 gap-4">
	{#each trips as trip}
			<button onclick={() => sidebarOpener(trip)}>
  		<TripCard trip={trip}/>
	</button>
	{/each}
	<div class="col-span-1 content-center">
		<button onclick={() => sidebarOpener({})} class="w-8 h-8 flex text-white items-center justify-center rounded-full border border-white bg-linear-to-tr from-cyan-300 to-green-300 45-deg text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
		<Plus/>
		</button>
	</div>
</div>
{/if}
<Sidebar bind:show={sidebar_show} bind:update={update} trip={activeTrip}/>

