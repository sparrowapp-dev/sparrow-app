<script lang="ts">
  import type { SearchSuggestion } from './types';
  
  export let suggestions: SearchSuggestion[];
</script>

<div class="tags-container">
  {#each suggestions as suggestion}
    <button 
      class="suggestion-tag"
      role="button"
      tabindex="0"
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
    font: 500 12px Inter, sans-serif;
  }

  @media (max-width: 991px) {
    .tags-container {
      max-width: 100%;
    }
  }
</style>