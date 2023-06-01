<script lang="ts">
    import {onMount} from 'svelte'
    import {Spring} from '../../modules/spring'
    import type { PageData } from './$types';
    
    export let data: PageData;
    let time: number, rotation = 0
    let CubeDIV: any, pixelWidth = 0
    let frameCallbacks: Array<[number, number, Function]> = []
    const testSpring = new Spring(180, 4, 20)
    if (data.isReg){
        testSpring.target += 180
        testSpring.position += 180
        console.log("Register")
    }
    console.log(data)

    function lerp(a: number, b: number, t: number){
        return (b-a)*t+a
    }

    function quadBezier(p1: number, p2: number, p3: number, t: number){
        const l1 = lerp(p1, p2, t)
        const l2 = lerp(p2, p3, t)

        return lerp(l1, l2, t)
    }

    function cubicBezier(p1: number, p2: number, p3: number, p4: number, t: number){
        const l1 = lerp(p1, p2, t)
        const l2 = lerp(p2, p3, t)
        const l3 = lerp(p3, p4, t)

        return quadBezier(l1, l2, l3, t)
    }

    function doTime(Time: number, Callback: Function){
        frameCallbacks.push([
            time,
            Time,
            Callback
        ])
    }

    function rotate(){
        const start = rotation
        testSpring.target += 180
        // doTime(2, (Elapsed: number, T: number, dt: number) => {
        //     const s = testSpring.update(dt)
        //     rotation = start + 180 - s
        //     console.log(s)
        // })
    }

    function doFrame(milliTime: number){
        const localTime = milliTime / 1000
        if (!time){
            time = localTime-.01
        }
        const dt = localTime - time
        time = localTime
        rotation = testSpring.update(dt)
        //rotation = time * 12

        pixelWidth = CubeDIV.clientWidth
        
        for (let i = frameCallbacks.length-1; i>0; i--){
            const [StartTime, MaxTime, Callback] = frameCallbacks[i]

            if (time > StartTime+MaxTime) {
                Callback(MaxTime, 1, dt)
                frameCallbacks.splice(i, 1)
            } else {
                const Elapsed = time-StartTime
                Callback(Elapsed, Elapsed / MaxTime, dt)
            }
        }

        window.requestAnimationFrame(doFrame)
    }

    onMount(() => {
        window.requestAnimationFrame(doFrame)

        
    })
</script>

<div bind:this={CubeDIV} class="CubeDIV" style="--rotation: {rotation}deg; --width: {pixelWidth}px">
    <div class="Cube1 justify-center items-center flex flex-col">
        <img src="logo.png" class="h-[12%] absolute top-4" alt="not spotify"/>
        <p class="text-white font-bold text-5xl absolute top-[5rem]">LOGIN</p>
        <p class="text-stone-600 text-center text-sm absolute top-[8rem]">for legal reasons this is not spotify<br>please don't sue</p>
        <p class="text-stone-600 text-sm absolute bottom-8">this is not spotify</p>

        <form method="post" action="?/login" class="w-[100%] h-[100%] justify-center items-center flex flex-col absolute top-8">
            <input type="text" placeholder="username" name="user" id="" class="rounded text-center w-50 h-6 mb-2">
            <input type="password" placeholder="password" name="pass" id="" class="rounded text-center w-50 h-6 mb-5">
            <input type="submit" value="Login" class="rounded w-40 h-8 text-white bg-stone-700 mb-2">
            
        </form>
        <button class="rounded w-[8rem] h-6 text-white bg-stone-800 z-20 absolute top-[20.5rem]" on:click={rotate}>register</button>
    </div>
    <div class="Cube2"></div>
    <div class="Cube3"></div>
    <div class="Cube4 justify-center items-center flex flex-col">
        <img src="logo.png" class="h-[12%] absolute top-4" alt="not spotify"/>
        <p class="text-white font-bold text-5xl absolute top-[5rem]">REGISTER</p>
        <p class="text-stone-600 text-center text-sm absolute top-[8rem]">for legal reasons this is not spotify<br>please don't sue</p>
        <p class="text-stone-600 text-sm absolute bottom-8">this is not spotify</p>

        <form method="post" action="?/register" class="w-[100%] h-[100%] z-10 justify-center items-center flex flex-col absolute top-8">
            <input type="text" placeholder="username" name="user" id="" class="rounded text-center w-50 h-6 mb-2">
            <input type="password" placeholder="password" name="pass" id="" class="rounded text-center w-50 h-6 mb-2">
            <input type="email" placeholder="email" name="email" id="" class="rounded text-center w-50 h-6 mb-5">
            <input type="submit" value="Register" class="rounded w-40 h-8 text-white bg-stone-700 mb-2 z-10">
            
        </form>
        <button class="rounded w-[8rem] h-6 text-white bg-stone-800 z-20 absolute top-[21.5rem]" on:click={rotate}>Login</button>
    </div>
    <!-- <div class="Cube3"></div>
    <div class="Cube4"></div> -->
</div>

<style>
    .CubeDIV {
        position: absolute;
        left: 50%;
        top: 50%;
        transform-style: preserve-3d;
        transform: perspective(3000px) translate(-50%,-50%) rotateY(var(--rotation));
        height: 60%;
        aspect-ratio: 1 / 1.5;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .CubeDIV div {
        /* position: absolute;
        left: 50%;
        top: 50%; */
        position: absolute;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        height: 100%;
        width: 100%;
        background-color: rgb(44,44,44);
        box-shadow: 0px 0px 19px 0px rgba(0,0,0,0.75);
    }

    .Cube1 {
        transform: translateZ(calc(var(--width) / 2));
    }

    .Cube2 {
        transform: translateX(calc(var(--width) / 2)) rotateY(90deg);
    }

    .Cube3 {
        transform: translateX(calc(var(--width) / -2)) rotateY(-90deg);
    }

    .Cube4 {
        transform: translateZ(calc(var(--width) / -2)) rotateY(180deg);
    }
</style>