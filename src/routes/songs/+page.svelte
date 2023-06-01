<script lang="ts">
    import SongElement from '../../compontents/SongElement.svelte';
    import type { PageData } from './$types';
    import {onMount} from 'svelte'
    
    export let data: PageData;
    const SongList = data.songs
    let SongDIV: HTMLDivElement
    let idleRotation = 10

    /*for (let i=0; i<40; i++){
        SongList.push("EXAMPLE" + i.toString())
    }*/
    onMount(() => {
        SongDIV.onmouseenter = () => {
            idleRotation = 0
        }
        SongDIV.onmouseleave = () => {
            idleRotation = 10
        }
    })
</script>

<b class="text-3xl text-white absolute left-20 top-3">SONGS</b>
<div class="SongList" bind:this={SongDIV}>
    {#each SongList as data, index}
        <SongElement data={SongList} songIndex={index}></SongElement>
    {/each}
</div>

<style>
    .SongList {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        height: 80%;
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