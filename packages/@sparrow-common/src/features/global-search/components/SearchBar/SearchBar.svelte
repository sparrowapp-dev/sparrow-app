<script lang="ts">
  export let searchQuery = "";
  export let handleSearch = () => {};
  import { SearchIcon } from "@sparrow/library/icons";
  import { KeyboardShortcuts } from "@sparrow/library/ui";
  import { onMount } from "svelte";
  export let osKeyName = "Ctrl";
  export let searchBarRef;
  let hideKEY = false;
  $: hideKEY = searchQuery.trim().length > 0;
  onMount(() => {
    searchBarRef.focus();
  });
</script>

<div class="search-bar">
  <div class="search-input-wrapper">
    <div class="icon-wrapper">
      <SearchIcon color="var(--search-icon-color)" />
    </div>
    <div class="input-wrapper">
      <label for="searchInput" class="visually-hidden">Search</label>
      <input
        type="text"
        id="searchInput"
        bind:value={searchQuery}
        on:input={handleSearch}
        class="search-input"
        placeholder="Search Sparrow"
        aria-label="Search"
        autocomplete="off"
        bind:this={searchBarRef}
      />
    </div>
  </div>
  {#if !hideKEY}
    <KeyboardShortcuts keys={[osKeyName, "F"]} />
  {/if}
</div>

<style>
  .search-bar {
    border-radius: 2px 2px 0 0;
    background-color: var(--bg-ds-surface-700);
    display: flex;
    max-height: 44px;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 10px 8px;
    border: 1px solid var(--bg-ds-surface-100);
    --search-icon-color: var(--text-ds-neutral-300);
  }

  .search-bar:hover {
    --search-icon-color: var(--text-ds-neutral-200);
  }

  .search-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  .icon-wrapper {
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    padding: 4px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 2px;
    width: 100%;
  }

  .search-input {
    background: transparent;
    border: none;
    color: var(--text-ds-neutral-200);
    font:
      300 14px/1 Inter,
      sans-serif;
    outline: none;
    width: 100%;
    caret-color: var(--text-ds-primary-300);
    line-height: 143%;;
  }
  .search-input::placeholder {
    color: var(--text-ds-neutral-500);
    font-size: 14px;
    font-weight: 300;
    font: Inter, sans-serif;
    line-height: 143%;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
