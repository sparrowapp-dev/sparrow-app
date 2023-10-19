<script lang="ts">
    export let text: string;
    export let onClick;
</script>
<button style="color: #85C2FF; border: 1px solid #85C2FF;" class="btn cfs-12" on:click={()=>{
    onClick();
}}>{text}</button>