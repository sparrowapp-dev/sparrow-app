<script lang="ts">
  import Collection from "$lib/components/file-types/collection/Collection.svelte";
  import Folder from "$lib/components/file-types/folder/Folder.svelte";
  import Request from "$lib/components/file-types/request/Request.svelte";
  import { onDestroy } from "svelte";
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
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { notifications } from "$lib/utils/notifications";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Observable } from "rxjs";
  import type { WorkspaceDocument } from "$lib/database/app.database";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import MethodButton from "$lib/components/buttons/MethodButton.svelte";

  export let collectionsMethods: CollectionsMethods;
  export let onClick;
  export let componentData: NewTab;
  export let onFinish = (_id) => {};

  interface Path {
    name: string;
    id: string;
    type: string;
  }
  interface Workspace {
    name: string;
    id: string;
  }

  let collection: any[] = [];
  let directory: any[] = [];
  let path: Path[] = [];
  let workspace: {
    id: string;
    name: string;
  } = {
    id: "",
    name: "",
  };
  let tabName: string;
  let description: string;
  if (!componentData.path.workspaceId && !componentData.path.collectionId) {
    tabName = componentData.name;
  } else {
    tabName = componentData.name + " Copy";
  }
  let latestRoute: {
    id: string;
  } = {
    id: "",
  };

  let isLoading: boolean = false;
  let createCollectionName: string = "";
  let createCollectionNameVisibility: boolean = false;
  let createFolderName: string = "";
  let createFolderNameVisibility: boolean = false;

  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();

  const collectionListUnsubscribe = collectionsMethods
    .getCollectionList()
    .subscribe((value) => {
      collection = value;
      directory = JSON.parse(JSON.stringify(collection));
      if (latestRoute.id) navigateToDirectory(latestRoute);
    });

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      if (value) {
        workspace.id = value.get("_id");
        workspace.name = value.get("name");
      }
    },
  );

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
    createFolderNameVisibility = false;
    createCollectionNameVisibility = false;
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

  const handleSaveAsRequest = async () => {
    const _id = componentData.id;
    isLoading = true;
    if (path.length > 0) {
      const expectedRequest = {
        method: componentData.property.request.method,
        url: componentData.property.request.url,
        body: componentData.property.request.body,
        headers: componentData.property.request.headers,
        queryParams: componentData.property.request.queryParams,
      };
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        // create new request
        const res = await insertCollectionRequest({
          collectionId: path[path.length - 1].id,
          workspaceId: workspace.id,
          items: {
            name: tabName,
            description,
            type: ItemType.REQUEST,
            request: expectedRequest,
          },
        });

        if (res.isSuccessful) {
          notifications.success("API request saved");
          collectionsMethods.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: workspace.id,
          };
          if (
            !componentData.path.workspaceId &&
            !componentData.path.collectionId
          ) {
            collectionsMethods.updateTab(expectedPath, "path", _id);
            collectionsMethods.updateTab(res.data.data.name, "name", _id);
            collectionsMethods.updateTab(res.data.data.id, "id", _id);
            collectionsMethods.updateTab(true, "save", res.data.data.id);
          } else {
            let sampleRequest = generateSampleRequest(
              res.data.data.id,
              new Date().toString(),
            );
            sampleRequest.name = res.data.data.name;
            sampleRequest.path = expectedPath;
            sampleRequest.save = true;
            sampleRequest.property.request.url = res.data.data.request.url;
            sampleRequest.property.request.method =
              res.data.data.request.method;
            sampleRequest.property.request.body = res.data.data.request.body;
            sampleRequest.property.request.queryParams =
              res.data.data.request.queryParams;
            sampleRequest.property.request.headers =
              res.data.data.request.headers;
            collectionsMethods.handleCreateTab(sampleRequest);
          }
          onFinish(res.data.data.id);
          onClick(false);
          navigateToWorkspace();
          isLoading = false;
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
              description,
              type: ItemType.REQUEST,
              request: expectedRequest,
            },
          },
        });

        if (res.isSuccessful) {
          collectionsMethods.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: workspace.id,
          };
          if (
            !componentData.path.workspaceId &&
            !componentData.path.collectionId
          ) {
            collectionsMethods.updateTab(expectedPath, "path", _id);
            collectionsMethods.updateTab(res.data.data.name, "name", _id);
            collectionsMethods.updateTab(res.data.data.id, "id", _id);
            collectionsMethods.updateTab(true, "save", res.data.data.id);
          } else {
            let sampleRequest = generateSampleRequest(
              res.data.data.id,
              new Date().toString(),
            );
            sampleRequest.name = res.data.data.name;
            sampleRequest.path = expectedPath;
            sampleRequest.save = true;
            sampleRequest.property.request.url = res.data.data.request.url;
            sampleRequest.property.request.method =
              res.data.data.request.method;
            sampleRequest.property.request.body = res.data.data.request.body;
            sampleRequest.property.request.queryParams =
              res.data.data.request.queryParams;
            sampleRequest.property.request.headers =
              res.data.data.request.headers;
            collectionsMethods.handleCreateTab(sampleRequest);
          }
          onFinish(res.data.data.id);
          onClick(false);
          navigateToWorkspace();
          isLoading = false;
        }
      }
    }
  };

  const handleFolderClick = async (folderName): Promise<void> => {
    let directory: CreateDirectoryPostBody = {
      name: folderName,
      description: "",
    };
    const res = await insertCollectionDirectory(
      workspace.id,
      path[0].id,
      directory,
    );
    if (res.isSuccessful) {
      createFolderName = "";
      latestRoute = {
        id: res.data.data.id,
      };
      collectionsMethods.addRequestOrFolderInCollection(
        path[0].id,
        res.data.data,
      );
    }
  };

  const handleCreateCollection = async (collectionName) => {
    const newCollection: CreateCollectionPostBody = {
      name: collectionName,
      workspaceId: workspace.id,
    };
    const res = await insertCollection(newCollection);
    if (res.isSuccessful) {
      createCollectionName = "";
      latestRoute = {
        id: res.data.data._id,
      };
      collectionsMethods.addCollection(res.data.data);
    }
  };

  onDestroy(() => {
    collectionListUnsubscribe.unsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<div
  class="save-request-backdrop d-block"
  on:click={() => {
    onClick(false);
  }}
/>
<div class="save-request d-block">
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
            {#if path.length === 0 && createCollectionNameVisibility}
              <div class="d-flex justify-content-between">
                <div>
                  <input
                    type="text"
                    placeholder="Type collection name"
                    bind:value={createCollectionName}
                  />
                </div>
                <div class="d-flex">
                  <CoverButton
                    disable={createCollectionName.length > 0 ? false : true}
                    text={"Create"}
                    size={12}
                    type="dark"
                    onClick={() => {
                      handleCreateCollection(createCollectionName);
                    }}
                  />
                  <CoverButton
                    text={"Cancel"}
                    size={12}
                    type={"dark"}
                    onClick={() => {
                      createCollectionNameVisibility = false;
                      createCollectionName ="";
                    }}
                  />
                </div>
              </div>
            {:else if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION && createFolderNameVisibility}
              <div class="d-flex justify-content-between">
                <div>
                  <input
                    type="text"
                    placeholder="Type folder name"
                    bind:value={createFolderName}
                  />
                </div>
                <div class="d-flex">
                  <CoverButton
                    disable={createFolderName.length > 0 ? false : true}
                    text={"Create"}
                    size={12}
                    type="dark"
                    onClick={() => {
                      handleFolderClick(createFolderName);
                    }}
                  />
                  <CoverButton
                    text={"Cancel"}
                    size={12}
                    type={"dark"}
                    onClick={() => {
                      createFolderNameVisibility = false;
                      createFolderName = "";
                    }}
                  />
                </div>
              </div>
            {/if}
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
            <div >
              {#if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION && createFolderNameVisibility}
              <div class="d-flex justify-content-between">
                <div>
                  <input
                    type="text"
                    placeholder="Type folder name"
                    bind:value={createFolderName}
                  />
                </div>
                <div class="d-flex">
                  <CoverButton
                    disable={createFolderName.length > 0 ? false : true}
                    text={"Create"}
                    size={12}
                    type="dark"
                    onClick={() => {
                      handleFolderClick(createFolderName);
                    }}
                  />
                  <CoverButton
                    text={"Cancel"}
                    size={12}
                    type={"dark"}
                    onClick={() => {
                      createFolderNameVisibility = false;
                      createFolderName = "";
                    }}
                  />
                </div>
              </div>
              {:else if path.length === 0 && createCollectionNameVisibility}
              <div class="d-flex justify-content-between">
                <div>
                  <input
                    type="text"
                    placeholder="Type collection name"
                    bind:value={createCollectionName}
                  />
                </div>
                <div class="d-flex">
                  <CoverButton
                    disable={createCollectionName.length > 0 ? false : true}
                    text={"Create"}
                    size={12}
                    type="dark"
                    onClick={() => {
                      handleCreateCollection(createCollectionName);
                    }}
                  />
                  <CoverButton
                    text={"Cancel"}
                    size={12}
                    type={"dark"}
                    onClick={() => {
                      createCollectionNameVisibility = false;
                      createCollectionName = "";
                    }}
                  />
                </div>
              </div>
              {/if}
            </div>
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
                <p class="save-text-clr text-center">
                  This Workspace is empty

                  <!-- 




                      collection nesds ro be revised




                   -->
                </p>
              {/if}
            </div>
          {/if}
        </div>
      </div>
      <div class="col-6">
        <!-- Right panel  -->
        <p class="save-text-clr mb-1" style="font-size:12px">
          Request Name <span class="text-dangerColor">*</span>
        </p>
        <div class="pb-2">
          <input
            type="text"
            style="width: 100%; font-size: 12px; {tabName?.length === 0
              ? `outline: 1px solid #FE8C98`
              : ``}"
            placeholder="Enter request name."
            class="p-1 bg-black outline-0 rounded border-0"
            bind:value={tabName}
          />
        </div>
        {#if tabName?.length === 0}
          <p class="tabname-error-text text-dangerColor">
            Please add the Request Name to save the request.
          </p>
        {/if}
        <div class="d-flex">
          <MethodButton method={componentData?.property.request.method} />
          <p class="api-url">{componentData?.property.request.url}</p>
        </div>
        <p class="save-text-clr mb-1" style="font-size:12px">Description</p>
        <div class="pb-1">
          <textarea
            style="width: 100%; font-size: 12px;"
            class="p-1 bg-black rounded border-0"
            rows="3"
            placeholder="Give a description to help people know about this request."
            bind:value={description}
          />
        </div>
        <p class="save-text-clr mb-1" style="font-size:12px">Saving to</p>
        {#if path.length === 0}
          <p style="font-size: 12px;" class="save-text-clr text-dangerColor">
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
              createCollectionNameVisibility = true;
            }}
          />
        {:else if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
          <IconButton
            text={"+ Folder"}
            onClick={() => {
              createFolderNameVisibility = true;
            }}
          />
        {/if}
      </div>
      <div class="d-flex">
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
          disable={path.length > 0 ? (tabName.length > 0 ? false : true) : true}
          text={"Save"}
          size={16}
          type={"primary"}
          loader={isLoading}
          onClick={() => {
            handleSaveAsRequest();
          }}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .save-request-backdrop {
    position: fixed;
    top: 0;
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
  .api-url {
    word-break: break-all;
    font-size: 12px;
    color: #999999;
    font-family: monospace;
  }
  .save-request input:focus,
  .save-request textarea:focus {
    outline: none;
    padding: 6px 12px;
  }
  .tabname-error-text {
    font-size: 12px;
  }
</style>
