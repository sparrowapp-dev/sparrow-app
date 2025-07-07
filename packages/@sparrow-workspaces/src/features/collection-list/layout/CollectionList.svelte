<script lang="ts">
  import { Collection, EmptyCollection, SearchTree } from "../components";
  import {
    angleDownIcon,
    doubleAngleLeftIcon as doubleangleLeft,
  } from "@sparrow/library/assets";
  import { angleRightV2Icon as angleRight } from "@sparrow/library/assets";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Button, List, Options } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
  import { slide } from "svelte/transition";
  import type {
    CollectionDocument,
    EnvironmentDocument,
    TabDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import type {
    Folder,
    Path,
    Request as RequestType,
  } from "@sparrow/common/interfaces/request.interface";
  import { onDestroy, onMount } from "svelte";
  import {
    AddRegular,
    AngleLeftIcon,
    AngleRightIcon,
    ChevronDownRegular,
    ChevronRightRegular,
    CollectionIcon,
    StackRegular,
  } from "@sparrow/library/icons";
  import { createDeepCopy } from "@sparrow/common/utils";

  import { PlusIcon } from "@sparrow/library/icons";
  import { Tooltip } from "@sparrow/library/ui";
  import { isExpandCollection } from "../../../stores/recent-left-panel";
  import { CollectionTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";

  export let collectionList: Observable<CollectionDocument[]>;
  export let showImportCollectionPopup: () => void;
  export let showImportCurlPopup: () => void;
  export let onItemCreated: (entityType: string, args: any) => void;
  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
  export let onCreateMockCollection: (
    collectionId: string,
    workspaceId: string,
  ) => void;
  export let onItemOpened: (entityType: string, args: any) => void;
  export let onSearchCollection: (
    collection: CollectionDocument[],
    searchData: string,
  ) => {
    filteredCollection: CollectionDocument[];
    filteredFile: RequestType[];
    filteredFolder: Folder[];
  };
  export let onBranchSwitched: (collection: CollectionDocument) => void;
  export let onRefetchCollection: (
    workspaceId: string,
    collection: CollectionDocument,
  ) => void;
  /**
   * path of the active tab - collection id, folder id, workspace id
   */
  export let activeTabPath;
  /**
   * id of the active tab
   */
  export let activeTabId;
  export let userRoleInWorkspace: WorkspaceRole;
  export let currentWorkspace: Observable<WorkspaceDocument>;
  export let leftPanelController: {
    leftPanelCollapse: boolean;
    handleCollapseCollectionList: () => void;
  };

  /**
   * Flag to check is user iu guest user
   */
  export let isGuestUser = false;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  export let scrollList;

  export let searchData: string = "";

  export let toggleExpandCollection;

  export let isWebApp = false;
  export let activeTabType;
  export let isFirstCollectionExpand = false;

  export let ActiveTab;
  export let handleTabUpdate;
  export let onCompareCollection;
  export let onSyncCollection;
  export let onUpdateRunningState;

  let isExpandCollectionLine = false;
  let isSharedWorkspace = false;
  // export let handleExpandCollectionLine;

  $: {
    if (activeTabType !== "Collection") {
      handleTabUpdate("");
    }
    if (collectionFilter.find((item) => item?._data?.id === activeTabId)) {
      isExpandCollectionLine = true;
    } else {
      isExpandCollectionLine = false;
    }
  }

  let collectionListDocument: CollectionDocument[];

  let activeWorkspace: WorkspaceDocument;
  let currentWorkspaceId;
  currentWorkspace.subscribe((value) => {
    if (value?._data) {
      currentWorkspaceId = value._data._id;
    }
  });

  let isHovered = false;
  let collectionActive = false;

  const handleCollection = () => {
    collectionActive = false;
  };

  let collectionFilter: any = [];
  /**
   * @description - performs searching on a single collection
   */
  const searchCollectionHelper: (searchText: string, tree: any) => any = (
    searchText,
    tree,
  ) => {
    if (tree.name.toLowerCase().includes(searchText.toLowerCase())) {
      return tree;
    }

    // Recursively search through the collection
    if (tree && tree?.items?.length) {
      let response = [];
      for (let j = 0; j < tree.items.length; j++) {
        const res = searchCollectionHelper(searchText, tree.items[j]);
        if (res) {
          response.push(res);
        }
      }
      if (response.length) {
        let item = createDeepCopy(tree);
        item.items = response;
        return item;
      } else {
        return 0;
      }
    }
    return 0;
  };
  /**
   * @description - searches data from the list of collections
   */
  const searchCollection: (
    searchText: string,
    collectionData: any[],
  ) => void = (searchText, collectionData) => {
    let response = [];
    for (let i = 0; i < collectionData.length; i++) {
      const res = searchCollectionHelper(searchText, collectionData[i]);
      if (res) {
        response.push(res);
      }
    }
    return response;
  };
  /**
   * Handle searching and filtering
   */
  const handleSearch = () => {
    collectionFilter = searchCollection(searchData, collectionListDocument);
  };
  $: {
    if (currentWorkspace) {
      currentWorkspace.subscribe((value) => {
        activeWorkspace = value;
        isSharedWorkspace = value?.isShared || false;
        collectionListDocument = collectionListDocument?.filter(
          (value) => value.workspaceId === activeWorkspace?._id,
        );
      });
    }
  }
  $: {
    if (collectionList) {
      collectionList.subscribe((value) => {
        collectionListDocument = value;
        collectionListDocument = collectionListDocument?.filter(
          (value) =>
            value.workspaceId === activeWorkspace?._id &&
            !(value?.activeSync && activeWorkspace?.isShared),
        );
        collectionFilter = searchCollection(searchData, collectionListDocument);
      });
    }
  }

  onDestroy(() => {});

  const handleMouseOver = () => {
    isHovered = true;
  };

  const handleMouseOut = () => {
    isHovered = false;
  };

  let showAddItemMenu = false;
  let collectionTabWrapper: HTMLElement;
  let noOfColumns = 180;

  const rightClickContextMenu = () => {
    setTimeout(() => {
      showAddItemMenu = !showAddItemMenu;
    }, 100);
  };

  const handleSelectClick = (event: MouseEvent) => {
    const selectElement = document.getElementById(`add-collection-type`);
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showAddItemMenu = false;
    }
  };
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

{#if showAddItemMenu}
  <Options
    xAxis={collectionTabWrapper.getBoundingClientRect().right + 5}
    yAxis={[
      collectionTabWrapper.getBoundingClientRect().top - 5,
      collectionTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={701}
    menuItems={[
      {
        onClick: () => {
          if (isGuestUser) {
            onItemCreated("collection", {
              workspaceId: currentWorkspaceId,
              collection: collectionList,
            });
          } else {
            showImportCollectionPopup();
          }
          isExpandCollection.set(true);
        },
        displayText: "Add Collection",
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          onItemCreated("mockCollection", {
            workspaceId: currentWorkspaceId,
            collection: collectionList,
          });
          isExpandCollection.set(true);
        },
        displayText: "Add Mock Collection",
        disabled: false,
        hidden: isGuestUser ? true : false,
      },
    ]}
  />
{/if}

<div
  style="height:100%; overflow:hidden"
  class={`sidebar d-flex flex-column  scroll px-1`}
  id="collection-container"
>
  <div
    class="d-flex justify-content-between align-items-center align-self-stretch px-0 pt-3 d-none"
  >
    <p class="mb-0 text-whiteColor ellipsis text-fs-16">
      {$currentWorkspace?.name || ""}
    </p>
    <button
      class=" border-0 rounded px-2 angleButton"
      on:click={() => {
        leftPanelController.leftPanelCollapse =
          !leftPanelController.leftPanelCollapse;
        leftPanelController.handleCollapseCollectionList();
      }}
      id="doubleAngleButton"
    >
      <img src={doubleangleLeft} alt="" class="filter-green" />
    </button>
  </div>

  <div
    class="d-flex flex-column collections-list h-100"
    style="margin-top:5px; flex:1;"
  >
    <div
      tabindex="0"
      class="collection-container d-flex align-items-center pe-2 border-radius-2"
      style="cursor:pointer; justify-content: space-between; height:32px; margin-bottom:0;"
      on:mouseover={handleMouseOver}
      on:mouseout={handleMouseOut}
      on:click={() => {
        toggleExpandCollection();
        handleTabUpdate("collection");
      }}
    >
      <div
        class=" d-flex align-items-center"
        style="width: calc(100% - 30px);  padding: 4px 2px; height:32px; "
        bind:this={collectionTabWrapper}
      >
        <span style=" display: flex; margin-right:4px;">
          <Button
            size="extra-small"
            type="teritiary-regular"
            customWidth="24px"
            startIcon={!$isExpandCollection
              ? ChevronRightRegular
              : ChevronDownRegular}
          />
        </span>

        <span
          style="display: flex; align-items:center; justify-content:end; height:24px; width:30px; padding:4px; "
        >
          <StackRegular size="16px" color="var(--bg-ds-neutral-300)" />
        </span>
        <span
          style="display: flex; height:24px; gap:4px; align-items:center; padding:2px 4px; "
        >
          <p
            class="text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-0"
            style=" color:var(--text-ds-neutral-50); "
          >
            Collections
          </p>
        </span>
      </div>

      {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER && !activeWorkspace?.isShared}
        {#if isGuestUser}
          <span style="display:flex;" class="add-icon-container">
            <Button
              id="add-collection-type"
              size="extra-small"
              customWidth={"24px"}
              type="teritiary-regular"
              startIcon={AddRegular}
              disable={userRole === WorkspaceRole.WORKSPACE_VIEWER}
              onClick={(e) => {
                e.stopPropagation();
                if (isGuestUser) {
                  onItemCreated("collection", {
                    workspaceId: currentWorkspaceId,
                    collection: collectionList,
                  });
                } else {
                  showImportCollectionPopup();
                }
                isExpandCollection.set(true);
              }}
            />
          </span>
        {:else}
          <Tooltip
            title={"Add Options"}
            placement={"top-center"}
            distance={13}
            show={!showAddItemMenu}
            zIndex={701}
          >
            <span style="display:flex;" class="add-icon-container">
              <Button
                id="add-collection-type"
                size="extra-small"
                customWidth={"24px"}
                type="teritiary-regular"
                startIcon={AddRegular}
                disable={userRole === WorkspaceRole.WORKSPACE_VIEWER}
                onClick={(e) => {
                  e.stopPropagation();
                  rightClickContextMenu(e);
                }}
              />
            </span>
          </Tooltip>
        {/if}
      {/if}
    </div>

    {#if $isExpandCollection}
      <div
        transition:slide={{ duration: 250 }}
        class="overflow-auto position-relative d-flex flex-column me-0 py-1"
        style={` background-color: ${ActiveTab === "collection" ? "var(--bg-ds-surface-600)" : "transparent"};`}
      >
        {#if collectionListDocument?.length > 0 && searchData.length === 0}
          <div
            class="box-line"
            style="background-color: {isExpandCollectionLine
              ? 'var(--bg-ds-neutral-500)'
              : 'var(--bg-ds-surface-100)'}"
          ></div>
        {/if}
        {#if collectionListDocument?.length > 0}
          {#if searchData.length > 0}
            {#if collectionFilter.length > 0}
              <List
                bind:scrollList
                height={"auto"}
                overflowY={"auto"}
                classProps={"pe-0"}
              >
                {#each collectionFilter as col}
                  <Collection
                    isMockCollection={col?.collectionType ===
                      CollectionTypeBaseEnum.MOCK}
                    bind:userRole
                    {isSharedWorkspace}
                    {onItemCreated}
                    {onItemDeleted}
                    {onItemRenamed}
                    {onItemOpened}
                    {onBranchSwitched}
                    {onRefetchCollection}
                    {userRoleInWorkspace}
                    {activeTabPath}
                    {activeTabType}
                    collection={col}
                    {activeTabId}
                    {searchData}
                    {isWebApp}
                    {onCompareCollection}
                    {onSyncCollection}
                    {onUpdateRunningState}
                    {onCreateMockCollection}
                    {isGuestUser}
                  />
                {/each}
              </List>
            {:else}
              <List
                bind:scrollList
                height={"auto"}
                overflowY={"auto"}
                classProps={"pe-0"}
              >
                <p
                  class="mx-1 text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-regular mb-0 text-center"
                  style="color: var(--text-secondary-550); letter-spacing: 0.5px;"
                >
                  It seems we couldn't find the result matching your search
                  query.
                </p>
              </List>
            {/if}
          {:else}
            <List
              bind:scrollList
              height={"auto"}
              overflowY={"auto"}
              classProps={"pe-0"}
            >
              {#each collectionListDocument as col}
                {#if !(col?.toMutableJSON()?.activeSync && isSharedWorkspace) && col?.collectionType !== CollectionTypeBaseEnum.MOCK}
                  <Collection
                    bind:userRole
                    {isSharedWorkspace}
                    {onItemCreated}
                    {onItemDeleted}
                    {onItemRenamed}
                    {onItemOpened}
                    {onBranchSwitched}
                    {onRefetchCollection}
                    {userRoleInWorkspace}
                    {activeTabPath}
                    {activeTabType}
                    collection={col?.toMutableJSON()}
                    {activeTabId}
                    bind:isFirstCollectionExpand
                    {isWebApp}
                    {onCompareCollection}
                    {onSyncCollection}
                    {onUpdateRunningState}
                    {onCreateMockCollection}
                    {isGuestUser}
                  />
                {/if}
              {/each}
              {#if !collectionListDocument?.some((col) => col?.collectionType !== CollectionTypeBaseEnum.MOCK)}
                <EmptyCollection
                  bind:userRole
                  isCollectionEmpty={!collectionListDocument?.some(
                    (col) =>
                      col?.collectionType !== CollectionTypeBaseEnum.MOCK,
                  )}
                  {onItemCreated}
                  {collectionList}
                  {userRoleInWorkspace}
                  {currentWorkspace}
                  handleCreateApiRequest={() => onItemCreated("request", {})}
                  onImportCollectionPopup={showImportCollectionPopup}
                  isAddCollectionDisabled={isGuestUser}
                  onImportCurlPopup={showImportCurlPopup}
                  {isGuestUser}
                />
              {/if}
              {#if collectionListDocument?.some((col) => col?.collectionType === CollectionTypeBaseEnum.MOCK)}
                <hr style="margin: 2px 0 2px 2rem;" />
                {#each collectionListDocument as col}
                  {#if col?.collectionType === CollectionTypeBaseEnum.MOCK}
                    <Collection
                      isMockCollection={true}
                      bind:userRole
                      {isSharedWorkspace}
                      {onItemCreated}
                      {onItemDeleted}
                      {onItemRenamed}
                      {onItemOpened}
                      {onBranchSwitched}
                      {onRefetchCollection}
                      {userRoleInWorkspace}
                      {activeTabPath}
                      {activeTabType}
                      collection={col?.toMutableJSON()}
                      {activeTabId}
                      bind:isFirstCollectionExpand
                      {isWebApp}
                      {onCompareCollection}
                      {onSyncCollection}
                      {onUpdateRunningState}
                    />
                  {/if}
                {/each}
              {/if}
            </List>
          {/if}
        {:else}
          {#if searchData.length === 0}
            <EmptyCollection
              bind:userRole
              {onItemCreated}
              {collectionList}
              {userRoleInWorkspace}
              {currentWorkspace}
              handleCreateApiRequest={() => onItemCreated("request", {})}
              onImportCollectionPopup={showImportCollectionPopup}
              isAddCollectionDisabled={isGuestUser}
              onImportCurlPopup={showImportCurlPopup}
              {isGuestUser}
            />
          {/if}

          {#if searchData.length !== 0}
            <p
              class="mx-1 text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-regular mb-0 text-center"
              style="color: var(--text-ds-neutral-400); letter-spacing: 0.5px;"
            >
              It seems we couldn't find the result matching your search query.
            </p>
          {/if}
        {/if}
      </div>
      {#if !collectionListDocument?.some((col) => col?.collectionType === CollectionTypeBaseEnum.MOCK) && !isGuestUser}
        <hr style="margin: 0.5rem; margin-left: 2rem !important;" />
        <EmptyCollection
          bind:userRole
          isMockCollection={true}
          {onItemCreated}
          {collectionList}
          {userRoleInWorkspace}
          {currentWorkspace}
          handleCreateApiRequest={() => onItemCreated("request", {})}
          onImportCollectionPopup={showImportCollectionPopup}
          isAddCollectionDisabled={isGuestUser}
          onImportCurlPopup={showImportCurlPopup}
          {isGuestUser}
        />
      {/if}
    {/if}
  </div>
</div>

<style>
  .collection-container {
    background-color: transparent;
    margin-bottom: 2px;
    border-radius: 2px;
  }
  .collection-container:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .collection-container:hover .add-icon-container {
    visibility: visible;
  }
  .collection-container:focus-visible {
    background-color: var(--bg-ds-surface-500);
    outline: none;
    border-radius: 4px;
    border: 2px solid var(--border-ds-primary-300);
  }
  .collection-container.active {
    background-color: var(--bg-ds-surface-500);
  }
  .collection-container:focus-visible .add-icon-container {
    visibility: visible;
  }
  .add-icon-container {
    visibility: hidden;
  }
  .add-icon-container:hover {
    visibility: visible;
  }
  .collections-inactive {
    visibility: hidden;
  }
  .collections-active {
    visibility: visible;
    background-color: transparent;
  }
  .collections-active:hover {
    visibility: visible;
    background-color: var(--bg-secondary-420);
  }

  .collections-active:active {
    visibility: visible;
    background-color: var(--bg-secondary-420);
  }

  .add-button {
    background-color: var(--dropdown-button);
  }

  .add-button:hover {
    background-color: var(--dropdown-hover);
  }

  .view-active {
    filter: invert(98%) sepia(99%) saturate(24%) hue-rotate(160deg)
      brightness(107%) contrast(100%);
  }

  .view-active:hover {
    filter: invert(100%) sepia(100%) saturate(14%) hue-rotate(212deg)
      brightness(104%) contrast(104%);
  }

  .angleRight {
    background-color: var(--blackColor);
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  .angleRight:hover {
    color: var(--blackColor);
    font-weight: 600;
  }

  .angleRight:active {
    color: var(--white-color);
    /* background-color: var(--button-pressed); */
  }
  .angleButton {
    background-color: var(--background-color);
    cursor: pointer;
  }

  .angleButton:hover {
    background-color: var(--workspace-hover-color);
  }

  .angleButton:active {
    background-color: var(--button-pressed);
  }

  /*
    @keyframes increaseWidth {
      0% {
        width: 0;
      }
   
      100% {
        width: 280px;
      }
    }
    @keyframes decreaseWidth {
      0% {
        width: 280px;
      }
      100% {
        width: 0px;
      }
    } */

  .decrease-width {
    animation: decreaseWidth 0.3s;
    /* width: 0; */
    /* max-width: 280px; */
  }
  .increase-width {
    animation: increaseWidth 0.3s;
    /* max-width: 280px; */
  }
  .spinner {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    /* border: 1px solid var(--border-color) !important; */
  }
  .filter-active {
    background-color: var(--send-button) !important;
  }
  .box-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 13.6px;
    width: 1px;
    /* background-color: var(--bg-ds-surface-100); */
    z-index: 10;
    /* height: 100px; */
  }
</style>
