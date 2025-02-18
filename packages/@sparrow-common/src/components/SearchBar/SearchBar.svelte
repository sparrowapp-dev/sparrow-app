<script lang="ts">
  export let searchQuery = "";
  export let placeholder = "Search Sparrow...";
  export let onClick = () => {};
  import { SearchIcon } from "@sparrow/library/assets";
  import { OSDetector } from "../../utils";
  import { onMount } from "svelte";
  import { KeyboardShortcuts } from "@sparrow/library/ui";
  let keyName = "Ctrl";

  const decidingKey = () => {
    const os = new OSDetector();
    if (os.getOS() == "macos") {
      keyName = "Cmd";
    }
  };
  onMount(() => {
    decidingKey();
  });
</script>

<div class="container" on:click={onClick}>
  <div class="first">
    <div class="image-container">
      <SearchIcon
        color="var(--icon-ds-neutral-400)"
        class="image-container-img"
      />
    </div>

    <input
      type="text"
      class="input"
      {placeholder}
      bind:value={searchQuery}
      maxlength="0"
    />
  </div>
  <div class="keys">
    <KeyboardShortcuts keys={[keyName, "F"]} />
  </div>
</div>

<style>
  .first {
    display: flex;
    gap: 4px;
  }
  .container {
    width: 208px;
    height: 30px;
    border: 1px solid var(--border-ds-surface-100);
    min-height: 30px;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;

    align-items: center;
    gap: 8px;
    margin-right: 6px;
  }
  .container:hover {
    border: 1px solid var(--border-ds-neutral-200);
    background-color: var(--bg-ds-surface-500);
  }
  .input {
    border: none;
    outline: none;
    color: var(--text-ds-neutral-400);
    font:
      400 12px Inter,
      sans-serif;
    line-height: 18px;
    background: transparent;
    width: 90px;
    height: 16px;
  }
  .input::placeholder {
    color: var(--text-ds-neutral-400);
  }

  .image-container-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    color: var(--text-ds-neutral-400);
  }
  .image-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 2px;
    color: var(--text-ds-neutral-400);
  }

  .keys {
    display: flex;
    gap: 2px;
  }
  .key {
    border-radius: 4px;
    background-color: #181c26;
    color: var(--text-ds-neutral-200);
    padding: 2px 4px;
    font:
      400 12px Inter,
      sans-serif;
    line-height: 18px;

    min-width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
