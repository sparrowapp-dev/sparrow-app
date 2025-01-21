<script lang="ts">
  let searchInput: HTMLInputElement;
</script>

<div class="search-bar">
  <div class="search-input-wrapper">
    <div class="icon-wrapper">
      <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/13f8c62a2200b0c9780f05496f0d498ddf7086155ff1c2c93885909581f33660?apiKey=805a55f7a8524d998fb01daccbae8123&" alt="" class="search-icon" />
    </div>
    <div class="input-wrapper">
      <span class="cursor"></span>
      <label for="searchInput" class="visually-hidden">Search</label>
      <input 
        type="text"
        id="searchInput"
        bind:this={searchInput}
        class="search-input"
        placeholder="Search"
        aria-label="Search"
      />
    </div>
  </div>
  <div class="keyboard-shortcut">
    <div class="shortcut-key">
      <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/f47f7a2f6011ca132b561b5ff754edeec46a5f8d29a864d4188fda2fc37cb0a9?apiKey=805a55f7a8524d998fb01daccbae8123&" alt="" class="shortcut-icon" />
    </div>
    <span class="key">F</span>
  </div>
</div>

<style>
  .search-bar {
    border-radius: 2px 2px 0 0;
    background-color: rgba(20, 24, 31, 1);
    display: flex;
    min-height: 44px;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 10px 8px;
    border: 1px solid rgba(49, 53, 63, 1);
  }

  .search-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
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
  }

  .cursor {
    background-color: rgba(104, 148, 249, 1);
    width: 1px;
    height: 18px;
  }

  .search-input {
    background: transparent;
    border: none;
    color: var(--Neutral-500, #62656a);
    font: 400 14px/1 Inter, sans-serif;
    outline: none;
  }

  .keyboard-shortcut {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .shortcut-key {
    border-radius: 4px;
    background-color: rgba(24, 28, 38, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0 2px;
  }

  .shortcut-icon {
    width: 16px;
    height: 16px;
  }

  .key {
    border-radius: 4px;
    background-color: rgba(24, 28, 38, 1);
    color: var(--Neutral-100, #d8d8d9);
    text-align: center;
    width: 24px;
    height: 24px;
    padding: 4px;
    font: 500 12px Inter, sans-serif;
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