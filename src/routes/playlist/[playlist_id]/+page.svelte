<script lang="ts">
    import type { PageData } from './$types';
    import SongElement from '../../../compontents/SongElement.svelte';
    import Bin from "svelte-material-icons/Delete.svelte"
    
    export let data: PageData;
    const playlist = data.playlist
    let SongDIV: HTMLDivElement
    let madeBy = ""

    if (playlist){
        playlist.users.forEach(user => {
            console.log(user)
            madeBy += madeBy.length > 0?",":"" + user.name
        })
    }
</script>

{#if playlist}
<div class="relative w-[15%] aspect-square top-20 left-20">
    <img src="../image/playlist/{playlist.id}" alt="playlist img" class="absolute rounded-3xl bg-b2 w-[100%] h-[100%]">
    <p class="absolute left-[110%] top-3 text-white text-4xl font-bold w-96">{playlist.name}</p>
    <p class="absolute left-[110%] top-12 text-white text-2xl font-bold w-96 opacity-70">made by {madeBy}</p>
    <p class="absolute left-[110%] top-28 text-white text-2xl font-bold w-96 opacity-70">{playlist.description}</p>
</div>

<div class="SongList" bind:this={SongDIV}>
    {#each playlist.songs as data, index}
        <SongElement data={playlist.songs} songIndex={index} allowRemove={playlist.id}></SongElement>
    {/each}
</div>

<button on:click={async () => {await fetch(`/playlist/delete/${playlist.id}`); document.location.href = "/songs"}} class="absolute right-20 top-20 h-10 aspect-square"><Bin size="100%" color="rgb(255,55,55)"></Bin></button>

<style>
    .SongList {
        position: relative;
        left: 50%;
        top: 90px;
        transform: translate(-50%, 0%);
        height: 50%;
        width: 90%;
        background-color: rgba(0,0,0,0);
        overflow: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
    }
    .SongList::-webkit-scrollbar {
        width: 10px;
    }
    .SongList::-webkit-scrollbar-thumb {
        background-color: white;
    }
</style>
{/if}