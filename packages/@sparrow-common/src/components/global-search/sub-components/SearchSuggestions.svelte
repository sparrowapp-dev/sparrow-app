<script lang="ts">
  import type { SearchSuggestion } from "./types/types";
  import SuggestionTags from "./SuggestionTags.svelte";
  import RecentItems from "./RecentItems.svelte";
  export let suggestions: SearchSuggestion[];
  export let filteredCollection = [];
  export let filteredFolder = [];
  export let filteredRequest = [];
  export let searchQuery = "";
  export let handlehideGlobalSearch;
  export let closeGlobalSearch;
  export let checkActiveWorkspace;
  export let handleSwitchWorkspaceModal;
  export let handleGlobalSearchRequestNavigation;
  export let handleGlobalSearchCollectionNavigation;
  export let handleGlobalSearchFolderNavigation;
  export let handleGlobalSearchWorkspaceNavigation;
  export let handleGlobalSearchEnvironmentNavigation;
  export let handleGlobalSearchTestflowNavgation;
  export let selectedType;
  export let filteredWorkspaces;
  export let filteredTestflows;
  export let filteredEnvironments;
  export let isWebApp = false;
</script>

<div class="suggestions-container">
  <SuggestionTags {suggestions} bind:selectedType />
  <RecentItems
    {handleSwitchWorkspaceModal}
    {searchQuery}
    {filteredCollection}
    {filteredFolder}
    {filteredRequest}
    {filteredWorkspaces}
    {filteredTestflows}
    {filteredEnvironments}
    {selectedType}
    {closeGlobalSearch}
    {handlehideGlobalSearch}
    {checkActiveWorkspace}
    {handleGlobalSearchRequestNavigation}
    {handleGlobalSearchCollectionNavigation}
    {handleGlobalSearchFolderNavigation}
    {handleGlobalSearchWorkspaceNavigation}
    {handleGlobalSearchEnvironmentNavigation}
    {handleGlobalSearchTestflowNavgation}
    {isWebApp}
  />
</div>

<style>
  .suggestions-container {
    background: var(--bg-ds-surface-700);
    box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.4);
    display: flex;
    width: 100%;
    flex-direction: column;
    flex: 1;
    gap: var(--gap-gap-4, 4px);
    overflow-y: auto;
  }

  @media (max-width: 991px) {
    .suggestions-container {
      max-width: 100%;
    }
  }
</style>
