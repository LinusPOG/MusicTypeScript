<script lang="ts">
    export let enabled = true
    export let options: Array<{text: string, callback: any}> = []
</script>

{#if enabled}
<div class="buttonList absolute bg-gray-700 z-50 flex flex-col items-center justify-start w-24 h-96">
    {#each options as option, index}
        <div class="h-10 w-[100%]">
            <p>{option.text}</p>
            <button class="absolute w-[100%] h-[100%]" on:click={option.callback}></button>
        </div>
    {/each}
</div>
{/if}

<style>
    .buttonList {
        transform-style: flat;
    }
</style>