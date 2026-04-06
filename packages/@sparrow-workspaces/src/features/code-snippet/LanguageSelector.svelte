<script lang="ts">
  import { LANGUAGES } from "./utils/languages";

  export let selectedLanguage = "javascript";
  export let selectedTab = "fetch";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let open = false;

  const handleSelect = (lang) => {
    selectedLanguage = lang.key;
    selectedTab = lang.tabs[0].value;

    dispatch("change", {
      language: selectedLanguage,
      tab: selectedTab,
    });

    open = false;
  };
</script>

<div class="dropdown">
  <div class="selected" on:click={() => (open = !open)}>
    {#each LANGUAGES as lang}
      {#if lang.key === selectedLanguage}
        <span class="label">
          {lang.label}{lang.tabs.length > 1 ? `(${lang.tabs.length})` : ""}
        </span>

        <span class="arrow {open ? 'open' : ''}">▾</span>
      {/if}
    {/each}
  </div>

  {#if open}
    <div class="menu">
      {#each LANGUAGES as lang}
        <div class="item" on:click={() => handleSelect(lang)}>
          {lang.label}{lang.tabs.length > 1 ? `(${lang.tabs.length})` : ""}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
  }
  .selected {
    cursor: pointer;

    font-size: 12px;
    line-height: 16px;

    min-width: 140px;
    height: 28px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    background: #181c26;
    padding: 0 8px;
    border-radius: 6px;

    color: #f4f9ff;
  }

  .label {
    display: flex;
    align-items: center;
  }
  .menu {
    position: absolute;
    top: calc(100% + 4px); /* 🔥 dynamic spacing */
    left: 0;

    z-index: 1000; /* 🔥 ensures above tabs */

    background: #14181f;
    border: 1px solid #2a2f3a;
    border-radius: 6px;

    padding: 4px 0;
    width: 180px;
    max-height: 220px;
    overflow-y: auto;
  }
  .group {
    font-size: 11px;
    color: #888;
    margin-top: 6px;
  }
  .item {
    font-size: 12px;
    line-height: 16px;

    color: #d1d5db; /* match trigger */

    padding: 6px 10px;
    cursor: pointer;
    border-radius: 4px;
  }
  .item:hover {
    background: #2a2f3a;
  }
  .menu::-webkit-scrollbar {
    width: 6px;
  }

  .menu::-webkit-scrollbar-thumb {
    background: #2a2f3a;
    border-radius: 4px;
  }

  .arrow {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 700; /* 🔥 bold */
    line-height: 1;

    display: flex;
    align-items: center;

    transition: transform 0.2s ease;
  }

  .arrow.open {
    transform: rotate(180deg); /* 🔥 rotate when open */
  }
</style>
