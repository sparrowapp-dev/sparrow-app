<script lang="ts">
  import SearchBar from "./sub-components/SearchBar.svelte";
  import SearchSuggestions from "./sub-components/SearchSuggestions.svelte";
  import type { SearchSuggestion } from "./sub-components/types/types";
  import { onMount } from "svelte";
  import {
    FolderIcon,
    EnvironmentIcon,
    CollectionIcon,
    WorkspaceIcon,
    FlowIcon,
    RequestIcon,
  } from "@sparrow/common/images";
  import { OSDetector } from "@sparrow/common/utils";

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
  let osKeyName = "Ctrl";

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
      icon: WorkspaceIcon,
      show: !isGuestUser,
    },
    {
      type: "collection",
      label: "Collections",
      icon: CollectionIcon,
      show: true,
    },
    {
      type: "environment",
      label: "Environments",
      icon: EnvironmentIcon,
      show: true,
    },
    {
      type: "folder",
      label: "Folders",
      icon: FolderIcon,
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
      icon: RequestIcon,
      show: true,
    },
  ];

  const decidingKey = () => {
    const os = new OSDetector();
    if (os.getOS() == "macos") {
      osKeyName = "Cmd";
    }
  };

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
      decidingKey();
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    }
  });
</script>

<div class="search-container">
  {#if !hideGlobalSearch}
    <SearchBar bind:searchQuery {handleSearch} bind:searchBarRef {osKeyName} />
    <SearchSuggestions
      bind:searchBarRef
      {handleSwitchWorkspaceModal}
      {suggestions}
      {searchQuery}
      {filteredCollection}
      {filteredFolder}
      {filteredRequest}
      {filteredWorkspaces}
      {filteredTestflows}
      {filteredEnvironments}
      {closeGlobalSearch}
      {handlehideGlobalSearch}
      {checkActiveWorkspace}
      {handleGlobalSearchRequestNavigation}
      {handleGlobalSearchCollectionNavigation}
      {handleGlobalSearchFolderNavigation}
      {handleGlobalSearchWorkspaceNavigation}
      {handleGlobalSearchEnvironmentNavigation}
      {handleGlobalSearchTestflowNavgation}
      {selectedType}
      {isWebApp}
      {isGuestUser}
      {osKeyName}
    />
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

  @media (max-width: 991px) {
    .search-container {
      max-width: 100%;
    }
  }
</style>
