<script lang="ts">
    import Spinner from "../Transition/Spinner.svelte";

    export let text: string;
    export let onClick;
    export let type;
    export let size;
    export let disable : boolean = false;
    export let loader = false;
    export let loaderColor = "default";
    let btnClass = "";
    if(type === 'primary'){
        btnClass = "custom-btn-primary"
    }
    else if(type === 'dark'){
        btnClass = "custom-btn-dark"
    }
</script>
<button disabled="{disable}" style="font-size: {`${size}px`}; margin-bottom:4px; padding: 6px 12px;" class="btn d-flex align-items-center {btnClass}" on:click={()=>{
    onClick();
}}>
{#if loader}
    <span class="mx-2">
        {#if loaderColor === "default"}
            <Spinner size={"16px"}/>
        {/if}
    </span>
{/if}
{text}</button>

<style>
    .custom-btn-primary{
        background-color: var(--send-button);
    }
    .custom-btn-dark{
        background-color: var(--border-color);
    }
</style>