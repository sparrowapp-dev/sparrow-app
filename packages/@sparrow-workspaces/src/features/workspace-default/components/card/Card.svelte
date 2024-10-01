<script lang="ts">
  import { PlusIcon } from "@sparrow/library/icons";

  export let icon;
  export let label: string;
  export let iconColor: string;
  export let iconSize: string;
  export let onClick: () => void;
</script>

<div class="card" on:click={onClick}>
  <div class="card-content">
    {#if icon}
      <svelte:component
        this={icon}
        color={iconColor}
        height={iconSize}
        width={iconSize}
      />
    {/if}
  </div>
  <div class="card-footer">
    <span><PlusIcon color="var(--white-color)" /></span>
   <span class="text-fs-14"  style="font-weight: 400;">
    {label}
   </span>
  </div>
</div>

<style>
  .card {
    height: 120px;
    width: 120px;
    border: 0.5px solid var(--border-tertiary-400);
    border: none;
    background-color: var(--bg-secondary-850);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }

  .card-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 79px;
  }

  .card-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 41px;
    border: none;
    color: var(--text-secondary-110);
    background-color: var(--text-tertiary-400);
    padding: 10px;
    font-size: 14px;
  }
</style>
