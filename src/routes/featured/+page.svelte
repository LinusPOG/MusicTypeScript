<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from "svelte"
    import State from '../../modules/state'
    import Play from "svelte-material-icons/play.svelte"
    import Pause from "svelte-material-icons/pause.svelte"
    
    export let data: PageData;
    let Categories: {text: string, playlists: {
        name: string,
        id: number,
        description: string,
        songs: {name: string, id: number}[],
        users: {name: string, id: number}[]
    }[]}[] = []
    let baseURL = ""

    async function test_load(){
        for (let i = 0; i < 1; i++){
            const playlistData = await fetch("/featured").then(res => { return res.json() }).catch(err => {
                console.log("Error..")
                console.log(err)
            })
            console.log("PLAYLISTS =", playlistData)
            Categories.push({
                text: `EXAMPLE ${i}`,
                playlists: playlistData,
            })
            Categories = Categories
        }
    }

    let cooldown = false
    async function Toggle(playlistData: {
        name: string,
        id: number,
        description: string,
        songs: {name: string, id: number}[],
        users: {name: string, id: number}[]
    }){
        console.log("TOGGLE")
        cooldown = true
        setTimeout(() => {
            cooldown = false
        }, 100);
        //console.log(playlistData)
        if (State.playlistID == playlistData.id && State.isPlaying){
            State.isPlaying = false
            console.log("DISABLE")
        } else {
            if (State.playlistID != playlistData.id){
                State.playlistID = playlistData.id

                const data = await fetch(`/playlist/${playlistData.id}?full=true`).then(res => res.json())
                const songList = data.songs
                //console.log(data)
                State.songChanged = true
                State.songList = songList
            }
            State.isPlaying = true
        }
    }

    function Go(playlist_id: number){
        if (cooldown) return;
        console.log("GO")
        document.location.href = `/playlist/${playlist_id}`
    }

    let isPlaying = false
    onMount(() => {
        baseURL = document.location.origin
        test_load()

        function doFrame(){
            window.requestAnimationFrame(doFrame)
            isPlaying = State.isPlaying
        }
        window.requestAnimationFrame(doFrame)
    })
</script>

<div class="absolute overflow-y-auto overflow-x-hidden left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[100%] h-[95%] block block-col block-nowrap">
    {#each Categories as category, index}
        <p class="text-2xl text-white font-bold pb-4 ml-10">{category.text}</p>
        <div class="overflow-x-auto overflow-y-hidden mb-20 w-[100%] h-56 bg-[rgb(22,22,22)] rounded-md flex flex-row items-center">
            {#each category.playlists as playlist, index2}
                <button on:click={() => {Go(playlist.id)}} class="h-[95%] group categoryCard transition-all aspect-[10/12] ml-5 rounded-xl bg-[rgb(11,11,11)]">
                    <div class="h-[100%] transition-all w-[100%] bg-[rgba(22,22,22,0)] block">
                        <img class="relative w-[80%] left-[50%] translate-x-[-50%] aspect-square rounded-md mt-2" alt="---" src="image/playlist/0">
                        <p class="relative w-[80%] left-[50%] translate-x-[-50%] text-white font-bold text-md">{playlist.name}</p>
                        <p class="relative w-[80%] left-[50%] translate-x-[-50%] text-white font-semibold text-sm opacity-30">{playlist.description}</p>
                        
                    </div>
                    <div class="transition-all hoverDiv h-[100%] z-10 w-[100%] translate-y-[-100%] bg-[rgba(22,22,22,0)] opacity-0 group-hover:bg-[rgba(22,22,22,.3)] group-hover:opacity-100 block">
                        <button on:click={() => {Toggle(playlist)}} class="relative playButton transition-all rounded-full h-[20%] aspect-square bg-b3 left-[70%] top-[70%] group-hover:top-[50%] flex justify-center items-center">
                            {#if (isPlaying && State.playlistID == playlist.id)}
                                <Pause size="100%" color="rgb(255,255,255)"></Pause>
                            {:else}
                                <Play size="100%" color="rgb(255,255,255)"></Play>
                            {/if}
                        </button>
                    </div>
                </button>
            {/each}
        </div>
    {/each}
</div>

<style>
    .categoryCard {
        transform-style: preserve-3d;
        transform: perspective(3000px);
    }
    .categoryCard:hover {
        transform: perspective(400px) rotateX(15deg);
    }
    .playButton {
        transform-style: preserve-3d;
    }
</style>