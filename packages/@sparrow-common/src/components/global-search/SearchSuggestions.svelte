<script lang="ts">
  import type { SearchSuggestion } from "./types";
  import { SuggestionTags } from ".";
  import { RecentItems } from ".";
  export let suggestions: SearchSuggestion[];
  export let filteredCollection = [];
  export let filteredFolder = [];
  export let filteredRequest = [];
  export let filteredWorkspace = [];
  export let searchQuery = "";
  export let handlehideGlobalSearch;
  let selectedType = "";
  export let closeGlobalSearch;
  export let workspaceDetailsMap: Record<
    string,
    { teamName: string; workspaceName: string }
  > = {};
  $: console.log("filtered workspace is", filteredWorkspace);
  export let checkActiveWorkspace;
  export let handleSwitchWorkspaceModal;
  export let handleGlobalSearchRequestNavigation;
  export let handleGlobalSearchCollectionNavigation;
  export let handleGlobalSearchFolderNavigation;
  export let handleGlobalSearchWorkspaceNavigation;
  export let handleGlobalSearchEnvironmentNavigation;
  export let handleGlobalSearchTestflowNavgation;
  export let searchTestflow;
  export let searchEnvironment;
  export let searchWorkspace;
  export let recentTestflow;
  export let recentEnvironment;
  export let recentWorkspace;
</script>

<div class="suggestions-container">
  <SuggestionTags {suggestions} bind:selectedType />
  <RecentItems
    {handleSwitchWorkspaceModal}
    {searchQuery}
    {filteredCollection}
    {filteredFolder}
    {filteredRequest}
    {filteredWorkspace}
    {selectedType}
    {closeGlobalSearch}
    {handlehideGlobalSearch}
    {workspaceDetailsMap}
    {checkActiveWorkspace}
    {handleGlobalSearchRequestNavigation}
    {handleGlobalSearchCollectionNavigation}
    {handleGlobalSearchFolderNavigation}
    {handleGlobalSearchWorkspaceNavigation}
    {handleGlobalSearchEnvironmentNavigation}
    {handleGlobalSearchTestflowNavgation}
    {searchTestflow}
    {searchWorkspace}
    {searchEnvironment}
    {recentWorkspace}
    {recentEnvironment}
    {recentTestflow}
  />
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
