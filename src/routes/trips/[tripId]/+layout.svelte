<script lang='ts'>
    import { tripsStore } from '$lib/stores/tripsStore';
    import { page } from '$app/state';
    import type { Trip } from '$lib/classes/classes';
    import { onMount } from 'svelte';
    let { children } = $props();
    let tripId: string | undefined = page.params.tripId;
    import img from '$lib/images/trip.png'


    let trip: Trip = $derived({})
    console.log('data', tripId)
    
    onMount(() => {
        trip = $tripsStore.filter(t => t.id === tripId)[0]
    });

</script>

<div class="flex h-full">
    <div
    class="flex min-w-60 bg-right bg-cover bg-no-repeat bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 bg-blend-soft-light items-start pt-4 justify-center text-shadow-lg text-2xl font-bold text-white"
    style="background-image: url({img}); background-blend-mode: soft-light;">
    <h1>{trip.destination}</h1></div>
    {@render children()}
</div>