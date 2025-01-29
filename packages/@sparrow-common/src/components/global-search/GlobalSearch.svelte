<script lang="ts">
  import SearchBar from "./sub-components/SearchBar.svelte";
  import SearchSuggestions from "./sub-components/SearchSuggestions.svelte";
  import type { SearchSuggestion } from "./sub-components/types/types";
  import type { CollectionDocument } from "@app/database/database";
  import { onMount } from "svelte";
  import {
    FolderIcon,
    EnvironmentIcon,
    CollectionIcon,
    WorkspaceIcon,
    FlowIcon,
    RequestIcon,
  } from "@sparrow/common/images";

  export let closeGlobalSearch;
  export let workspaceDocuments;
  export let collectionDocuments;
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
<<<<<<< HEAD
  export let selectedType;
=======
  export let handleSearchNode;
  export let handlehideGlobalSearch;
>>>>>>> 9b302441a968fe6673179762e02b51c81a14a10f

  let workspaceDetailsMap: Record<
    string,
    { teamName: string; workspaceName: string }
  > = {};

  const getCollectionDocument = (elem: CollectionDocument) => {
    return {
      id: elem.id,
      name: elem.name,
      totalRequests: elem.totalRequests,
      items: elem.items,
      activeSync: elem.activeSync,
      activeSyncUrl: elem.activeSyncUrl,
      createdBy: elem.createdBy,
      createdAt: elem.createdAt,
      updatedBy: elem.updatedBy,
      updatedAt: elem.updatedAt,
      branches: elem.branches,
      primaryBranch: elem.primaryBranch,
      currentBranch: elem.currentBranch,
      localRepositoryPath: elem.localRepositoryPath,
      workspaceId: elem.workspaceId,
    };
  };

  let searchQuery = "";
  let filteredCollection = [];
  let filteredFolder = [];
  let filteredRequest = [];
  let collectionsData = [];
  let hideGlobalSearch = false;

  collectionDocuments.subscribe((value) => {
    if (value) {
      const collectionArr = value.map(
        (collectionDocument: CollectionDocument) => {
          const collectionObj = getCollectionDocument(collectionDocument);
          return collectionObj;
        },
      );
      collectionsData = collectionArr;
    }
  });

  const handleSearch = () => {
    filteredCollection.length = 0;
    filteredFolder.length = 0;
    filteredRequest.length = 0;

<<<<<<< HEAD
    searchNode(
=======
    handleSearchNode(
>>>>>>> 9b302441a968fe6673179762e02b51c81a14a10f
      searchQuery,
      filteredCollection,
      filteredFolder,
      filteredRequest,
      collectionsData,
      "",
      workspaceDetailsMap,
    );
  };

  const suggestions: SearchSuggestion[] = [
    {
      type: "workspace",
      label: "Workspaces",
      icon: WorkspaceIcon,
    },
    {
      type: "collection",
      label: "Collections",
      icon: CollectionIcon,
    },
    {
      type: "environment",
      label: "Environments",
      icon: EnvironmentIcon,
    },
    {
      type: "folder",
      label: "Folders",
      icon: FolderIcon,
    },
    {
      type: "flow",
      label: "Flows",
      icon: FlowIcon,
    },
    {
      type: "request",
      label: "Requests",
      icon: RequestIcon,
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
    <SearchBar bind:searchQuery {handleSearch} />
    <SearchSuggestions
      {handleSwitchWorkspaceModal}
      {suggestions}
      {searchQuery}
      {filteredCollection}
      {filteredFolder}
      {filteredRequest}
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
      {selectedType}
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
