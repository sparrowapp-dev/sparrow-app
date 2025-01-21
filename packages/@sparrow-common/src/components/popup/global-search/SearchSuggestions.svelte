<script lang="ts">
  import type { SearchSuggestion } from './types';
  import {SuggestionTags} from '.';
  import {RecentItems} from '.';
  export let suggestions: SearchSuggestion[];
</script>

<div class="suggestions-container">
  <SuggestionTags {suggestions} />
  <RecentItems />
</div>

<style>
  .suggestions-container {
    background: var(--Surface-700, #14181f);
    box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.4);
    display: flex;
    width: 100%;
    flex-direction: column;
    flex: 1;
    gap: var(--gap-gap-4, 4px);
  }

  @media (max-width: 991px) {
    .suggestions-container {
      max-width: 100%;
    }
  }
</style>