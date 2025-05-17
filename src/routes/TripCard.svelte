<script>
    import {CalendarCheck2} from '@lucide/svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
    const imgSrc ='https://camminoinca.com/wp-content/uploads/2022/02/machu-picchu-ci.jpg';
</script>


<a
    href="/trips"
    class="card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800 block max-w-md divide-y overflow-hidden"
    >
    <header>
        <img src={imgSrc} class="aspect-[21/9] w-full" alt="banner" />
        <h3 class="px-2 h3">Perù</h3>
    </header>
    <footer class="flex items-center justify-between gap-4 p-4">
        <small class="opacity-60"><div class="flex items-center gap-2"><CalendarCheck2 size=16/> 01/04/2026-16/04/2026</div></small>
        <small class="opacity-60"><Avatar classes="p-2" rounded="rounded-full" background="preset-filled-primary-500" name="Alex Singh"></Avatar></small>
    </footer>
</a>