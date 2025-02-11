<script>
  export let numberOfKeys = 0;
  export let keys = [];
</script>

<div class="keys">
  {#if keys.size > 0}
    {#each keys as key}
      <span class="key">{key}</span>
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
    padding: 2px;
    font: 400 12px;
    line-height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
