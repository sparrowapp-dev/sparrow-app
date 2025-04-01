<script lang="ts">
  export let startIcon;
  export let endIcon;
  export let label = "";

  export let type: "labelLeftIcon" | "labelRightIcon" | "labelLeftRightIcon" =
    "labelLeftIcon";
  export let disabled = false;
  export let onClick: (e) => void;
  export let isSelected = false;
</script>

<button
  {disabled}
  on:click={(e) => {
    onClick(e);
  }}
  class="filter {isSelected ? 'selected' : ''} {disabled
    ? 'disabled'
    : ''}  d-inline-flex gap-1 align-items-center justify-content-center"
>
  {#if startIcon && type !== "labelRightIcon"}
    <span
      style="width: 24px; height:24px; display:flex; align-items:center; justify-content:center;"
    >
      <svelte:component this={startIcon} size="16px" />
    </span>
  {/if}

  <span
    class="text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-Medium"
  >
    {label}
  </span>

  {#if endIcon && type !== "labelLefttIcon"}
    <span
      style="width: 24px; height:24px; display:flex; align-items:center; justify-content:center;"
    >
      <svelte:component this={endIcon} size="16px" />
    </span>
  {/if}
</button>

<style lang="scss">
  .filter {
    border-radius: 4px;
    padding: 2px 8px 2px 6px;
    gap: 4px;
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-100);
    border: none;
    transition: all 0.2s ease-in-out;
  }

  .filter:hover {
    background-color: var(--bg-ds-surface-100);
    color: var(--text-ds-neutral-50);
  }

  .filter:active:not(.selected) {
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-50);
  }

  .filter:focus-visible {
    background-color: var(--bg-ds-surface-100);
    color: var(--text-ds-neutral-50);
    border: 2px solid var(--bg-ds-primary-300);
    outline: none;
  }

  .filter.selected {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    border: 1px solid var(--border-ds-primary-300);
  }
  .filter.disabled {
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-500);
    border: none;
    border-radius: 4px;
  }
</style>
