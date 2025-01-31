<script lang="ts">
  let searchInput: HTMLInputElement;
  export let searchQuery = "";

  export let handleSearch = () => {};
  import { keyCommand, SearchIcon } from "@sparrow/common/images";
  let hideKEY = false;
  $: hideKEY = searchQuery.trim().length > 0;
</script>

<div class="search-bar">
  <div class="search-input-wrapper">
    <div class="icon-wrapper">
      <SearchIcon color="var(--search-icon-color)"/>
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
      />
    </div>
  </div>
  {#if !hideKEY}
    <div class="keyboard-shortcut">
      <div class="shortcut-key">
        <img src={keyCommand} alt="" class="shortcut-icon" />
      </div>
      <span class="key">F</span>
    </div>
  {/if}
</div>

<style>
  .search-bar {
    border-radius: 2px 2px 0 0;
    background-color: var(--bg-ds-surface-700);
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 10px 8px;
    border: 1px solid var(--bg-ds-surface-100);
    --search-icon-color:var(--text-ds-neutral-300)
  }

  .search-bar:hover{
     --search-icon-color:var(--text-ds-neutral-200);
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
    padding: 2px;
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
      400 14px/1 Inter,
      sans-serif;
    outline: none;
    width: 100%;
    caret-color: var(--text-ds-primary-300);

  }
  .search-input::placeholder{
    color:var(--text-ds-neutral-500);
  }

  .shortcut-icon {
    width: 16px;
    height: 16px;
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
