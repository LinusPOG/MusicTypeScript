<script lang="ts">
    import MusicLine from './MusicLine.svelte';
    import { onMount } from 'svelte'
    import Pause from "svelte-material-icons/pause.svelte"
    import Play from "svelte-material-icons/play.svelte"

    let MusicLines: any = []
    let NumberOfLines = Math.pow(2, 7)
    let paused = true, skipping = false
    let progress = 0, playCircle: any
    let mousePos = {x: 0, y: 0}

    for (let i=0; i<NumberOfLines; i++){
        MusicLines.push(
            {
                Color: [55, 55, 55],
                Size: .1,
            }
        )
    }
    let audio: any = null
    let wasPlaying = false

    function Toggle(){
        if (audio.paused){
            audio.play()
        } else {
            audio.pause()
        }
    }

    function lerp(a: number,b: number,t: number){
        return (b-a)*t+a
    }

    function map(value: number, start1: number, stop1: number, start2: number, stop2: number){
        return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2
    }

    function UpdateTime(){
        const mx = window.innerWidth/2, my = window.innerHeight/2
        const dx = mousePos.x - mx, dy = my - mousePos.y
        const v = 90 + -1 * Math.atan(dy/dx) * (180/Math.PI) + (0>dx?180:0)

        audio.pause()
        audio.currentTime = audio.duration * (v/360)
    }

    onMount(() => {
        audio = new Audio('meat.mp3');
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

        function doFrame(milliTime: number){
            const time = milliTime / 1000
            progress = 100 * (audio.currentTime / audio.duration)
            if (!lastTime){
                lastTime = time - .1
            }
            const DT = time - lastTime

            lastTime = time
            
            if (time - t > 1/20){

                t = time
                analyserNode.getByteTimeDomainData(dataArray)
            }

            paused = audio.paused
            const bassFreq = 250
            let bassSum = 0, bassCount = 0
            for (let i=0; i<bufferLength; i++){
                const freq = dataArray[i]

                if (freq < bassFreq){
                    bassCount++
                    bassSum+=freq
                }
            }

            bass = lerp(bass, bassSum / Math.max(bassCount, 1), 1 - Math.pow(.1, DT))
            let lineIndex = 0
            for (let i=0; i<bufferLength; i+=Math.round(bufferLength/MusicLines.length)){
                const freq = dataArray[i]
                const obj = MusicLines[lineIndex]
                
                if (obj){
                    const midDistance = Math.abs(MusicLines.length/2 - (lineIndex + 1))
                    obj.Size = map(freq, 0, 255, 0.001, 1) * (1 + bass/bassFreq)// * (.6 + .4 * (1 - midDistance / (MusicLines.length/2)))
                    MusicLines = MusicLines
                }
                lineIndex++
            }
            window.requestAnimationFrame(doFrame)
        }

        window.requestAnimationFrame(doFrame)

        onmousemove = handleMouseMove;

        function handleMouseMove(event: MouseEvent) {
            var dot, eventDoc, doc, body, pageX, pageY;

            event = event || window.event;

            mousePos = {
                x: event.pageX,
                y: event.pageY
            };

            if (skipping){
                UpdateTime()
            }
        }
        let mouseIN = false
        onmouseup = (event) => {
            if (skipping && wasPlaying){
                audio.play()
            }
            skipping = false
            if (!mouseIN){
                playCircle.style.height = "35%"
            }
        }
        playCircle.onmouseenter = () => {
            playCircle.style.height = "40%"
            mouseIN = true
        }
        playCircle.onmouseleave = () => {
            if (!skipping){
                playCircle.style.height = "35%"
            }
            mouseIN = false
        }
    })
</script>

<body>
    <h1 class="title">Madvillain - Meat Grinder</h1>
    <input type="button" class="PlayButton" on:click={Toggle}>
    
    <div class="MusicBar">
        {#each MusicLines as Line}
            <MusicLine LineMax={MusicLines.length} LineData={Line}></MusicLine>
        {/each}
    </div>
    <div bind:this={playCircle} on:mousedown={() => {wasPlaying = !audio.paused; skipping = true; UpdateTime();}} style="--progress: {progress}" class="PlayCircle"></div>

    {#if !paused}
        <div class="aIcon"><Pause size="50%" color="rgb(15,15,15)"></Pause></div>
    {:else}
        <div class="aIcon"><Play size="50%" color="rgb(15,15,15)"></Play></div>
    {/if}
</body>

<style>
    :global(body) {
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
        background-attachment: fixed;
        background-color: rgb(15,15,15);
    }
    .title {
        position: absolute;
        left: 50%;
        top: 2%;
        transform: translate(-50%,0);
        color: white;
        font-size: 400%;
        pointer-events: none;
        user-select: none;
    }
    .aIcon {
        height: 100px;
        aspect-ratio: 1;
        z-index: 4;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        height: 30%;
        aspect-ratio: 1 / 1;
        align-items: center;
        justify-content: center;
        display: flex;
        position: absolute;
        pointer-events: none;
    }
    .PlayCircle {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        background: conic-gradient(#369 calc(var(--progress) * 1%), rgb(15, 15, 15) 0);
        height: 35%;
        aspect-ratio: 1 / 1;
        z-index: 2;
        border-radius: 100%;
        transition: 0.1s cubic-bezier(0.075, 0.82, 0.165, 1);
    }
    .PlayButton {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        background-color: rgb(55, 55, 55);
        height: 30%;
        aspect-ratio: 1 / 1;
        z-index: 3;
        border-radius: 100%;
        border-width: 0px;
        /* border-color: rgb(14,14,14);
        border-width: 20px;
        border-style: solid; */
    }
    .MusicBar {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        width: 100%;
        height: 30%;
        background-color: rgba(0,0,0,0);
        align-items: center;
        justify-content: center;
        display: flex;
        pointer-events: none;
    }
</style>