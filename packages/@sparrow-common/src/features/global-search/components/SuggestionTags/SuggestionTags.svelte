<script lang="ts">
  import { FilterChip } from "@sparrow/library/ui";
  import type { SearchSuggestion } from "../../types/types";

  export let suggestions: SearchSuggestion[];
  export let selectedType = "";
  export let searchBarRef;

  const handleTagClick = (label: string) => {
    const normalizedSelected = selectedType.toLowerCase();
    const normalizedLabel = label.toLowerCase();

    if (normalizedSelected === normalizedLabel) {
      selectedType = "";
    } else {
      selectedType = label;
    }
    searchBarRef.focus();
  };

  $: isSelected = (label: string) => {
    const normalizedSelected = selectedType.toLowerCase();
    const normalizedLabel = label.toLowerCase();
    return normalizedSelected === normalizedLabel;
  };
</script>

<div class="tags-container">
  {#each suggestions as suggestion}
    {#if suggestion?.show}
      <FilterChip
        type="labelLeftIcon"
        startIcon={suggestion.icon}
        label={suggestion.label}
        isSelected={isSelected(suggestion.label)}
        onClick={() => handleTagClick(suggestion.label)}
      />
    {/if}
  {/each}
</div>

<style>
  .tags-container {
    border-bottom: 1px solid var(--border-ds-surface-100);
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px;
  }

  .suggestion-tag.selected {
    border: 1px solid var(--border-ds-primary-300);
    background-color: var(--bg-ds-surface-100);
    --text-color: var(--text-ds-neutral-50);
    --icon-color: var(--icon-ds-neutral-50);
    color: var(--icon-ds-neutral-50);
  }

  .suggestion-tag {
    border: none;
    border-radius: 4px;
    background-color: var(--bg-ds-surface-300);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px 4px 6px;
    cursor: pointer;
    min-width: 72px;
    --icon-color: var(--icon-ds-neutral-200);
  }

  .suggestion-tag:hover {
    background-color: var(--bg-ds-surface-100);
    --icon-color: var(--white-color);
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
    color: var(--text-ds-neutral-200);
    font:
      500 12px Inter,
      sans-serif;
  }
  .suggestion-tag.selected .tag-label {
    color: var(--icon-ds-neutral-50);
  }

  .suggestion-tag:hover .tag-label {
    color: var(--white-color);
  }

  @media (max-width: 991px) {
    .tags-container {
      max-width: 100%;
    }
  }
</style>
