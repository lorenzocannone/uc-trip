<script lang="ts">
  import IconArrowLeft from '@lucide/svelte/icons/arrow-left';
  import IconArrowRight from '@lucide/svelte/icons/arrow-right';
  import MoonStar from '@lucide/svelte/icons/moon-star';
  import Plus from '@lucide/svelte/icons/plus';
  import Sidebar from '../Sidebar.svelte'
	let sidebar_show = $state(false)

  // Source Data
  const vibes = [
    { id: 0, type: 'night', date: '01/04/2026', description: 'Hotel Pasada Margherita', location: 'Lima', comment: '', link: 'http' },
    { id: 1, type: 'breakfast', date: '02/04/2026', description: 'Hotel Pasada Margherita', location: 'Lima', comment: '', link: 'http' },
    { id: 2, type: 'activity', date: '02/04/2026', description: 'Machu Picchu', location: 'Lima', comment: '', link: 'http' },
    { id: 3, type: 'dinner', date: '02/04/2026', description: 'Central', location: 'Lima', comment: '', link: 'http' },
    { id: 4, type: 'night', date: '02/04/2026', description: 'Hotel Pasada Margherita', location: 'Lima', comment: '', link: 'http' },
    { id: 5, type: 'night', date: '03/04/2026', description: 'Hotel Pasada Margherita', location: 'Lima', comment: '', link: 'http' }
  ];

  // Reactive
  let currentStep = $state(0);
  const isFirstStep = $derived(currentStep === 0);
  const isLastStep = $derived(currentStep === vibes.length - 1);

  /** Determine if on the current step. */
  function isCurrentStep(index: number) {
    return currentStep === index;
  }

  /** Jump to a particular step. */
  function setStep(index: number) {
    currentStep = index;
  }

  /** Progress to the previous step. */
  function prevStep() {
    currentStep--;
  }

  /** Progress to the next step. */
  function nextStep() {
    currentStep++;
  }
</script>

<!-- <div class="w-full">
  <div class="space-y-8">
    <div class="relative">
      <div class="flex justify-between items-center gap-4">
        {#each steps as step, i}
          <button
            class="btn-icon btn-icon-sm rounded-full {isCurrentStep(i) ? 'preset-filled-primary-500' : 'preset-filled-surface-200-800'}"
            onclick={() => setStep(i)}
            title={step.label}
          >
            <span class="font-bold">{i + 1}</span>
          </button>
        {/each}
      </div>
      <hr class="hr !border-surface-200-800 absolute top-[50%] left-0 right-0 z-[-1]" />
    </div>
    {#each steps as step, i (step)}
      {#if isCurrentStep(i)}
        <div class="card bg-surface-100-900 p-10 space-y-2 text-center">
          <h2 class="h3">{step.label}</h2>
          <p>{step.description}</p>
        </div>
      {/if}
    {/each}
  </div>
</div> -->




<div class="grid grid-cols-11 content-center gap-4">
  {#each vibes as vibe, i}
    <!-- Item #1 -->
        {#if vibe.type === 'night'}
            <!-- Card -->
            <div class="card col-span-5 bg-white p-4 rounded border border-slate-200 shadow">
                <div class="items-center justify-between space-x-2 mb-1">
                    <div class="font-bold text-slate-900">{vibe.description}</div>
                    <time class="font-caveat font-medium text-indigo-500">{vibe.date}</time>
                </div>
                <div class="text-slate-500">{vibe.location}</div>
            </div>
            <!-- Icon -->
             <div class="col-span-1 content-center">
            <div class="flex text-white items-center justify-center w-10 h-10 rounded-full border border-white bg-linear-to-tr from-indigo-900 to-sky-600 45-deg text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <MoonStar></MoonStar>
            </div>
            </div>
            <div class="content-center col-span-5 items-center justify-center">
                {vibe.date}
            </div>
        {:else}
         <!-- Card -->
            <div class="content-center col-span-5 justify-self-end">
                {vibe.date}
            </div>
            <!-- Icon -->
             <div class="col-span-1 content-center">
            <div class="flex text-white items-center justify-center w-10 h-10 rounded-full border border-white bg-linear-to-tr from-indigo-900 to-sky-600 45-deg text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <MoonStar></MoonStar>
            </div>
            </div>
            <div class="card col-span-5 bg-white p-4 rounded border border-slate-200 shadow">
                <div class="items-center justify-between space-x-2 mb-1">
                    <div class="font-bold text-slate-900">{vibe.description}</div>
                    <time class="font-caveat font-medium text-indigo-500">{vibe.date}</time>
                </div>
                <div class="text-slate-500">{vibe.location}</div>
            </div>
      {/if}
      <div class="col-span-11 grid grid-cols-subgrid opacity-0 hover:opacity-100 transition">
      <div class="col-span-5">
      </div>
      <!-- Icon -->
      <div class="col-span-1 content-center">
        <button  onclick={() => sidebar_show = !sidebar_show} class="w-10 h-10 flex text-white items-center justify-center rounded-full border border-white bg-linear-to-tr from-indigo-900 to-sky-600 45-deg text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
          <Plus/>
        </button>
      </div>
      <div class="col-span-5">
      </div>
      </div>
    {/each}
</div>

<Sidebar bind:show={sidebar_show} />
