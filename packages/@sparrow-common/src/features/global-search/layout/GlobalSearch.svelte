<script lang="ts">
  import SearchBar from "../components/SearchBar/SearchBar.svelte";
  import type { SearchSuggestion } from "../types/types";
  import { onMount } from "svelte";
  import {
    FlowIcon,
    RequestIcon2,
    WorkspaceIcongs,
    FolderIcon4,
    StackIcon,
    CollectionIcongs,
  } from "@sparrow/library/icons";
  import SuggestionTags from "../components/SuggestionTags/SuggestionTags.svelte";
  import RecentItems from "../components/RecentItems/RecentItems.svelte";

  export let closeGlobalSearch;
  export let workspaceDocuments;
  export let checkActiveWorkspace;
  export let handleSwitchWorkspaceModal;
  export let handleGlobalSearchRequestNavigation;
  export let handleGlobalSearchCollectionNavigation;
  export let handleGlobalSearchFolderNavigation;
  export let handleGlobalSearchWorkspaceNavigation;
  export let handleGlobalSearchEnvironmentNavigation;
  export let handleGlobalSearchTestflowNavgation;
  export let selectedType;
  export let handleSearchNode;
  export let handlehideGlobalSearch;
  export let isWebApp = false;
  export let isGuestUser = false;

  let workspaceDetailsMap: Record<
    string,
    { teamName: string; workspaceName: string }
  > = {};

  let searchQuery = "";
  let filteredCollection = [];
  let filteredFolder = [];
  let filteredRequest = [];
  let filteredTestflows = [];
  let filteredWorkspaces = [];
  let filteredEnvironments = [];
  let hideGlobalSearch = false;
  let searchBarRef = "";

  const handleSearch = async () => {
    const { collection, folder, file, workspace, testflow, environment } =
      await handleSearchNode(searchQuery, workspaceDetailsMap);
    filteredCollection = collection;
    filteredFolder = folder;
    filteredRequest = file;
    filteredWorkspaces = workspace;
    filteredTestflows = testflow;
    filteredEnvironments = environment;
  };

  const suggestions: SearchSuggestion[] = [
    {
      type: "workspace",
      label: "Workspaces",
      icon: WorkspaceIcongs,
      show: !isGuestUser,
    },
    {
      type: "collection",
      label: "Collections",
      icon: CollectionIcongs,
      show: true,
    },
    {
      type: "environment",
      label: "Environments",
      icon: StackIcon,
      show: true,
    },
    {
      type: "folder",
      label: "Folders",
      icon: FolderIcon4,
      show: true,
    },
    {
      type: "flow",
      label: "Flows",
      icon: FlowIcon,
      show: true,
    },
    {
      type: "request",
      label: "Requests",
      icon: RequestIcon2,
      show: true,
    },
  ];

  onMount(async () => {
    try {
      workspaceDetailsMap = workspaceDocuments.reduce((acc, workspace) => {
        acc[workspace._data._id] = {
          teamName: workspace._data.team.teamName,
          workspaceName: workspace._data.name,
        };
        return acc;
      }, {});
      handleSearch();
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    }
  });
</script>

<div class="search-container">
  {#if !hideGlobalSearch}
    <SearchBar bind:searchQuery {handleSearch} bind:searchBarRef />
    <div class="suggestions-container">
      <SuggestionTags {suggestions} bind:selectedType bind:searchBarRef />
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
        {isGuestUser}
      />
    </div>
  {/if}
</div>

<style>
  .search-container {
    border-radius: var(--padding-padding-12, 12px);
    border: 1px solid var(--bg-ds-surface-100);
    box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.4);
    display: flex;
    max-width: 630px;
    width: 630px;
    max-height: 540px;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--bg-ds-surface-700);
  }
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
    .search-container {
      max-width: 100%;
    }
  }
</style>
