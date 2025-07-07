<script lang="ts">
  import { fade } from "svelte/transition";
  export let keys: Array<string> = [];
  import { CommandKey } from "../../icons";
</script>

<div class="keys">
  {#if keys.length > 0}
    {#each keys as key, index (key)}
      {#if key.toLowerCase() === "cmd"}
        <span
          class="key"
          transition:fade={{ duration: 250, delay: index * 60 }}
        >
          <CommandKey />
        </span>
      {:else}
        <span
          class="key"
          transition:fade={{ duration: 250, delay: index * 60 }}
        >
          {key}
        </span>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .keys {
    display: flex;
    gap: 3px;
    padding: 2px;
  }
  .key {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-100);
    padding: 2px 4px;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
