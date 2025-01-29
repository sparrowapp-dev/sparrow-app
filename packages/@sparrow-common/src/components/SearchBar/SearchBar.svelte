<script lang="ts">
  export let searchQuery = "";
  export let placeholder = "Search Sparrow...";
  export let onClick = () => {};
  import { SearchIcon } from "@sparrow/library/assets";
</script>

<div class="container" on:click={onClick}>
  <div class="first">
    <div class="image-container">
    <SearchIcon color="#82858A" class="image-container-img" />
  </div>

  <input type="text" class="input" {placeholder} bind:value={searchQuery} />
  </div>
  <div class="keys">
    <span class="key">Ctrl</span>
    <span class="key">A</span>
  </div>
</div>

<style>

  .first{
    display: flex;
    gap: 4px;
  }
  .container {
    width: 198px;
    height: 30px;
    border: 1px solid #31353f;
    min-height: 30px;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
  
    align-items: center;
    gap: 8px;
  }
   .container:hover{
    border: 1px solid var(--border-ds-neutral-200);
    background-color: var(--bg-ds-surface-500);
  }
  .input {
    border: none;
    outline: none;
    color: #82858a;
    font:
      400 12px Inter,
      sans-serif;
    line-height: 18px;
    background: transparent;
    width: 90px;
    height: 16px;
  }
  /* .input:hover{
    color:#D8D8D9;
  } */
  
  .image-container-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    color: #82858a;
  }
  .image-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 2px;
    color: #82858a;
  }

  .keys{
    display: flex;
    gap: 2px;
  }
   .key {
    border-radius: 4px;
    background-color: #181c26;
    color: var(--Neutral-200, #B6B7B9);
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
