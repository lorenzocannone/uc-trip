<script lang='ts'>
    import { Euro, SpellCheck, MapPin, Link, Clock, UserPlus, X, LetterText } from '@lucide/svelte';
    import { fly } from 'svelte/transition';
    import MultiSelect from 'svelte-multiselect';
    import ViberListElement from './ViberListElement.svelte';
    import { addVibe, deleteVibe, updateVibe } from '$lib/stores/vibesStore';
    import Modal from './Modal.svelte';


    let { show = $bindable(), update = $bindable(), vibe, availableVibers, availableVibeTypes, role } = $props();

    const currencies = ['EUR', 'UDS', 'GBP', 'JPY', 'CNY', 'BRL', 'ISK', 'PEN']
    const vibeType = ['activity', 'breakfast', 'lunch', 'happy hour', 'dinner']
    const activeVibeType = 'bg-primary-100-900'
    const inactiveVibeType = 'preset-filled-surface-100-900'
    let selectedVibers = $derived(vibe?.vibers? vibe.vibers : [])
    let notifications = $state(false)
    const isNewVibe = $derived(!vibe.id)

    let showModal = $state(false);
    let notify = $state(true)
    let callable = $state()
    let modalMode = $state('create')

    function handleOpenModal(callableFunc: unknown, mode: string) {
      callable = callableFunc
      modalMode = mode
      showModal = true
    }

    function preparVibe() {
      vibe.vibers = selectedVibers
      return JSON.parse(JSON.stringify(vibe))
    }

    async function handleCreateVibe() {
      const vibeToSend = preparVibe()
      await addVibe(vibeToSend)
      update = true
      showModal = false
    }

    async function handleDeleteVibe() {
      await deleteVibe(vibe.id)
      update = true
      showModal = false
    }

    async function handleUpdateVibe() {
      const vibeToSend = preparVibe()
      await updateVibe(vibeToSend)
      update = true
      showModal = false
    }



    function handleSubmit(event: SubmitEvent) {
      event.preventDefault(); // <-- fondamentale
      vibe.vibers = selectedVibers
      const vibeToSend = JSON.parse(JSON.stringify(vibe))
      if (isNewVibe) {
        console.log('new trip', vibeToSend)
        addVibe(vibeToSend)
      }
      else {
        console.log('about to update', vibeToSend)
      }
      update = true
    }


    
</script>

{#if show}
  <nav transition:fly={{x: 600, opacity: 1}} class="drop-shadow-xl">
    <button class="text-primary-500 p-1 rounded-sm mb-4 hover:bg-surface-100 trasition" onclick={() => show? show = !show : show}>
      <X size={24} />
    </button>
    <form class="w-full space-y-8">
      
      <!-- Vibe Type -->
       {#if vibe.type != 'night'}
        <div class="rounded-container flex w-full gap-1 overflow-hidden justify-evenly">
          {#each availableVibeTypes as vt}
            <button
              type="button"
              disabled={role == 'viewer'}
              class={`card rounded-4 p-4 py-8 min-w-24 text-center ${vibe.type == vt ? activeVibeType : inactiveVibeType}`}
              onclick={() => vibe.type = vt}
              >
              {vt}
            </button>
          {/each}
        </div>
         <div class="input-group grid-cols-[auto_1fr_auto]">
          <div class="ig-cell preset-tonal">
          <Clock size={16} />
        </div>
        <input disabled={role == 'viewer'} class="ig-input" type="time" placeholder="TIME" bind:value={vibe.time} required/>
      </div>
      {/if}
      <!-- Name -->
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <SpellCheck size={16} />
        </div>
        <input disabled={role == 'viewer'} class="ig-input" type="text" placeholder="Name" bind:value={vibe.name} required/>
      </div>
       <!-- Description -->
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <LetterText size={16} />
        </div>
        <input disabled={role == 'viewer'} class="ig-input" type="text" placeholder="Description" bind:value={vibe.description}/>
      </div>
      <!-- Reference -->
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <Link size={16} />
        </div>
        <input disabled={role == 'viewer'} class="ig-input" type="text" placeholder="Reference" bind:value={vibe.reference}/>
      </div>
      <!-- Estimated Cost -->
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <Euro size={16} />
        </div>
        <input disabled={role == 'viewer'} class="ig-input" type="text" placeholder="Estimated cost" bind:value={vibe.estimated_cost}/>
        <select class="ig-select">
          {#each currencies as curr}
          <option>{curr}</option>
          {/each}
        </select>
      </div>
      <!-- Location -->
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <MapPin size={16} />
        </div>
        <input disabled={role == 'viewer'} class="ig-input" type="search" placeholder="Location" bind:value={vibe.location}/>
      </div>
      <!-- Vibers -->
      <div class="input-group overflow-visible grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
          <UserPlus size={16} />
        </div>
        <div class="flex-grow">
          <MultiSelect
              id="vibers"
              disabled={role == 'viewer'}
              options={availableVibers}
              placeholder="Select Vibers"
              bind:selected={selectedVibers}
            >
            {#snippet children({ idx, option })}
              <ViberListElement {option}/>
            {/snippet}
          </MultiSelect>
        </div>
      </div>
      {#if role == 'owner'}
        {#if isNewVibe}
        <button class="btn bg-primary-500 text-surface-50" onclick={() => handleOpenModal(handleCreateVibe, 'create')}>Create</button>
        {:else}
        <div class="flex gap-2">
          <button class="btn bg-primary-500 text-surface-50" onclick={() => handleOpenModal(handleUpdateVibe, 'update')}>Update Vibe</button>
          <button class="btn bg-error-500 text-surface-50" onclick={() => handleOpenModal(handleDeleteVibe, 'delete')}>Delete Vibe</button>
        </div>
        {/if}
      {/if}
    </form>
  </nav>
{/if}

<Modal bind:showModal bind:notify callable="{callable}" mode={modalMode} type={'vibe'} elemId={vibe.id} name={vibe.name}>

</Modal>

		
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