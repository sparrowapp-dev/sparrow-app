<script lang="ts">
  import { AISparkle } from "../../assests";

  export let message;
  export let type;
</script>

{#if type === "SENDER"}
  <div class="send-item">
    <p class="my-4 px-3 text-fs-12">{message}</p>
  </div>
{:else}
  <div class="recieve-item">
    <AISparkle />
    <p class=" px-2 text-fs-12">{message}</p>
  </div>
{/if}

<style>
  .send-item {
    border-bottom: 1px solid grey;
  }
  .recieve-item {
  }
</style>
