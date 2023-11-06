<script lang="ts">
    export let text: string;
    export let onClick;
    export let type;
    export let size;
    export let disable : boolean = false;
    let btnClass = "";
    if(type === 'primary'){
        btnClass = "custom-btn-primary"
    }
    else if(type === 'dark'){
        btnClass = "custom-btn-dark"
    }
</script>
<button disabled="{disable}" style="font-size: {`${size}px`}; margin-bottom:4px; padding: 6px 12px;" class="btn {btnClass}" on:click={()=>{
    onClick();
}}>{text}</button>

<style>
    .custom-btn-primary{
        background-color: var(--send-button);
    }
    .custom-btn-dark{
        background-color: var(--border-color);
    }
</style>