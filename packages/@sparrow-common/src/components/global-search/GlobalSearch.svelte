<script lang="ts">
  import { SearchBar } from ".";
  import { SearchSuggestions } from ".";
  import type { SearchSuggestion } from "./types";
  import { useTree } from "./CollectionList";
  import type { CollectionDocument } from "@app/database/database";
  import { onMount } from "svelte";
  import folderIcon from "../../../static/folderIcon.png";
  import environmentIcon from "../../../static/envLayer.png";
  import collectionIcon from "../../../static/collectionStack.png";
  import workspaceIcon from "../../../static/workspaceBoard.png";
  import flowchartIcon from "../../../static/flowIcon.png";
  import requestIcon from "../../../static/arrowSwap.png";

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

  const [, , searchNode] = useTree();

  const handleSearch = () => {
    console.log("searching DB");

    filteredCollection.length = 0;
    filteredFolder.length = 0;
    filteredRequest.length = 0;

    console.log("collection data is", collectionsData);

    searchNode(
      searchQuery,
      filteredCollection,
      filteredFolder,
      filteredRequest,
      collectionsData,
      "",
      workspaceDetailsMap,
    );
  };

  export let onClose = () => {};
  export let handlehideGlobalSearch;

  const suggestions: SearchSuggestion[] = [
    {
      type: "workspace",
      label: "Workspaces",
      icon: workspaceIcon,
    },
    {
      type: "collection",
      label: "Collections",
      icon: collectionIcon,
    },
    {
      type: "environment",
      label: "Environments",
      icon: environmentIcon,
    },
    {
      type: "folder",
      label: "Folders",
      icon: folderIcon,
    },
    {
      type: "flow",
      label: "Flows",
      icon: flowchartIcon,
    },
    {
      type: "request",
      label: "Requests",
      icon: requestIcon,
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
      console.log("workspace details map", workspaceDetailsMap);
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
    />
  {/if}
</div>

<style>
  .search-container {
    border-radius: var(--padding-padding-12, 12px);
    border: 1px solid var(--Surface-100, #31353f);
    box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.4);
    display: flex;
    max-width: 630px;
    width: 630px;
    max-height: 540px;
    flex-direction: column;
    overflow: hidden;
    background-color: #14181f;
  }

  @media (max-width: 991px) {
    .search-container {
      max-width: 100%;
    }
  }
</style>
