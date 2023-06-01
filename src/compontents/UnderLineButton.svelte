<script>
    export let Text = "EXAMPLE"
    export let Redirect = "/"
    export let Seperate = "0px"
</script>

<button class="button" style="--sep: {Seperate}" on:click={() => {document.location.href = Redirect}}>
    {Text}
    <div class="line"/>
</button>

<style>
    .button {
        background-color: rgba(0,0,0,.2);
        border-width: 0px;
        border-radius: 100vh;
        height: 40px;
        width: 100%;
        color: white;
        font-size: large;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bolder;
        padding: 5px 30px 7px 30px;
        margin: var(--sep) calc(var(--sep) / 2);
    }

    .line {
        border-radius: 100vh;
        position: relative;
        bottom: 1px;
        width: 0%;
        height: 4px;
        left: 50%;
        background-color: white;
        transition: .5s cubic-bezier(0.075, 0.82, 0.165, 1);
    }

    .button:hover .line {
        left: 0%;
        width: 100%;
        margin: 0 -20px;
        padding: 0 20px;
    }
</style>

