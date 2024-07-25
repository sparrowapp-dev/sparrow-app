<script lang="ts">
  import { AISparkle } from "../../assests";

  export let message;
  export let type;
</script>

{#if type === "SENDER"}
  <div class="send-item">
    <p class="my-4 px-3 text-fs-12">{@html message}</p>
  </div>
{:else}
  <div class="recieve-item p-3">
    <AISparkle />
    <p class="mb-0 text-fs-12">{@html message}</p>
  </div>
{/if}

<style>
  .send-item {
    border-bottom: 1px solid grey;
  }
  .recieve-item {
    border-bottom: 1px solid grey;
  }
</style>
