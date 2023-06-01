<script lang="ts">
    import {onMount} from 'svelte'
    import {Spring} from '../modules/spring'
    import Pause from "svelte-material-icons/pause.svelte"
    import Play from "svelte-material-icons/play.svelte"
    import Menu from "svelte-material-icons/Menu.svelte"
    import buttonList from '../modules/buttonList'
    import State from '../modules/state'
    import {notifications} from '../notifications'
    let time = 0
    export let isPlaying = false
    export let allowRemove = -1
    export let data: {
        id: number,
        name: string,
        description: string,
        users: Array<any>,
    }[] = []
    export let songIndex = 0
    export let extraFunction = (songData: any) => {}
    let baseURL: string
    let imageURL: string = ""
    let madeBy = "by "
    let song = data[songIndex]
    let SongElement
    //console.log(song)

    const optData = [
        allowRemove>-1?{
            text: "Remove from playlist",
            callback: async () => {
                await fetch(`/playlist/remove/${allowRemove}/${song.id}`)
                document.location.href = document.location.href
            }
        }:{
            text: "Add to playlist",
            callback: () => {
                State.playlistAdd = true
                State.playlistAddID = song.id
                console.log("ADDING")
                notifications.info('Select a playlist to add the song to!', 1000 * 2)
            }
        },
        {
            text: "Favourite",
            callback: () => {console.log("HELLo")}
        },
        {
            text: "Listen to later",
            callback: () => {console.log("HELLo")}
        },
    ]
    let owner = false
    song.users.forEach(user => {
        if (user.id == State.userID){
            owner = true
        }
    })
    if (owner || State.isAdmin){
        optData.push({
            text: "Delete song",
            callback: async () => {
                await fetch(`/song/delete/${song.id}`)
                document.location.href = document.location.href
            }
        })
    }

    function MadeBY(){
        song.users.forEach(user => {
            madeBy += madeBy.length > 3?",":"" + user.name
        })
    }
    MadeBY()
    //console.log("MADE BY =", madeBy)
    let currSong: {
        id: number,
        name: string,
        description: string,
        users: Array<any>,
    }
    function doFrame(milliTime: number){
        window.requestAnimationFrame(doFrame)
        const localTime = milliTime / 1000
        if (!time){
            time = localTime-.01
        }
        /*console.log(lastIndex, songIndex, data)
        if (lastIndex != songIndex){
            console.log("ID CHANGED!")
            lastIndex = songIndex
            song = data[songIndex]
            MadeBY()
        }*/
        const dt = localTime - time
        time = localTime
        currSong = State.songList[0]
        if (isPlaying && currSong && currSong.id != song.id){
            isPlaying = false
        }
        if (State.isPlaying && currSong && currSong.id == song.id){
            isPlaying = true
        } else if (!State.isPlaying) {
            isPlaying = false
        }
    }

    function toggle(){
        
        if (!isPlaying) {
            console.log("SET", song.id)
            isPlaying = true
            extraFunction(data)
            State.isPlaying = isPlaying
            State.playlistID = -1

            const songList = []
            for (let i = songIndex; i<data.length; i++){
                const song = data[i]
                songList.push(song)
            }
            if (songIndex > 0){
                for (let i = 0; i<songIndex; i++){
                    const song = data[i]
                    songList.push(song)
                }
            }
            console.log(songList)
            if (State.songList[0] == undefined || State.songList[0].id != song.id){
                State.songChanged = true
            } else {
                console.log("SAME")
            }
            State.songList = songList
        } else {
            isPlaying = false
            State.isPlaying = isPlaying
        }
    }

    onMount(() => {
        baseURL = document.location.origin
        imageURL = baseURL + "/image/" + song.id.toString()
        window.requestAnimationFrame(doFrame)
    })

    let moreButton: HTMLButtonElement
</script>

<div class="SongElement" bind:this={SongElement}>
    <button on:click={toggle} class="ml-8 z-10 flex justify-start items-center h-[80%] bg-b1 rounded-full">
        {#if (currSong && currSong.id == song.id && isPlaying)}
            <Pause size="100%" color="rgb(255,255,255)"></Pause>
        {:else}
            <Play size="100%" color="rgb(255,255,255)"></Play>
        {/if}
    </button>
    <img src={imageURL} class="h-[80%] rounded-md aspect-square bg-b1 text-white ml-5" alt="song">
    <h1 class="text-white  ml-5 text-xl">{song.name}</h1>
    <div style="--height: {SongElement!=undefined?SongElement.clientHeight:100}px" class="absolute z-10 left-[50%] w-[50%] h-[var(--height)] flex flex-row-reverse justify-start items-center">
        
        <button bind:this={moreButton} on:click={() => {buttonList.toggle(optData)}} class="h-[100%] mr-10 aspect-square flex items-center justify-center">
            <!-- <div class="absolute flex items-start justify-center">
                <ButtonList enabled={moreOpened} options={[{text: "test", callback: () => {console.log("Hello")}}]}/>
            </div> -->
            <Menu size="70%" color="rgb(255,255,255)"></Menu>
        </button>
        {#if song.users.length > 0}
        <p class="text-gray-700 text-md flex flex-nowrap">
            by
            {#each song.users as user, index}
                <a href="/user/{user.id}" class="hover:underline hover:text-white transition-all ml-1">{user.name}</a>
                {#if song.users.length>index+1}
                    <p>,</p>
                {/if}
            {/each}
        </p>
        {/if}
    </div>
</div>
<!-- <div bind:this={CubeDIV} class="CubeDIV" style="--rotation: {rotation}deg; --width: {pixelWidth/2}px;">
    <div class="Cube a">
        <button on:click={toggle} class="ml-8 z-10 flex justify-start items-center h-[80%] bg-b1 rounded-full">
            {#if (currSong && currSong.id == song.id && isPlaying)}
                <Pause size="100%" color="rgb(255,255,255)"></Pause>
            {:else}
                <Play size="100%" color="rgb(255,255,255)"></Play>
            {/if}
        </button>
        <img src={imageURL} class="h-[80%] rounded-md aspect-square bg-b1 text-white ml-5" alt="song">
        <h1 class="text-white  ml-5 text-xl">{song.name}</h1>
        <div class="absolute z-10 left-[50%] w-[50%] h-[100%] flex flex-row-reverse justify-start items-center">
            
            <button bind:this={moreButton} on:click={() => {buttonList.toggle(optData)}} class="h-[100%] mr-10 aspect-square flex items-center justify-center">
                <Menu size="50%" color="rgb(255,255,255)"></Menu>
            </button>
            {#if song.users.length > 0}
            <p class="text-gray-700 text-md flex flex-nowrap">
                by
                {#each song.users as user, index}
                    <a href="/user/{user.id}" class="hover:underline hover:text-white transition-all ml-1">{user.name}</a>
                    {#if song.users.length>index+1}
                        <p>,</p>
                    {/if}
                {/each}
            </p>
            {/if}
        </div>
    </div>
    <div class="Cube b"></div>
    <div class="Cube c"></div>
    <div class="Cube d"></div>
</div> -->

<style>

    .SongElement {
        margin: 20px;
        width: 100%;
        height: 70px;
        background-color: rgb(44,44,44);
        box-shadow: 0px 0px 19px 0px rgba(0,0,0,0.75);
        display: flex;
        align-items: center;
        /* justify-content: center; */
    }
</style>