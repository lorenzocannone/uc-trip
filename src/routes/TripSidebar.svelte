<script lang='ts'>
    import { X, MapPin, PlaneLanding, PlaneTakeoff, UserPlus } from '@lucide/svelte';
    import { MultiSelect } from 'svelte-multiselect'
    import { fly } from 'svelte/transition';
    import ViberListElement from './ViberListElement.svelte';
    import { addTrip, updateTrip, deleteTrip } from '$lib/stores/tripsStore';
    import { vibersStore } from '$lib/stores/vibersStore';
    import { goto } from '$app/navigation';
    import Modal from './Modal.svelte';

    let { show = $bindable(), update = $bindable(), trip } = $props();
    const isNewTrip = $derived(!trip.id)
    console.log('init sidebar:', trip)
    let selectedVibers = $derived(trip.vibers? trip.vibers : [])
    let showModal = $state(false);
    let notify = $state(true)
    let callable = $state()
    let modalMode = $state('create')


    function handleOpenModal(callableFunc: unknown, mode: string) {
      callable = callableFunc
      modalMode = mode
      showModal = true
    }

    function prepareTrip() {
      const msDiff = new Date(trip.last_night).getTime() - new Date(trip.first_night).getTime();
      console.log('msDiff', msDiff)
      const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
      console.log('daysDiff', daysDiff)
      trip.days = daysDiff + 1
      trip.vibers = selectedVibers
      return JSON.parse(JSON.stringify(trip))
    }

    async function handleCreateTrip() {
      const tripToSend = prepareTrip()
      await addTrip(tripToSend)
      update = true
      showModal = false
    }

    async function handleDeleteTrip() {
      await deleteTrip(trip.id)
      update = true
      showModal = false
    }

    async function handleUpdateTrip() {
      const tripToSend = prepareTrip()
      await updateTrip(tripToSend)
      update = true
      showModal = false
    }

    
</script>

{#if show}
  <nav transition:fly={{x: 600, opacity: 1}} class="drop-shadow-xl"> 
    <button class="text-primary-500 p-1 rounded-sm mb-4 hover:bg-surface-100 trasition" onclick={() => show? show = !show : show}>
      <X size={24} />
    </button>
    <form class="w-full space-y-8">
      <!-- Destination -->
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <MapPin size={16} />
        </div>
        <input disabled={trip.role == 'viewer'} class="ig-input" type="search" placeholder="Destination" bind:value={trip.destination} required/>
      </div>
      <!-- First Night -->
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <PlaneLanding size={16} />
        </div>
        <input disabled={trip.role == 'viewer'} class="ig-input" type="date" placeholder="First Night" bind:value={trip.first_night} required/>
      </div>
      <!-- Last Night -->
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <PlaneTakeoff size={16} />
        </div>
        <input disabled={trip.role == 'viewer'} class="ig-input" type="date" placeholder="First Night" bind:value={trip.last_night} required/>
      </div>
      <!-- Vibers -->
      <div class="input-group overflow-visible grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <UserPlus size={16} />
        </div>
        <div class="flex-grow">
          <MultiSelect
              id="vibers"
              disabled={trip.role == 'viewer'}
              options={$vibersStore}
              placeholder="Select Vibers"
              bind:selected={selectedVibers}
            >
            {#snippet children({ idx, option })}
              <ViberListElement {option}/>
            {/snippet}
          </MultiSelect>
        </div>
      </div>
      {#if isNewTrip}
      <button class="btn bg-primary-500 text-surface-50" onclick={() => handleOpenModal(handleCreateTrip, 'create')}>Create</button>
      {:else}
      <div class="flex gap-2">
        {#if trip.role == 'owner'}
        <button class="btn bg-primary-500 text-surface-50" onclick={() => handleOpenModal(handleUpdateTrip, 'update')}>Update Trip</button>
        <a href="/trips/{trip.id}"><button class="btn bg-secondary-500 text-surface-50">Update Vibes</button></a>
        <button class="btn bg-error-500 text-surface-50" onclick={() => handleOpenModal(handleDeleteTrip, 'delete')}>Delete Trip</button>
        {:else}
        <a href="/trips/{trip.id}"><button class="btn bg-secondary-500 text-surface-50">See Vibes</button></a>
        {/if}
      </div>
      {/if}
    </form>
  </nav>
  <Modal bind:showModal bind:notify callable="{callable}" mode={modalMode} type={'trip'} elemId={trip.id} name={trip.destination}>

  </Modal>
{/if}



		
<style>
nav {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  padding: 2rem 1rem 0.6rem;
  border-left: 1px solid #aaa;
  background: #fff;
  overflow-y: auto;
	width: 600px;
}
</style>
