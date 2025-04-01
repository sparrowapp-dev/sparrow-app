<script lang="ts">
  import { SearchIcon } from "@sparrow/library/icons";

  export let searchQuery = "";
  export let type: "Basic" | "Custom" = "Basic";
  export let customText = "";
</script>

<div class="container">
  <div style="display:flex; align-items:center; justify-content:center;">
    <SearchIcon width="24px" height="24px" />
  </div>
  <div
    class="text-container text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-Regular"
  >
    {#if type === "Basic"}
      <p>Nothing found for "{searchQuery}"</p>
    {:else}
      <p>{customText}</p>
    {/if}
  </div>
</div>

<style>
  .container {
    display: flex;
    gap: 8px;
    padding: 16px;
    flex-direction: column;
  }

  .text-container {
    display: flex;
    margin-top: 10px;
    align-items: center;
    justify-content: center;
    color: var(--text-ds-neutral-300);
  }
</style>
