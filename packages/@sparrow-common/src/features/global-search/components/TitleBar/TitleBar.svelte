<script lang="ts">
  export let data = {
    title: "",
    shortcutKeys: [],
  };
  import { keyCommand } from "../../images";
</script>

<div class="section-header">
  <span class="section-title">{data.title}</span>
  <div class="keyboard-shortcut">
    <div class="shortcut-key">
      <img src={keyCommand} alt="" class="shortcut-icon" />
    </div>
   {#if data.shortcutKeys}
    {#each data.shortcutKeys as key}
      <div class="key">{key}</div>
    {/each}
   {/if}
  </div>
</div>

<style>
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
    margin-bottom: 4px;
  }
  .section-title {
    color: var(--text-ds-neutral-500);
    font:
      400 12px Inter,
      sans-serif;
  }

  .keyboard-shortcut {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .shortcut-key {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-600);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 4px;
  }

  .key {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-600);
    color: var(--text-ds-neutral-200);
    padding: 2px 4px;
    font:
      400 12px Inter,
      sans-serif;
    line-height: 18px;
    min-height: 24px;
    min-width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  
</style>
