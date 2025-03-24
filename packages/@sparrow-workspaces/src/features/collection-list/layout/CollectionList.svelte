<script lang="ts">
  import { Collection, EmptyCollection, SearchTree } from "../components";
  import {
    angleDownIcon,
    doubleAngleLeftIcon as doubleangleLeft,
  } from "@sparrow/library/assets";
  import { angleRightV2Icon as angleRight } from "@sparrow/library/assets";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Button, List } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
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
  import { onDestroy } from "svelte";
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

  export let collectionList: Observable<CollectionDocument[]>;
  export let showImportCollectionPopup: () => void;
  export let showImportCurlPopup: () => void;
  export let onItemCreated: (entityType: string, args: any) => void;
  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
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

  export let isExpandCollection: boolean;

  export let toggleExpandCollection;

  export let isWebApp = false;
  export let activeTabType;
  export let isFirstCollectionExpand = false;

  let collectionListDocument: CollectionDocument[];

  let activeWorkspace: WorkspaceDocument;
  let currentWorkspaceId;
  currentWorkspace.subscribe((value) => {
    if (value?._data) {
      currentWorkspaceId = value._data._id;
    }
  });

  let isHovered = false;

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
          (value) => value.workspaceId === activeWorkspace?._id,
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
</script>

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
      class=" collection-container d-flex align-items-center pe-2 border-radius-2"
      style="cursor:pointer; justify-content: space-between; height:32px; margin-bottom:0;"
      on:mouseover={handleMouseOver}
      on:mouseout={handleMouseOut}
      on:click={toggleExpandCollection}
    >
      <div
        class=" d-flex align-items-center"
        style="width: calc(100% - 30px);  padding: 4px 2px; height:32px; "
      >
        <span style=" display: flex; margin-right:4px;">
          <Button
            size="extra-small"
            type="teritiary-regular"
            customWidth="24px"
            startIcon={!isExpandCollection
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
            class="sparrow-fs-13 mb-0"
            style="font-weight:400; font-size:12px; line-height:18px; color:var(--text-ds-neutral-50); "
          >
            Collections
          </p>
        </span>
      </div>

      {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
        <Tooltip
          title={"Add Collection"}
          placement={"bottom-center"}
          distance={13}
          show={isHovered}
          zIndex={701}
        >
          <span style="display:flex;" class="add-icon-container">
            <Button
              size="extra-small"
              customWidth={"24px"}
              type="teritiary-regular"
              startIcon={AddRegular}
              disable={userRole === WorkspaceRole.WORKSPACE_VIEWER}
              onClick={(e) => {
                e.stopPropagation();
                isExpandCollection = true;
                isGuestUser
                  ? onItemCreated("collection", {
                      workspaceId: currentWorkspaceId,
                      collection: collectionList,
                    })
                  : showImportCollectionPopup();
              }}
            />
          </span>
        </Tooltip>
      {/if}
    </div>

    {#if isExpandCollection}
      <div
        class="overflow-auto position-relative d-flex flex-column me-0 pt-1 mb-2"
      >
        {#if collectionListDocument?.length > 0 && searchData.length === 0}
          <div class="box-line"></div>
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
                    bind:userRole
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
                    {searchData}
                    {isWebApp}
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
                  class="mx-1 text-fs-12 mb-0 text-center"
                  style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px;"
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
                <Collection
                  bind:userRole
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
                  {isWebApp}
                  bind:isFirstCollectionExpand
                />
              {/each}
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
              class="mx-1 text-fs-12 mb-0 text-center"
              style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px;"
            >
              It seems we couldn't find the result matching your search query.
            </p>
          {/if}
        {/if}
      </div>
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
    align-items: center;
    overflow: hidden;
  }
  .searchField {
  }
  .filter-btn {
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
    background-color: var(--bg-ds-surface-100);
    z-index: 10;
    /* height: 100px; */
  }
</style>
