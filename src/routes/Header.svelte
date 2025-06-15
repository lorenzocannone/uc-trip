<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import Calendar from '@lucide/svelte/icons/calendar';
  import CircleUser from '@lucide/svelte/icons/circle-user';
  import logo from '$lib/images/logo.png'
</script>

<header class="bg-surface-100 shadow-md">
	<AppBar>
  {#snippet lead()}
  {/snippet}
  {#snippet trail()}
  {/snippet}
  <a href="/"><img src={logo} class="w-40" alt='VibeCheck'></a>
</AppBar>
</header>

<style>
	
</style>
