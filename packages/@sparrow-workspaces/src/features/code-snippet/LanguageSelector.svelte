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
  }
  .menu {
    position: absolute;
    top: 28px;
    background: #181c26;
    border: 1px solid #31353f;
    border-radius: 6px;
    padding: 6px;
    width: 180px;
  }
  .group {
    font-size: 11px;
    color: #888;
    margin-top: 6px;
  }
  .item {
    padding: 6px;
    cursor: pointer;
  }
  .item:hover {
    background: #2a2f3a;
  }
</style>
