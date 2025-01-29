<script lang="ts">
  import type { SearchSuggestion } from "./types/types";

  export let suggestions: SearchSuggestion[];
  export let selectedType = "";

  const handleTagClick = (label: string) => {
    if (selectedType === label) {
      selectedType = "";
    } else {
      selectedType = label;
    }
  };
</script>

<div class="tags-container">
  {#each suggestions as suggestion}
    <button
      class="suggestion-tag"
      role="button"
      class:selected={selectedType === suggestion.label}
      tabindex="0"
      on:click={() => handleTagClick(suggestion.label)}
    >
      <div class="tag-icon-wrapper">
        <img src={suggestion.icon} alt="" class="tag-icon" />
      </div>
      <span class="tag-label">{suggestion.label}</span>
    </button>
  {/each}
</div>

<style>
  .tags-container {
    border-bottom: 1px solid rgba(49, 53, 63, 1);
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px;
  }

  .suggestion-tag.selected {
    border: 1px solid #6894f9;
    background-color: #31353f;
  }

  .suggestion-tag {
    border: none;
    border-radius: 4px;
    background-color: rgba(39, 41, 53, 1);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px 4px 6px;
    cursor: pointer;
    min-width: 72px;
  }

  .suggestion-tag:hover {
    background-color: #31353f;
  }

  .tag-icon-wrapper {
    display: flex;
    align-items: center;
    width: 20px;
    padding: 2px;
  }

  .tag-icon {
    width: 16px;
    height: 16px;
  }

  .tag-label {
    color: var(--Neutral-200, #b6b7b9);
    font:
      500 12px Inter,
      sans-serif;
  }
  .suggestion-tag:hover .tag-label {
    color: var(--Neutral-200, #ffffff);
  }

  @media (max-width: 991px) {
    .tags-container {
      max-width: 100%;
    }
  }
</style>
