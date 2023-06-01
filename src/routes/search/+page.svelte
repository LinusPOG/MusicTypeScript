<script lang="ts">
    import type { PageData } from './$types';
    import SearchIcon from 'svelte-material-icons/SearchWeb.svelte'
    import SongElement from '../../compontents/SongElement.svelte';
    
    export let data: PageData;
    let SongList: any = []
    let input: HTMLInputElement
    let SongDIV: HTMLDivElement

    async function search(){
        const searchText = input.value
        console.log("SEARCH =", searchText)
        SongList = []
        SongList = await fetch("/search/" + searchText).then(res => {
            return res.json()
        }).catch(err => {
            console.log(err)
            return []
        })
        console.log(SongList)
    }
</script>

<div class="absolute left-1/2 top-10 w-1/2 h-10 bg-b2 rounded-full translate-x-[-50%] flex flex-row items-center">
    <button on:click={search} class="h-[100%] aspect-square ml-1 flex items-center justify-center opacity-70"><SearchIcon size="90%" color="rgb(255,255,255)"></SearchIcon></button>
    <div class="h-[90%] bg-white w-1 rounded-full opacity-70"/>
    <input bind:this={input} on:input={search} type="text" class="w-[100%] h-[100%] bg-transparent ml-2 opacity-70 text-white text-xl">
</div>

<div class="SongList" bind:this={SongDIV}>
    {#each SongList as data, index}
        <SongElement data={SongList} songIndex={index}></SongElement>
    {/each}
</div>

<style>
    .SongList {
        position: absolute;
        left: 50%;
        top: 90px;
        transform: translate(-50%, 0%);
        height: 70%;
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