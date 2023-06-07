<script lang="ts">
    import { onMount } from 'svelte'
    import IconButton from '../compontents/IconButton.svelte';
    import "../app.css";
    import type { PageData } from './$types';
    import { enhance } from "$app/forms";
    import { redirect } from '@sveltejs/kit';
    import Pause from "svelte-material-icons/pause.svelte"
    import Play from "svelte-material-icons/play.svelte"
    import SkipForward from "svelte-material-icons/SkipForward.svelte"
    import SkipBackward from "svelte-material-icons/SkipBackward.svelte"
    import Home from "svelte-material-icons/Home.svelte"
    import Star from "svelte-material-icons/Star.svelte"
    import Folder from "svelte-material-icons/Folder.svelte"
    import FolderEdit from "svelte-material-icons/FolderFile.svelte"
    import Add from "svelte-material-icons/Plus.svelte"
    import Menu from "svelte-material-icons/Menu.svelte"
    import SearchWeb from "svelte-material-icons/SearchWeb.svelte"
    import Shuffle from "svelte-material-icons/Shuffle.svelte"
    import buttonList from '../modules/buttonList'
    import State from '../modules/state'
    import MusicLine from "../compontents/MusicLine.svelte"
    import Toast from '../Toast.svelte'
    import {notifications} from '../notifications'
    import { Spring } from '../modules/spring';
    export let data: PageData;
    let user = data.user
    let isPlaying = false
    let audio: HTMLAudioElement
    State.userID = user != undefined?user.id:-1
    State.isAdmin = user != undefined?user.isAdmin==true:false
    
    let USERNAME = data.username||"PLACEHOLDER"
    let SidePosition = 0
    let SideValue = true
    let fullScreen = false

    let skipping = false, wasPlaying = false
    let currTime = 0, maxTime = 0
    let audioProgress = 0
    let mousePos: {x: number, y: number}
    let songid = 0, songName = ""
    let baseURL = ""

    let playlistCreate = false
    let playlistForm: HTMLFormElement

    $:console.log(currSong ,"adsaddsa", currSong?.users)
    
    // TIME TO HHMMSS format \\
    function toHHMMSS(str: string) {
        let sec_num = parseInt(str, 10); // don't forget the second param
        if (Number.isNaN(sec_num)){
            sec_num = 0
        }
        let hours: any   = Math.floor(sec_num / 3600);
        let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds: any = sec_num - (hours * 3600) - (minutes * 60);

        if (hours>0){
            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            return hours+':'+minutes+':'+seconds;
        } else {
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            return minutes+':'+seconds;
        }
    }

    function toggleAudio(forcePlay: boolean){
        console.log(audio.src)
        if (audio.paused || forcePlay){
            try {
                audio.play()
            } catch (error) {
                return
            }
        } else {
            audio.pause()
        }
        State.isPlaying = !audio.paused
        isPlaying = State.isPlaying
        localStorage.setItem("playing", isPlaying==true?"1":"0")
    }

    function stopAudio(){
        audio.pause()
        State.isPlaying = false
        isPlaying = false
        localStorage.setItem("playing", "0")
    }

    function playAudio(){
        if (audio.paused) {
            try {
                audio.play()
            } catch (error) {
                return
            }
        }
        State.isPlaying = true
        isPlaying = true
        localStorage.setItem("playing", "1")
    }

    function ToggleSide(){
        SideValue = !SideValue
        if (SideValue){
            SidePosition = 0
        } else {
            SidePosition = 220
        }
        console.log("Toggle", SidePosition)
        localStorage.setItem("SideValue", SideValue.toString())
    }

    let MusicLines: any = []
    let NumberOfLines = Math.pow(2, 7)

    for (let i=0; i<NumberOfLines; i++){
        MusicLines.push(
            {
                Color: [55, 55, 55],
                Size: .1,
            }
        )
    }

    let buttonOptions: Array<{text: string, callback: any}> = []
    let body: HTMLBodyElement
    let buttonListDiv: HTMLDivElement
    let playlistAdd = false
    buttonList.data.enabled = false
    let currSong: {
        id: number,
        name: string,
        description: string,
        users: Array<any>,
    }|null = null
    function shuffle(array: Array<any>) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }

        return array;
    }
    function SaveState(){
        const sendData = {
            songList: State.songList,
            playlistID: State.playlistID,
        }
        fetch("/state", {
            method: "POST",
            body: JSON.stringify(sendData),
        }).then(res => {
            console.log("SAVED STATE!")
        }).catch(err => {
            console.log("DIDN't SAVE")
            console.log(err)
        })
    }

    function lerp(a: number,b: number,t: number){
        return (b-a)*t+a
    }

    function map(value: number, start1: number, stop1: number, start2: number, stop2: number){
        return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2
    }

    async function skipForw(){
        const songList = State.songList
        if (songList.length > 0){
            const currSong = songList.shift()
            if (currSong){
                songList.push(currSong)
                const url = baseURL + "/audio?id=" + songList[0].id.toString()
                await fetch(url)
                State.songChanged = true
            }
        }
    }

    async function skipBack(){
        const songList = State.songList
        if (songList.length > 0){
            const currSong = songList.pop()
            if (currSong){
                songList.unshift(currSong)
                const url = baseURL + "/audio?id=" + songList[0].id.toString()
                await fetch(url)
                State.songChanged = true
            }
        }
    }

    let isLoading = false

    // QUAD BEZIER CURVE \\
    function bez(p1: number, p2: number, p3: number, t: number){
        const l1 = lerp(p1, p2, t)
        const l2 = lerp(p2, p3, t)

        return lerp(l1, l2, t)
    }
    // CUBIC BEZIER CURVE \\
    function bez2(p1: number, p2: number, p3: number, p4: number, t: number){
        const l1 = lerp(p1, p2, t)
        const l2 = lerp(p2, p3, t)
        const l3 = lerp(p3, p4, t)

        return bez(l1, l2, l3, t)
    }

    let freqSum = 1

    onMount(() => {
        if (!data.user && document.location.href.indexOf("/login") == -1){
            document.location.href = "/login"
            return
        }

        // LOADS LAST STATE IF IT EXISTS, LOADS STUFF SUCH AS WHAT SONGS WERE PLAYING \\
        fetch("/state").then(async res => {
            try {
                const stateData: {
                    songList: {
                        id: number,
                        name: string,
                        description: string,
                        users: Array<any>,
                    }[],
                    playlistID: number,
                } = await res.json()
                State.songList = stateData.songList
                State.songChanged = true
                State.playlistID = stateData.playlistID
                currSong = State.songList[0]
                currSong.users = currSong.users;
                console.log("LOADED STATE", State.songList)
            } catch (error) {
                console.log("NO DATA")
            }
        }).catch(err => {
            console.log("NO DATA")
        })
        baseURL = document.location.origin
        audio = new Audio('/audio/1')
        audio.onloadeddata = () => {
            isLoading = false
            console.log("Stopped loading")
        }
        audio.onloadstart = () => {
            isLoading = true
            console.log("Is loading")
        }

        let setTime = 0
        const savedProgress = localStorage.getItem("progress")
        if (savedProgress) {
            setTime = parseFloat( savedProgress )
        }
        const playing = localStorage.getItem("playing")
        if (playing && playing == "1"){
            try {
                audio.play()
            } catch (error) {
                return
            }
            State.isPlaying = true
        }
        
        const audioContext = new AudioContext()
        const analyserNode = audioContext.createAnalyser()
        const track = audioContext.createMediaElementSource(audio)
        analyserNode.fftSize = NumberOfLines*2//2048
        
        // analyserNode.maxDecibels = -25
        // analyserNode.minDecibels = -60
        analyserNode.smoothingTimeConstant = .4
        
        track.connect(analyserNode)
        analyserNode.connect(audioContext.destination)

        const bufferLength = analyserNode.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserNode.getByteTimeDomainData(dataArray)
        console.log(bufferLength)
        let t = 0
        let bass = 0
        let lastTime: number

        if (localStorage.getItem("SideValue") === "false") {
            ToggleSide()
        }
        console.log(document.URL)
        if (document.URL.indexOf("login") > -1 && data.login){
            document.location.href = "/songs"
        }

        function Distance(x1: number, y1: number, x2: number, y2: number){
            const x = x2 - x1, y = y2 - y1
            return Math.sqrt(x * x + y * y)
        }

        let lastAudioProgress = 0
        let lastParticle = 0
        async function doFrame(milliTime: number){
            window.requestAnimationFrame(doFrame)
            const time = milliTime / 1000
            if (!lastTime){
                lastTime = time - .1
            }
            const DT = time - lastTime
            lastTime = time
            innerWidth = window.innerWidth, innerHeight = window.innerHeight
            if (audio.paused && audio.currentTime == audio.duration && !State.songChanged){
                skipForw()
                State.isPlaying = true
                console.log("ENDED")
            }
            // IF SONG HAS BEEN CHANGED IT WILL LOAD THE NEW SONG HERE \\
            if (State.songChanged && State.songList[0] && !isLoading){
                State.songChanged = false
                currSong = State.songList[0]
                currSong.users = currSong.users;
                console.log("Song changed", currSong)
                songid = currSong.id
                songName = currSong.name
                audio.src = "/audio/" + currSong.id
                audio.currentTime = setTime
                setTime = 0
                if (isPlaying){
                    try {
                        audio.play()
                    } catch (error) {
                        return
                    }
                }
                SaveState()
                console.log("CHANGED")
            }
            if (isPlaying != State.isPlaying && State.songList[0] && !isLoading) {
                isPlaying = State.isPlaying
                if (isPlaying) {
                    playAudio()
                } else {
                    stopAudio()
                }
            }
            currTime = audio.currentTime
            maxTime = audio.duration
            audioProgress = audio.currentTime / audio.duration
            const currAudioTime = audio.currentTime
            if (Math.floor(currAudioTime) != lastAudioProgress){
                lastAudioProgress = currAudioTime
                localStorage.setItem("progress", currAudioTime.toString())
            }
            if (audio.paused && audio.currentTime == audio.duration){
                State.isPlaying = false
                isPlaying = false
            }
            playlistAdd = State.playlistAdd
            buttonList.data = buttonList.data
            buttonOptions = buttonList.data.options
            
            
            if (!fullScreen){
                return
            }
            if (time - t > 1/20){
                t = time
                analyserNode.getByteTimeDomainData(dataArray)
            }

            const bassFreq = 250
            let bassSum = 0, bassCount = 0
            let sum = 0
            for (let i=0; i<bufferLength; i++){
                const freq = dataArray[i]
                sum+=freq
                if (freq < bassFreq){
                    bassCount++
                    bassSum+=freq
                }
            }
            sum /= bufferLength
            freqSum = lerp(freqSum, sum, 1 - Math.pow(.01, DT))

            bass = lerp(bass, bassSum / Math.max(bassCount, 1), 1 - Math.pow(.1, DT))
            let lineIndex = 0
            for (let i=0; i<bufferLength; i+=Math.round(bufferLength/MusicLines.length)){
                const freq = dataArray[i]
                const obj = MusicLines[lineIndex]

                if (obj){
                    const midDistance = Math.abs(MusicLines.length/2 - (lineIndex + 1))
                    obj.Size = map(freq, 0, 355, 0.001, 1.5) * (1 + bass/bassFreq)// * (.6 + .4 * (1 - midDistance / (MusicLines.length/2)))
                }
                lineIndex++
            }
            MusicLines = MusicLines
        }
        
        window.requestAnimationFrame(doFrame)

        onmousemove = handleMouseMove;

        function UpdateSkip(){
            if (skipping){
                const time = Math.max(Math.min(mousePos.x / document.body.clientWidth, 1), 0) * audio.duration
                //console.log(audio.duration, time, time / audio.duration)
                audio.currentTime = time
                audioProgress = time / audio.duration
                console.log(time, audio.currentTime)
            }
        }

        function handleMouseMove(event: MouseEvent) {
            event = event || window.event;

            mousePos = {
                x: event.pageX,
                y: event.pageY
            };
            buttonList.data.tempPosition = {x: mousePos.x, y: mousePos.y}

            UpdateSkip()
        }

        onmouseup = (event) => {
            if (skipping && wasPlaying){
                toggleAudio(true)
            }
            skipping = false
        }

        onmousedown = (event) => {
            buttonList.data.enabled = false
            UpdateSkip()
        }
    })
</script>

<body bind:this={body} style="--pos: {-SidePosition}px">
    <div class="SideBar trans shadow-2xl" style="--color: rgba(255, 255, 255, 0.726);" >
        <button class="whiteHover w-4 h-4" on:click={ToggleSide}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stroke-2 h-100% w-100% text-white-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        
        <div class="LogoDiv items-center flex justify-items-center"><img src="{baseURL}/logo.png" alt="logo" class="h-2/5 ml-3"/><p class="text-white font-bold text-xl ml-2">Not spotify</p></div>
        
        <button class="sideButton items-center justify-start flex" on:click={() => {document.location.href = "/songs"}}>
            <div class="h-[100%] aspect-square mr-3"><Home size="100%" color="var(--color)"></Home></div>
            <p>Home</p>
        </button>
        <button class="sideButton items-center justify-start flex" on:click={() => {document.location.href = "/search"}}>
            <div class="h-[100%] aspect-square mr-3"><SearchWeb size="100%" color="var(--color)"></SearchWeb></div>
            <p>Search</p>
        </button>
        <button class="sideButton items-center justify-start flex" on:click={() => {document.location.href = "/featured"}}>
            <div class="h-[100%] aspect-square mr-3"><Star size="100%" color="var(--color)"></Star></div>
            <p>Featured</p>
        </button>

        <div class="bg-[var(--color)] w-[90%] h-1 ml-[10px] rounded-full"/>

        {#if user}
            {#each user.playlists as playlist}
                <div class="sideButton hoverWhite items-center justify-start flex">
                    <div class="h-[100%] aspect-square mr-3"><Folder size="100%" color="var(--color)"></Folder></div>
                    <p>{playlist.name}</p>
                    <button class="sideButton absolute bg-transparent" on:click={() => {document.location.href = `/playlist/${playlist.id}`}}/>
                    {#if playlistAdd}
                        <button on:click={() => {playlistAdd = false; State.playlistAdd = false; notifications.success('Added to playlist!', 1000 * 2); fetch(`/playlist/add/${playlist.id}/${State.playlistAddID}`)}} class="hoverWhite h-[40px] aspect-square mr-3 absolute right-[0%] z-40"><Add size="100%" color="var(--color)"></Add></button>
                    {/if}
                </div>
            {/each}
        {/if}

        <button class="sideButton items-center justify-start flex" on:click={() => {playlistCreate = true}}>
            <div class="h-[100%] aspect-square mr-3"><FolderEdit size="100%" color="var(--color)"></FolderEdit></div>
            <p>PLAYLIST</p>
        </button>
    </div>
    <div class="TopBar trans inline-flex justify-end items-center">
        {#if data.login}
            <div class="userDiv absolute left-5 flex items-center"><div class="rounded-full bg-b1 w-12 h-12 inline-flex"></div><p class="inline-flex ml-2 text-white">Welcome {USERNAME}!</p></div>
            <button class="text-white mr-2 z-10" on:click={() => {document.location.href = "/upload"}}>Upload</button>
            <button class="text-white mr-2 z-10" on:click={() => {document.location.href = "/logout"}}>Logout</button>
        {:else}
            <button class="text-white mr-2 z-10" on:click={() => {document.location.href = "/login?reg=true"}}>Register</button>
            <button class="text-white mr-2 z-10" on:click={() => {document.location.href = "/login"}}>Login</button>
        {/if}
    </div>
    <main class="trans">
        <slot/>
    </main>
    <div class="BottomBar absolute bottom-0 w-[100%] h-20 shadow-2xl bg-b2 inline-flex items-center">
        <img src="/image/{songid}" class="h-[80%] rounded-md aspect-square bg-b1 text-white ml-5" alt="song">
        <div class="block ml-5 z-10">
            <p class="text-white text-md">{songName}</p>
                {#if (currSong && currSong.users && currSong.users.length > 0)}
                <p class="text-gray-700 text-md flex flex-nowrap">
                    by
                    {#each currSong.users as user, index}
                        <a href="/user/{user.id}" class="hover:underline hover:text-white transition-all ml-1">{user.name}</a>
                        {#if currSong.users.length>index+1}
                            <p>,</p>
                        {/if}
                    {/each}
                </p>
                {/if}
           
        </div>
        <button on:mousedown={() => {console.log("DOWN"); skipping = true; wasPlaying = isPlaying; stopAudio()}} style="--progBar: {Math.round(audioProgress * 1000) / 10}%" class="SongBar group w-[100%] h-2 top-0 absolute translate-y-[-100%] bg-[rgba(255,255,255,.25)]">
            <div class="absolute w-[var(--progBar)] h-[100%] translate-y-[-50%] bg-white"></div>
            <p class="top-0 left-[50%] absolute translate-x-[-50%] translate-y-[-100%] text-white text-md">{toHHMMSS(currTime.toString())}/{toHHMMSS(maxTime.toString())}</p>
            <div class="absolute h-full group-hover:h-[120%] transition-transform aspect-square rounded-full bg-white left-[var(--progBar)] top-1/2 -translate-x-1/2 -translate-y-1/2"/>
        </button>
        <div class="h-[100%] w-[100%] absolute flex justify-center items-center">
            <button on:click={skipBack} class="h-[70%] flex justify-center items-center aspect-square bg-b1 rounded-full">
                <SkipBackward size="70%" color="rgb(255,255,255)"></SkipBackward>
            </button>

            <button on:click={() => {toggleAudio(false)}} class="ml-5 flex justify-start items-center h-[80%] bg-b1 rounded-full">
                {#if !isPlaying}
                    <Play size="100%" color="rgb(255,255,255)"></Play>
                {:else}
                    <Pause size="100%" color="rgb(255,255,255)"></Pause>
                {/if}
            </button>

            <button on:click={skipForw} class="ml-5 h-[70%] aspect-square bg-b1 rounded-full flex flex-nowrap">
                <div class="flex justify-center items-center absolute h-[70%] aspect-square">
                    <SkipForward size="70%" color="rgb(255,255,255)"></SkipForward>
                </div>
                <button on:click={() => {shuffle(State.songList); State.songChanged = true}} class="relative left-[100%] ml-5 h-[100%] flex justify-center items-center aspect-square bg-b1 rounded-full">
                    <Shuffle size="70%" color="rgb(255,255,255)"></Shuffle>
                </button>
            </button>
        </div>
        <button on:click={() => {fullScreen = !fullScreen}} class="absolute right-16 h-[70%] flex justify-center items-center rounded-full bg-b1 aspect-square">
            <Menu size="80%" color="rgb(255,255,255)"></Menu>
        </button>
    </div>
    <div style="--y: {fullScreen==true?0:100}%" class="FullScreen flex flex-col justify-center items-center h-[100%] w-[100%] bg-b2 trans absolute top-[var(--y)] z-20">
        <p class="text-6xl text-white pb-5">{songName}</p>
        <div class="w-[100%] h-[45%] flex justify-center items-center">
            <img src="/image/{songid}" style="--size:{Math.max(Math.min(30 + 2 * (freqSum / 70), 70), 0)}%" class="absolute h-[var(--size)] rounded-xl aspect-square bg-b1 text-white ml-5" alt="song">
            {#each MusicLines as Line}
                <MusicLine LineMax={MusicLines.length} LineData={Line} enabled={fullScreen}></MusicLine>
            {/each}
        </div>
        <!-- <hr class="w-[30%] h-3 mt-3"> -->
        <button on:mousedown={() => {console.log("DOWN"); skipping = true; wasPlaying = isPlaying; stopAudio()}} style="--progBar: {Math.round(audioProgress * 1000) / 10}%" class="SongBar group w-[100%] h-2 -translate-y-1/2 bg-[rgba(255,255,255,.25)]">
            <div class="absolute w-[var(--progBar)] h-[100%] translate-y-[-50%] bg-white"></div>
            <p class="top-0 left-[50%] absolute translate-x-[-50%] translate-y-[-100%] text-white text-md">{toHHMMSS(currTime.toString())}/{toHHMMSS(maxTime.toString())}</p>
            <div class="absolute h-full group-hover:h-[120%] transition-transform aspect-square rounded-full bg-white left-[var(--progBar)] top-1/2 -translate-x-1/2 -translate-y-1/2"/>
        </button>
        <div class="h-[10%] w-[50%] flex justify-center items-center">
            <button on:click={skipBack} class="h-[70%] flex justify-center items-center aspect-square bg-b1 rounded-full">
                <SkipBackward size="70%" color="rgb(255,255,255)"></SkipBackward>
            </button>

            <button on:click={() => {toggleAudio(false)}} class="ml-5 flex justify-start items-center h-[80%] bg-b1 rounded-full">
                {#if !isPlaying}
                    <Play size="100%" color="rgb(255,255,255)"></Play>
                {:else}
                    <Pause size="100%" color="rgb(255,255,255)"></Pause>
                {/if}
            </button>

            <button on:click={skipForw} class="ml-5 h-[70%] flex justify-center items-center aspect-square bg-b1 rounded-full">
                <SkipForward size="70%" color="rgb(255,255,255)"></SkipForward>
            </button>
        </div>
        <button on:click={() => {fullScreen = !fullScreen}} class="absolute top-16 right-16 h-[7%] flex justify-center items-center rounded-full bg-b1 aspect-square">
            <Menu size="80%" color="rgb(255,255,255)"></Menu>
        </button>
    </div>

    {#if playlistCreate}
        <div class="absolute h-[100%] w-[100%] bg-[rgba(22,22,22,.8)] z-40">
            <div class="playlistMain ml-10 bg-b2 h-[50%] absolute w-[30%] rounded-md flex flex-col items-center justify-center left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                <b class="text-white text-5xl">CREATE PLAYLIST</b>
                <form method="post" action="/playlist?/create" bind:this={playlistForm} class="flex flex-col w-[70%] flex-shrink-0 items-center" use:enhance={({ form, data, action, cancel }) => {}}>
                    <input type="file" accept="image/png" name="image" class="w-[100%] border-dashed border-4 border-white h-32 text-white aspect-square bg-b2 rounded-md">
                    <input type="text" required name="name" id="" placeholder="PLAYLIST NAME" class="w-[80%] rounded-sm">
                    <input type="text" name="desc" id="" placeholder="DESCRIPTION" class="w-[80%] rounded-sm">
                    <input type="button" value="UPLOAD" class="bg-b1 text-white rounded-md w-[60%] h-8 z-10" on:click={async () => {
                        //const res = await playlistForm.submit()
                        const res = await playlistForm.requestSubmit()
                        console.log("SUBMITTED!!!", res)
                        document.location.href = "/"
                    }}>
                    <input type="button" value="Back" class="bg-b1 text-white rounded-md w-[30%] h-8 z-10" on:click={() => {playlistCreate = false}}>
                </form>
            </div>
        </div>
    {/if}

    {#if buttonList.data.enabled}
    <div bind:this={buttonListDiv} style="--x: {buttonList.data.position.x}px; --y: {buttonList.data.position.y}px; --tx: {buttonList.data.position.x + 160 > window.innerWidth?-100:0}%;"
        class="absolute rounded-md left-[var(--x)] top-[var(--y)] translate-x-[var(--tx)] w-40 bg-b3">
        {#each buttonOptions as option}
            <button on:mousedown={option.callback} class="z-10 rounded-md flex justify-center items-center w-[100%] h-5 hover:bg-[rgba(255,255,255,.1)]">
                <p class="text-white">{option.text}</p>
            </button>
        {/each}
    </div>
    {/if}
</body>
<Toast/>

<style>
    :global(body){
        overflow: hidden;
        margin: 0;
        /* align-items: center;
        justify-content: center; */
    }
    body {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        background: linear-gradient(180deg, rgb(29, 29, 29) 0%, rgb(22, 22, 22) 100%);
        /* background-repeat: no-repeat; */
        width: 100%;
        height: 100%;
    }
    .particle {
        transform-style: preserve-3d;
        display: flex;
        transform: perspective(3000px) rotateY(var(--rotation)) rotateX(var(--rotation));
    }
    .particle * {
        backface-visibility: hidden;
    }
    .trans {
        transition: .5s cubic-bezier(0.075, 0.82, 0.165, 1);
    }
    .SongBar {
        transition: height .5s cubic-bezier(0.075, 0.82, 0.165, 1);
    }
    .SongBar:hover {
        height: 16px;
    }
    .LogoDiv {
        height: 10%;
    }
    .SideBar {
        position: absolute;
        height: 100%;
        width: 220px;
        left: var(--pos);
        background-color: rgb(14, 14, 14);
        padding-right: 20px;
    }
    .TopBar {
        position: absolute;
        height: 10%;
        width: calc(100% - 220px - var(--pos));
        left: calc(220px + var(--pos));
        background-color: rgb(37, 37, 37);
        
    }
    body main {
        position: absolute;
        top: 10%;
        height: calc(100% - 64px - 10%);
        width: calc(100% - 220px - var(--pos));
        left: calc(220px + var(--pos));
    }

    .whiteHover {
        color: rgba(255, 255, 255, 0.726);
        position: absolute;
        right: -20%;
        width: 20%;
        height: 50px;
        top: 50%;
        transform: translate(0,-50%);
        pointer-events: all;
        z-index: 10;
    }

    @keyframes test {
        0% {
            left: -4px;
        }

        50% {
            left: 0px;
        }

        100% {
            left: -4px;
        }
    }

    .whiteHover:hover {
        color: white;
        margin: 0 -4px;
    }

    .whiteHover:hover svg {
        position: relative;
        transform: rotateZ(180deg);
        animation: test 1s linear infinite;
    }

    .whiteHover svg {
        pointer-events: none;
        transition: .5s cubic-bezier(0.075, 0.82, 0.165, 1);
    }

    .sideButton {
        height: 40px;
        width: 100%;
        /* color: rgba(255, 255, 255, 0.726); */
        color: var(--color);
        font-size: large;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bolder;
        padding: 5px 20px 7px 15px;
        margin: 10px 5px;
    }

    .sideButton:hover {
        color: white;
    }

    .hoverWhite:hover {
        --color: white;
    }

    .playlistMain:only-child * {
        margin-top: 10px;
    }
    .playlistMain {
        margin-top: 15px;
    }
</style>