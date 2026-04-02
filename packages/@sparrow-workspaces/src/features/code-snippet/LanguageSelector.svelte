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
        {lang.label}{lang.tabs.length > 1 ? `(${lang.tabs.length})` : ""} ▾
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
    color: #d8d8d9;

    width: 180px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    background: #181c26;
    padding: 6px 10px;
    border-radius: 4px;
  }
  .menu {
    position: absolute;
    top: 32px;
    background: #181c26;
    border: 1px solid #31353f;
    border-radius: 6px;
    padding: 6px;
    width: 180px;
    max-height: 250px;
    overflow-y: auto;
  }
  .group {
    font-size: 11px;
    color: #888;
    margin-top: 6px;
  }
  .item {
    padding: 8px 10px;
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
</style>
