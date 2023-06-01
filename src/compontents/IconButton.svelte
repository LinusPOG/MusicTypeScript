<script>
    export let Text = "EXAMPLE"
    export let Redirect = "/"
    export let Seperate = "0px"
</script>

<button class="button items-center justify-center flex" style="--sep: {Seperate}" on:click={() => {document.location.href = Redirect}}>
    <!-- <svg class="h-7 w-7 left-5 absolute text-white-500" -->
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stroke-2 h-7 w-7 left-5 absolute text-white-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>          
    <p>{Text}</p>
</button>

<style>
    .button {
        height: 40px;
        width: 100%;
        color: rgba(255, 255, 255, 0.726);
        font-size: large;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bolder;
        padding: 5px 30px 7px 30px;
        margin: var(--sep) calc(var(--sep) / 2);
        transition: .5s cubic-bezier(0.075, 0.82, 0.165, 1);
    }

    .button:hover {
        color: white;
    }
</style>

