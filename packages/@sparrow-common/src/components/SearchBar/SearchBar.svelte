<script lang="ts">
  export let searchQuery = "";
  export let placeholder = "Search Sparrow...";
  export let onClick = () => {};
  import { SearchIcon } from "@sparrow/library/assets";
  let isHovered=false;
  var color=isHovered?"#D8D8D9": "#82858a";
</script>

<div class="container" on:click={onClick} on:mouseenter={()=>isHovered=true} on:mouseleave={()=>isHovered=false}>
  <div class="first">
    <div class="image-container">
      <SearchIcon color=var(--white-color) class="image-container-img" />
    </div>

    <input type="text" class="input" {placeholder} bind:value={searchQuery} />
  </div>
  <div class="keys">
    <span class="key">Ctrl</span>
    <span class="key">F</span>
  </div>
</div>

<style>
  .first {
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
  .container:hover {
    border: 1px solid var(--border-ds-neutral-200);
    background-color: var(--bg-ds-surface-500);
    
  }
  /* .container:hover .input::placeholder{
    color: var(--white-color);
  } */
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
  .input::placeholder{
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
    background-color: var(--bg-ds-surface-600);
    color: var(--Neutral-200, var(--bg-ds-neutral-200));
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
