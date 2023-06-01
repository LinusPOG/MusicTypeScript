<script lang="ts">
    import { onMount } from 'svelte'
    
    export let LineData = {
                Color: [255,255,255],
                Size: .1,
            };
    export let LineMax = 1;
    export let enabled = true
    let Size = 0
    let Color = [255, 255, 255]

    function lerp(a: number,b: number,t: number){
        return (b-a)*t+a
    }

    onMount(() => {
        let startTime: number = -1, lastTime: number = -1
        function update(milliTime: number){
            window.requestAnimationFrame(update)
            const time = milliTime / 1000
            if (!enabled){
                lastTime = time
                return
            }
            if (startTime < 0)
                startTime = time;
                lastTime = time-.1;
            const DT: number = time-lastTime, LerpValue: number = 1 - Math.pow(.01, DT)
            Size = lerp(Size, LineData.Size * 100, 1 - Math.pow(.1, DT))
            const LVal = Math.max(Size/100-.5, 0) / .5
            let TargetColor = [lerp(LineData.Color[0], 255, LVal), lerp(LineData.Color[1], 255, LVal), lerp(LineData.Color[2], 255, LVal)]
            
            Color[0] = lerp(Color[0], TargetColor[0], LerpValue)
            Color[1] = lerp(Color[1], TargetColor[1], LerpValue)
            Color[2] = lerp(Color[2], TargetColor[2], LerpValue)
            lastTime = time
        }
        window.requestAnimationFrame(update)
    })
</script>

<div style="width: {100/LineMax}%; height: {Size}%; background-color: rgb({Color[0]}, {Color[1]}, {Color[2]});" class="MusicLine"></div>

<style>
    .MusicLine {
        margin-left: 1px;
        margin-right: 1px;
        pointer-events: none;
    }
</style>

