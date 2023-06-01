<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    const user = data.user
</script>

{#if user}
<div class="relative w-[15%] aspect-square top-20 left-20">
    <img src="../image/playlist/-1" alt="playlist img" class="absolute rounded-md w-[100%] h-[100%]">
    <p class="absolute left-[110%] top-3 text-white text-4xl font-bold w-96">{user.name}</p>
</div>
{/if}