<script lang="ts">
  export let visibility: boolean = true;
  import Collection from "$lib/components/file-types/collection/Collection.svelte";
  import Folder from "$lib/components/file-types/folder/Folder.svelte";
  import Request from "$lib/components/file-types/request/Request.svelte";
  import { collectionList, useCollectionTree } from "$lib/store/collection";
  import { onDestroy } from "svelte";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import collectionAsset from "$lib/assets/collection.svg";
  import workspaceAsset from "$lib/assets/workspace.svg";
  import folderAsset from "$lib/assets/folder.svg";
  import leftArrowAsset from "$lib/assets/angleLeft.svg";
  import crossAsset from "$lib/assets/close.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import CoverButton from "$lib/components/buttons/CoverButton.svelte";
  import {
    insertCollection,
    insertCollectionDirectory,
    insertCollectionRequest,
  } from "$lib/services/collection";
  import { searchTreeDocument } from "$lib/components/collections/req-res-section/sub-components/save-request/SaveRequest";
  import type {
    CreateCollectionPostBody,
    CreateDirectoryPostBody,
  } from "$lib/utils/dto";
  import {
    currentTab,
    handleTabAddons,
    handleTabUpdate,
    tabs,
    updateCurrentTab,
  } from "$lib/store/request-response-section";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  export let onClick;

  interface Path {
    name: string;
    id: string;
    type: string;
  }
  interface Workspace {
    name: string;
    id: string;
  }
  const { insertNode, insertHead } = useCollectionTree();

  let collection: any[] = [];
  let directory: any[] = [];
  let path: Path[] = [];
  let workspace: Workspace | null = null;

  let currentTabId = null;
  let tabList = [];
  let tabName = "";
  let tabId: string = "";
  let tabMethod: string = "";
  let tabUrl: string = "";
  let componentData;

  const collectionListUnsubscribe = collectionList.subscribe((value) => {
    collection = value;
    directory = JSON.parse(JSON.stringify(collection));
  });

  const currentWorkspaceUnsubscribe = currentWorkspace.subscribe((value) => {
    if (value.id !== "") {
      workspace = value;
    }
  });

  const navigateToWorkspace = () => {
    directory = JSON.parse(JSON.stringify(collection));
    path = [];
  };

  const navigateToDirectory = (elem) => {
    let response = searchTreeDocument(
      collection,
      elem._id ? elem._id : elem.id,
    );
    directory = response.items;
    path = response.path;
  };

  const navigateToLastRoute = () => {
    if (path.length > 0) {
      path.pop();
      path = path;
      if (path.length === 0) {
        navigateToWorkspace();
      } else {
        navigateToDirectory(path[path.length - 1]);
      }
    }
  };

  const handleSaveRequest = async () => {
    const dummyId = new Date() + "uid";
    if (path.length > 0) {
      const expectedRequest = {
        method: componentData.request.method,
        url: componentData.request.url,
        body: componentData.request.body,
        headers: componentData.request.headers,
        queryParams: componentData.request.queryParams,
      };
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        // create new request
        const res = await insertCollectionRequest({
          collectionId: path[path.length - 1].id,
          workspaceId: workspace.id,
          items: {
            name: tabName,
            type: ItemType.REQUEST,
            request: expectedRequest,
          },
        });
        if (res.isSuccessful) {
          insertNode(
            JSON.parse(JSON.stringify(collection)),
            path[path.length - 1].id,
            ItemType.REQUEST,
            tabName,
            dummyId, // MOCKED DATA [UPDATION REQUIRED HERE]
            expectedRequest,
          );
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: workspace.id,
          };
          if (!componentData.path) {
            // update tab data
            handleTabUpdate(
              { name: tabName, id: dummyId, save: true, path: expectedPath },
              currentTabId,
            ); // MOCKED DATA [UPDATION REQUIRED HERE]
            updateCurrentTab({ id: dummyId }); // MOCKED DATA [UPDATION REQUIRED HERE]
          } else {
            //push new tab
            let newTab: NewTab = {
              id: dummyId,
              name: tabName,
              type: ItemType.REQUEST,
              request: expectedRequest,
              path: expectedPath,
              save: true,
              requestInProgress: false,
            };
            handleTabAddons(newTab);
          }
          onClick(false);
          navigateToWorkspace();
        }
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        const res = await insertCollectionRequest({
          collectionId: path[0].id,
          workspaceId: workspace.id,
          folderId: path[path.length - 1].id,
          items: {
            name: path[path.length - 1].name,
            type: ItemType.FOLDER,
            items: {
              name: tabName,
              type: ItemType.REQUEST,
              request: expectedRequest,
            },
          },
        });
        if (res.isSuccessful) {
          insertNode(
            JSON.parse(JSON.stringify(collection)),
            path[path.length - 1].id,
            ItemType.REQUEST,
            tabName,
            dummyId, // MOCKED DATA [UPDATION REQUIRED HERE]
            expectedRequest,
          );

          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: workspace.id,
          };
          if (!componentData.path) {
            // update tab data
            handleTabUpdate(
              { name: tabName, id: dummyId, save: true, path: expectedPath },
              currentTabId,
            ); // MOCKED DATA [UPDATION REQUIRED HERE]
            updateCurrentTab({ id: dummyId }); // MOCKED DATA [UPDATION REQUIRED HERE]
          } else {
            //push new tab
            let newTab: NewTab = {
              id: dummyId,
              name: tabName,
              type: ItemType.REQUEST,
              request: expectedRequest,
              path: expectedPath,
              save: true,
              requestInProgress: false,
            };
            handleTabAddons(newTab);
          }
          onClick(false);
          navigateToWorkspace();
        }
      }
    }
  };

  const handleFolderClick = async (): Promise<void> => {
    let directory: CreateDirectoryPostBody = {
      name: "New folder",
      description: "",
    };
    const res = await insertCollectionDirectory(
      workspace.id,
      path[0].id,
      directory,
    );
    if (res.isSuccessful) {
      insertNode(
        JSON.parse(JSON.stringify(collection)),
        path[0].id,
        res.data.data.type,
        res.data.data.name,
        res.data.data.id,
      );
      navigateToDirectory({ id: res.data.data.id });
    }
  };

  const handleCreateCollection = async () => {
    const newCollection: CreateCollectionPostBody = {
      name: "New collection",
      workspaceId: workspace.id,
    };
    const res = await insertCollection(newCollection);
    if (res.isSuccessful) {
      insertHead(
        JSON.parse(JSON.stringify(collection)),
        newCollection.name,
        res.data.data.insertedId,
      );
      navigateToDirectory({ id: res.data.data.insertedId });
    }
  };

  const fetchComponentData = (id, list) => {
    list.forEach((elem:NewTab) => {
      if (elem.id === id && elem.type!==ItemType.WORKSPACE) {
        tabName = elem.name;
        tabId = elem.id;
        tabMethod = elem.request.method;
        tabUrl = elem.request.url;
        componentData = { ...elem };
      }
    });
  };

  const tabsUnsubscribe = tabs.subscribe((value) => {
    tabList = value;
    if (currentTabId && tabList) {
      fetchComponentData(currentTabId, tabList);
    }
  });

  const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      currentTabId = value.id;
      if (currentTabId && tabList) {
        fetchComponentData(currentTabId, tabList);
      }
    }
  });

  onDestroy(() => {
    collectionListUnsubscribe();
    currentWorkspaceUnsubscribe();
    tabsUnsubscribe();
    currentTabUnsubscribe();
  });
</script>

<div
  class="save-request-backdrop {visibility ? 'd-block' : 'd-none'}"
  on:click={() => {
    onClick(false);
  }}
/>
<div class="save-request {visibility ? 'd-block' : 'd-none'}">
  <div class="contain">
    <div class="d-flex justify-content-between">
      <div class="pb-2">
        <h4>Save Request</h4>
      </div>
      <button
        class="btn"
        on:click={() => {
          onClick(false);
        }}><img src={crossAsset} alt="" /></button
      >
    </div>
    <div class="url d-flex align-items-center pb-3" style="height:20px;">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      {#if path.length > 0}
        <span
          class="d-flex align-items-center justify-content-center cursor-pointer"
          style="height:24px; width:24px;"
          on:click={navigateToLastRoute}
          ><img src={leftArrowAsset} alt="" /></span
        >
      {/if}
      {#if workspace}
        <span
          on:click={navigateToWorkspace}
          class="cursor-pointer px-1"
          style="font-size: 12px;"
        >
          <img
            style="height:10.67px; width: 10.67px;"
            src={workspaceAsset}
            alt=""
          />
          {workspace.name}</span
        >
      {/if}
      {#if path.length > 0}
        {#each path as elem}
          <span>/</span>
          <span
            on:click={() => {
              navigateToDirectory(elem);
            }}
            class="cursor-pointer px-1"
            style="font-size: 12px;"
          >
            {#if elem.type === ItemType.COLLECTION}
              <img
                src={collectionAsset}
                style="height:10.67px; width: 10.67px;"
                alt=""
              />
            {:else if elem.type === ItemType.FOLDER}
              <img
                src={folderAsset}
                style="height:10.67px; width: 10.67px;"
                alt=""
              />
            {/if}
            {elem.name}</span
          >
        {/each}
      {/if}
    </div>
    <div class="row">
      <div class="col-6" style="border-right: 1px solid var(--border-color);">
        <div style="height: 460px; overflow:auto;">
          {#if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
            <p class="mb-0">
              <small class="save-text-clr">Collection: </small>
              <small> {path[path.length - 1].name}</small>
            </p>
            <small class="save-text-clr" style="font-size: 12px;"
              >Save your request in this collection or any of its folders.</small
            >
          {:else if path.length > 0 && path[path.length - 1].type === ItemType.FOLDER}
            <p class="mb-0">
              <small class="save-text-clr">Folder: </small>
              <small> {path[path.length - 1].name}</small>
            </p>
          {:else}
            <p class="mb-0">
              <small class="save-text-clr">Workspace: </small>
              {#if workspace}
                <small>
                  {workspace.name}
                </small>
              {/if}
            </p>

            <small class="save-text-clr" style="font-size: 12px;"
              >Save your request inside a collection or a folder.</small
            >
          {/if}
          <p />
          {#if directory.length > 0}
            {#each directory as col}
              {#if col.type === ItemType.FOLDER}
                <div
                  on:click={() => {
                    navigateToDirectory(col);
                  }}
                >
                  <Folder name={col.name} />
                </div>
              {:else if col.type === ItemType.REQUEST}
                <Request name={col.name} method={col.request.method} />
              {:else}
                <div
                  on:click={() => {
                    navigateToDirectory(col);
                  }}
                >
                  <Collection name={col.name} />
                </div>
              {/if}
            {/each}
          {:else}
            <div
              class="d-flex align-items-center justify-content-center"
              style="height: 300px;"
            >
              {#if path.length > 0 && path[path.length - 1].type === ItemType.FOLDER}
                <p class="save-text-clr text-center">This Folder is empty</p>
              {:else if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
                <p class="save-text-clr text-center">
                  This Collection is empty
                </p>
              {:else if path.length === 0}
                <p class="save-text-clr text-center">This Workspace is empty</p>
              {/if}
            </div>
          {/if}
        </div>
      </div>
      <div class="col-6">
        <!-- <div>Right panel</div> -->
        <p class="save-text-clr mb-1" style="font-size:12px">Request Name</p>
        <div class="pb-1">
          <input
            type="text"
            style="width: 100%; font-size: 12px;"
            placeholder="Request Name"
            class="p-1 bg-black outline-0 rounded border-0"
            bind:value={tabName}
          />
        </div>
        <p class="save-text-clr mb-1" style="font-size:12px">Description</p>
        <div class="pb-1">
          <textarea
            style="width: 100%; font-size: 12px;"
            class="p-1 bg-black rounded border-0"
            rows="3"
            placeholder="Give a description to help people know about this request."
          />
        </div>
        <p class="save-text-clr mb-1" style="font-size:12px">Saving to</p>
        {#if path.length === 0}
          <p style="font-size: 12px;" class="save-text-clr">
            Select a Collection or Folder.
          </p>
        {:else}
          <div class="url d-flex align-items-center pb-3">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            {#if workspace}
              <span class="px-1" style="font-size: 12px;">
                <img
                  style="height:10.67px; width: 10.67px;"
                  src={workspaceAsset}
                  alt=""
                />
                {workspace.name}</span
              >
            {/if}
            {#if path.length > 0}
              {#each path as elem}
                <span>/</span>
                <span class="px-1" style="font-size: 12px;">
                  {#if elem.type === ItemType.COLLECTION}
                    <img
                      src={collectionAsset}
                      style="height:10.67px; width: 10.67px;"
                      alt=""
                    />
                  {:else if elem.type === ItemType.FOLDER}
                    <img
                      src={folderAsset}
                      style="height:10.67px; width: 10.67px;"
                      alt=""
                    />
                  {/if}
                  {elem.name}</span
                >
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    </div>
    <div class="controllers mt-3 d-flex justify-content-between">
      <div>
        {#if path.length === 0}
          <IconButton
            text={"+ Collection"}
            onClick={() => {
              handleCreateCollection();
            }}
          />
        {:else if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
          <IconButton
            text={"+ Folder"}
            onClick={() => {
              handleFolderClick();
            }}
          />
        {/if}
      </div>
      <div>
        <span class="mx-2">
          <CoverButton
            text={"Cancel"}
            size={16}
            type={"dark"}
            onClick={() => {
              onClick(false);
            }}
          />
        </span>
        <CoverButton
          disable={path.length === 0 ? true : false}
          text={"Save"}
          size={16}
          type={"primary"}
          onClick={() => {
            handleSaveRequest();
          }}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .save-request-backdrop {
    position: fixed;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 99999;
  }
  .save-request {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    padding: 24px;
    background-color: var(--background-color);
    width: 960px;
    height: 640px;
    z-index: 999999;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .save-text-clr {
    color: var(--request-arc);
  }
</style>
