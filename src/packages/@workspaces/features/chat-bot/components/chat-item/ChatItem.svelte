<script lang="ts">
  import { AISparkle } from "../../assests";

  export let message;
  export let sender;
</script>

{#if sender === "you"}
  <div class="send-item">
    <p class="my-4 px-3">{message}</p>
  </div>
{:else}
  <div class="recieve-item">
    <AISparkle />
    <p class=" px-2">{message}</p>
  </div>
{/if}

<style>
  .send-item {
    border-bottom: 1px solid grey;
  }
  .recieve-item {
  }
</style>
