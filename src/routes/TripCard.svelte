<script>
    import {CalendarCheck2, Pencil, Trash2, Eye, Bolt } from '@lucide/svelte'
    import imgSrc from '$lib/images/trip.png'
    let {trip, activeTrip = $bindable()} = $props()
</script>


<div class="relative card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800 block max-w-md divide-y overflow-hidden">
    <header>
        <div class="absolute top-2 right-2 text-white">
            {#if trip.role == 'viewer'}
                <Eye size=24 class="drop-shadow-xs/60"/>
            {:else}
                <Bolt size=24 class="drop-shadow-xs/60"/>
            {/if}
        </div>
        <img src={imgSrc} class="w-full" alt="banner" />
        <h3 class="p-4 h3">{trip.destination}</h3>
    </header>
    <article class="flex -space-x-2 overflow-hidden p-4">
        
    {#each trip.vibers as viber}
    <div class="flex ">
        <img src={viber.vibepic_url} class="border-2 border-surface-100 rounded-full w-10 h-10" alt={viber.label}/>
    </div>
    {/each}
    </article>
    <footer class="p-4">
        <small class="opacity-60">
            <div class="flex gap-4 justify-between">
                <div class="flex gap-2">
                <CalendarCheck2 size=16/>
                {new Date(trip.first_night).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long"
                            })} - 
                {new Date(trip.last_night).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long"
                            })}
                </div>
                <div class="font-bold">{trip.days} days</div>
            </div>
        </small>
    </footer>
</div>