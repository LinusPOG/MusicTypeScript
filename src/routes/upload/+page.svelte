<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from "$app/forms";
    
    export let data: PageData;
</script>

<div class="main ml-10 h-[80%] absolute w-[80%] flex flex-col items-center justify-center">
    <b class="text-white text-5xl">UPLOAD SONG</b>
    <form method="post" action="?/upload" class="flex flex-col w-[30%] flex-shrink-0" use:enhance={({ form, data, action, cancel }) => {
        //cancel()
        //console.log(data.get("file"))
        //console.log(action)
    }}>
        <input type="file" accept="audio/mpeg" name="audio" class="uploadButton h-10 text-white aspect-square bg-b2 rounded-md">
        <input type="file" accept="image/png" name="image" class="uploadButton h-32 text-white aspect-square bg-b2 rounded-md">
        <input type="text" name="name" id="" placeholder="SONG NAME" class="w-82 rounded-sm">
        <input type="text" name="desc" id="" placeholder="DESCRIPTION" class="w-82 rounded-sm">
        <input type="submit" value="UPLOAD" class="bg-b2 text-white rounded-md w-82 h-8 z-10">
    </form>
</div>

<style>
    .uploadButton {
        border-width: 4px;
        border-color: white;
        border-style: dashed;
    }
    .main:only-child * {
        margin-top: 10px;
    }
    .main {
        margin-top: 15px;
    }
</style>