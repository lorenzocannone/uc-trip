<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { vibesStore, initVibesStore, deleteVibe, fetchVibes } from '$lib/stores/vibesStore';
  import { tripsStore } from '$lib/stores/tripsStore';
  import Sidebar from '../../VibeSidebar.svelte';
  import vibeTypes from '$lib/data/vibeTypes.json';
  import { MoonStar, EggFried, Sandwich, Utensils, Wine, FlameKindling, MapPin, Trash2, Pencil, Eye } from '@lucide/svelte';
  import Plus from '@lucide/svelte/icons/plus';
  import type { Trip, Vibe } from '$lib/classes/classes';

  // Variabili locali
  let sidebar_show = $state(false)
  let update = $state(false)
  let activeVibe: Vibe | undefined = $state(undefined);
  let activeVibeTypes: string[] = $state(['activity', 'breakfast', 'lunch', 'dinner', 'happy hour'])
  
  // Estrai il tripId dalla route (usando il $page store in maniera reattiva)
  let tripId: string | undefined = page.params.tripId;

  // Recupera il trip corrente (se presente nello store dei trips)
  let currentTrip: any = $state({})
  
  
  // Variabile locale per le vibes (si aggiornano automaticamente dal vibeStore)
  let vibes: Vibe[] = $derived($vibesStore)

  $effect(() => {
		if (update === true) {
      fetchVibes(tripId)
      update = false
    }
	});

  // All'onMount, se esiste un tripId, inizializza il vibesStore e carica il trip corrente dallo store dei trips
  onMount(async () => {
    if (tripId) {
      await initVibesStore(tripId);
      currentTrip = $tripsStore.filter(t => t.id === tripId)[0]
      console.log(vibes)
    }
  });

  /**
   * Apre la sidebar ed imposta la vibe attiva.
   * Se in modalità "current" imposta l'oggetto preso dal filtro, altrimenti crea un placeholder.
   * Puoi aggiornare l'ordine delle vibes invocando updateVibes.
   */
  function sidebarOpener(selectedVibe: Vibe | undefined, day: number | undefined, day_position: number | undefined) {
    let daysToAdd = day ? day * 24 * 60 * 60 * 1000 : 0
    let date = new Date(new Date(currentTrip.first_night).getTime() + daysToAdd)
    let activityDay = day ? day + 1 : 1
		activeVibe = selectedVibe? selectedVibe : { date: date, day: activityDay, day_position: day_position, trip_id: tripId}

    let consumedDayTypes = vibes.filter(v => v.day == activityDay && v.type != 'night' && v.type != 'activity').map(v => v.type)
    activeVibeTypes = activeVibeTypes.filter(type => !consumedDayTypes.includes(type));
		if (sidebar_show == false) { sidebar_show = true }
  }

  function handleDeleteVibe(vibeId: string | undefined) {
    deleteVibe(vibeId)
    update == true
  }
</script>

<!-- Layout della pagina: ogni riga corrisponde a un day del trip -->
<div class="grid grid-cols-11 content-center gap-6">
  {#if currentTrip}
    {#each Array(currentTrip.days || 0) as _, i}
      <!-- Colonna dedicata al Day -->
      <div class="content-center col-span-3 justify-self-end">
        <div class="flex grow flex-row h-full">
          <div class="sticky top-20 self-center px-2">
            Day {i + 1}
          </div>
          <div>
            <span class="px-2 vr border-l-4"></span>
          </div>
        </div>
      </div>
      <!-- Colonna per le vibes relative al day corrente -->
      <div class="content-center grid grid-cols-subgrid col-span-6 justify-self-end gap-4">
        <!-- Bottone per inserire una vibe in posizione "previous" -->
        <div class="content-center grid grid-cols-subgrid col-span-6 justify-self-end opacity-0 hover:opacity-100 transition">
          <div class="col-span-1 content-center">
            <button 
              onclick={() => sidebarOpener(undefined, i, 0)} 
              class="w-8 h-8 flex text-white items-center justify-center rounded-full border border-white bg-linear-to-tr from-cyan-300 to-green-300 45-deg text-slate-500 shadow shrink-0">
              <Plus/>
            </button>
          </div>
        </div>
        <!-- Lista delle vibes per il day (filtrando per day) -->
        {#each vibes
          .filter(v => v.day === i + 1)
          .sort((a, b) => {
            if (!a.time && b.time) return 1;
            if (!b.time && a.time) return -1;
            return a.time - b.time;
          }) as vibe (vibe.id)}
          <div class="col-span-1 content-center">
            <div class="flex text-white items-center justify-center w-10 h-10 rounded-full border border-white {vibeTypes.find(vt => vt.type === vibe.type)?.class} text-slate-500 shadow shrink-0">
              {#if vibe.type === 'breakfast'}
                <EggFried />
              {:else if vibe.type === 'lunch'}
                <Sandwich />
              {:else if vibe.type === 'happy hour'}
                <Wine />
              {:else if vibe.type === 'dinner'}
                <Utensils />
              {:else if vibe.type === 'activity'}
                <FlameKindling />
              {:else}
                <MoonStar />
              {/if}
            </div>
          </div>
          <div class="card col-span-5 bg-white grid grid-cols-subgrid p-4 rounded border border-slate-200 shadow">
            <div class="col-span-4">
              <div class="flex items-center justify-between mb-1">
                <div class="text-sm font-bold text-slate-900">
                  {vibe.name?.toUpperCase()} 
                  <span class="font-light ml-4 italic text-xs text-primary-500">
                    {vibe.date}
                  </span>
                </div>
              </div>
              <div class="flex flex-row items-center gap-1 text-slate-500">
                <MapPin size={16} class="self-center"/>
                {vibe.location}
              </div>
              <h3 class="italic text-xs capitalize text-slate-500">{vibe.type}</h3>
              <h4 class="font-light text-slate-500 line-clamp-2">{vibe.description}</h4>
            </div>
            <div class="flex flex-col justify-between">
              <button onclick={() => sidebarOpener(vibe, vibe.day, vibe.day_position)} class="self-end">
                {#if currentTrip.role == 'owner'}
                  <Pencil size={16} class="text-slate-500"/>
                {:else}
                  <Eye size={16} class="text-slate-500"/>
                {/if}
              </button>
              {#if currentTrip.role == 'owner'}
                <button onclick={() => handleDeleteVibe(vibe.id)} class="self-end">
                  <Trash2 size={16} class="text-slate-500"/>
                </button>
              {/if}
            </div>
          </div>
          <!-- Bottone per inserire una vibe in posizione "next" -->
          
        {/each}
      </div>
    {/each}
  {:else}
    <p>Caricamento vibes...</p>
  {/if}
</div>

<Sidebar bind:show={sidebar_show} bind:update={update} role={currentTrip.role} availableVibeTypes={activeVibeTypes} vibe={activeVibe ? activeVibe : {}} availableVibers={currentTrip? currentTrip.vibers : []} />
