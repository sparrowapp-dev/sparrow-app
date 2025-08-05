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
    WorkspaceRegular,
    StackRegular,
    LayerRegular,
    FolderRegular,
    FlowChartRegular,
    ArrowSwapRegular,
  } from "@sparrow/library/icons";
  import SuggestionTags from "../components/SuggestionTags/SuggestionTags.svelte";
  import RecentItems from "../components/RecentItems/RecentItems.svelte";
  import { Debounce, OSDetector } from "@sparrow/common/utils";
  import { afterUpdate } from "svelte";

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
  let osKeyName = "Ctrl";

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

  const debouncedHandleSearch = new Debounce().debounce(
    handleSearch as any,
    400,
  );
  const decidingKey = () => {
    const os = new OSDetector();
    if (os.getOS() == "macos") {
      osKeyName = "Cmd";
    }
  };

  const suggestions: SearchSuggestion[] = [
    {
      type: "workspace",
      label: "Workspaces",
      icon: WorkspaceRegular,
      show: !isGuestUser,
    },
    {
      type: "collection",
      label: "Collections",
      icon: StackRegular,
      show: true,
    },
    {
      type: "environment",
      label: "Environments",
      icon: LayerRegular,
      show: true,
    },
    {
      type: "folder",
      label: "Folders",
      icon: FolderRegular,
      show: true,
    },
    {
      type: "flow",
      label: "Flows",
      icon: FlowChartRegular,
      show: true,
    },
    {
      type: "request",
      label: "Requests",
      icon: ArrowSwapRegular,
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
      decidingKey();
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    }
  });

  let animatedWrapper: HTMLDivElement;
  let previousHeight = 0;

  afterUpdate(() => {
    if (!animatedWrapper) return;

    const newHeight = animatedWrapper.scrollHeight;

    if (previousHeight !== newHeight) {
      animatedWrapper.style.transition = "height 300ms ease-in-out";
      animatedWrapper.style.height = previousHeight + "px";

      // Force reflow to apply the initial height before transition
      void animatedWrapper.offsetHeight;

      animatedWrapper.style.height = newHeight + "px";

      // After animation, reset height to auto to allow future natural growth
      setTimeout(() => {
        if (animatedWrapper) {
          animatedWrapper.style.height = "auto";
        }
      }, 50);

      previousHeight = newHeight;
    }
  });
</script>

<div bind:this={animatedWrapper} class="search-container">
  {#if !hideGlobalSearch}
    <SearchBar
      bind:searchQuery
      handleSearch={debouncedHandleSearch}
      bind:searchBarRef
      {osKeyName}
    />
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
        {osKeyName}
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
    max-width: 656px;
    width: 656px;
    max-height: 540px;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--bg-ds-surface-700);

    /* New styles for opacity transition */
    opacity: 0;
    animation: fadeIn 0.3s ease-in-out 0.1s forwards; /* 300ms duration, 100ms delay */
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
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
