<script lang="ts">
  import Collection from "$lib/components/file-types/collection/Collection.svelte";
  import Folder from "$lib/components/file-types/folder/Folder.svelte";
  import Request from "$lib/components/file-types/request/Request.svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { onDestroy, onMount } from "svelte";
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
  import tickIcon from "$lib/assets/tick-grey.svg";
  import crossIcon from "$lib/assets/cross-grey.svg";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import questionIcon from "$lib/assets/question.svg";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";

  export let collectionsMethods: CollectionsMethods;
  export let onClick;
  export let componentData: NewTab;
  export let onFinish = (_id) => {};
  export let type: "SAVE_DESCRIPTION" | "SAVE_API" = "SAVE_API";

  interface Path {
    name: string;
    id: string;
    type: string;
  }
  interface Workspace {
    name: string;
    id: string;
  }

  const constant = {
    newFolder: "New Folder",
    newCollection: "New Collection",
  };

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

  const saveType = {
    SAVE_DESCRIPTION: "SAVE_DESCRIPTION",
  };
  let tabName: string;
  let description: string;
  if (!componentData.path.workspaceId && !componentData.path.collectionId) {
    tabName = componentData.name;
    description = componentData.description;
  } else {
    tabName = componentData.name + " Copy";
    description = componentData.description + " Copy";
  }
  let latestRoute: {
    id: string;
  } = {
    id: "",
  };

  let isLoading: boolean = false;
  let createCollectionName: string = constant.newCollection;
  let createCollectionNameVisibility: boolean = false;
  let createFolderName: string = constant.newFolder;
  let createFolderNameVisibility: boolean = false;
  let createDirectoryLoader: boolean = false;

  let instructionEnabled: boolean = false;

  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();

  const collectionListUnsubscribe = collectionsMethods
    .getCollectionList()
    .subscribe((value) => {
      if (value) {
        collection = value;
        directory = JSON.parse(JSON.stringify(collection));
        if (latestRoute.id) navigateToDirectory(latestRoute);
      }
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
      let existingRequest;
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        existingRequest =
          await collectionsMethods.readRequestOrFolderInCollection(
            path[path.length - 1].id,
            _id,
          );
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        existingRequest = await collectionsMethods.readRequestInFolder(
          path[0].id,
          path[path.length - 1].id,
          _id,
        );
      }

      const randomRequest: NewTab = generateSampleRequest(
        "id",
        new Date().toString(),
      );

      const request = !existingRequest
        ? randomRequest.property.request
        : existingRequest.request;
      const expectedRequest = {
        method:
          type === saveType.SAVE_DESCRIPTION
            ? request.method
            : componentData.property.request.method,
        url:
          type === saveType.SAVE_DESCRIPTION
            ? request.url
            : componentData.property.request.url,
        body:
          type === saveType.SAVE_DESCRIPTION
            ? request.body
            : componentData.property.request.body,
        headers:
          type === saveType.SAVE_DESCRIPTION
            ? request.headers
            : componentData.property.request.headers,
        queryParams:
          type === saveType.SAVE_DESCRIPTION
            ? request.queryParams
            : componentData.property.request.queryParams,
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
          if (type !== saveType.SAVE_DESCRIPTION) {
            notifications.success("API request saved");
          }
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
            collectionsMethods.updateTab(
              res.data.data.description,
              "description",
              _id,
            );
            collectionsMethods.updateTab(res.data.data.id, "id", _id);
            if (type === saveType.SAVE_DESCRIPTION) {
              collectionsMethods.setRequestSave(
                true,
                "description",
                res.data.data.id,
              );
            } else {
              collectionsMethods.setRequestSave(true, "api", res.data.data.id);
              collectionsMethods.setRequestSave(
                true,
                "description",
                res.data.data.id,
              );
            }
          } else {
            let sampleRequest = generateSampleRequest(
              res.data.data.id,
              new Date().toString(),
            );
            sampleRequest.name = res.data.data.name;
            sampleRequest.description = res.data.data.description;
            sampleRequest.path = expectedPath;
            sampleRequest.property.request.save.api = true;
            sampleRequest.property.request.save.description = true;
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
          if (type !== saveType.SAVE_DESCRIPTION) {
            notifications.success("API request saved");
          }
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
            collectionsMethods.updateTab(
              res.data.data.description,
              "description",
              _id,
            );
            collectionsMethods.updateTab(res.data.data.id, "id", _id);
            if (type === saveType.SAVE_DESCRIPTION) {
              collectionsMethods.setRequestSave(
                true,
                "description",
                res.data.data.id,
              );
            } else {
              collectionsMethods.setRequestSave(true, "api", res.data.data.id);
              collectionsMethods.setRequestSave(
                true,
                "description",
                res.data.data.id,
              );
            }
          } else {
            let sampleRequest = generateSampleRequest(
              res.data.data.id,
              new Date().toString(),
            );
            sampleRequest.name = res.data.data.name;
            sampleRequest.description = res.data.data.description;
            sampleRequest.path = expectedPath;
            sampleRequest.property.request.save.api = true;
            sampleRequest.property.request.save.description = true;
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
      MixpanelEvent(Events.SAVE_API_REQUEST);
    }
  };

  const handleFolderClick = async (folderName): Promise<void> => {
    createDirectoryLoader = true;
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
      createDirectoryLoader = false;
      createFolderName = constant.newFolder;
      latestRoute = {
        id: res.data.data.id,
      };
      collectionsMethods.addRequestOrFolderInCollection(
        path[0].id,
        res.data.data,
      );
    } else {
      createDirectoryLoader = false;
    }
  };

  const handleCreateCollection = async (collectionName) => {
    createDirectoryLoader = true;
    const newCollection: CreateCollectionPostBody = {
      name: collectionName,
      workspaceId: workspace.id,
    };
    const res = await insertCollection(newCollection);
    if (res.isSuccessful) {
      createDirectoryLoader = false;
      createCollectionName = constant.newCollection;
      latestRoute = {
        id: res.data.data._id,
      };
      let storage = res.data.data;
      let _id = res.data.data._id;
      delete storage._id;
      storage.id = _id;
      collectionsMethods.addCollection(storage);
      notifications.success("New Collection Created");
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: res.data.data.name,
        collectionId: res.data.data._id,
      });
    } else {
      createDirectoryLoader = false;
    }
  };

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(`3456-dropdown900`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      instructionEnabled = false;
    }
  }

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
  onDestroy(() => {
    collectionListUnsubscribe.unsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
    window.removeEventListener("click", handleDropdownClick);
  });
</script>

<div
  class="save-request-backdrop d-block"
  on:click={() => {
    onClick(false);
  }}
  transition:fade={{ delay: 0, duration: 100 }}
/>
<div
  class="save-request d-block"
  transition:fly={{ y: 50, delay: 0, duration: 100 }}
  on:introstart
  on:outroend
>
  <div class="contain">
    <div class="d-flex justify-content-between">
      <div class="pb-2">
        <h4>Save Request</h4>
      </div>
      <button
        class="btn pe-0 pt-0 border-0"
        on:click={() => {
          onClick(false);
        }}><img src={crossAsset} alt="" /></button
      >
    </div>
    <div class="url d-flex align-items-center pb-3">
      <p class="ellipsis mb-0">
        {#if path.length > 0}
          <span
            class="cursor-pointer"
            style="height:24px; width:24px;"
            on:click={navigateToLastRoute}
            ><img src={leftArrowAsset} alt="" /></span
          >
        {/if}
        {#if workspace}
          <span
            on:click={navigateToWorkspace}
            class="{path.length === 0
              ? 'text-whiteColor'
              : ''} cursor-pointer px-1"
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
          {#each path as elem, index}
            <span>/</span>
            <span
              on:click={() => {
                navigateToDirectory(elem);
              }}
              class="{path.length - 1 === index
                ? 'text-whiteColor'
                : ''} cursor-pointer px-1"
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
      </p>
    </div>
    <div class="row">
      <div class="col-6" style="border-right: 1px solid var(--border-color);">
        <div style="height: 460px; overflow:auto;">
          <!-- 
            --
            shows current directory 
          --
          -->
          {#if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
            <p class="mb-0 ellipsis">
              <small class="save-text-clr">Collection: </small>
              <small class="text-whiteColor">
                {path[path.length - 1].name}</small
              >
            </p>
            <small class="save-text-clr" style="font-size: 12px;"
              >Save your request in this collection or any of its folders.</small
            >
          {:else if path.length > 0 && path[path.length - 1].type === ItemType.FOLDER}
            <p class="mb-0 ellipsis">
              <small class="save-text-clr">Folder: </small>
              <small class="text-whiteColor">
                {path[path.length - 1].name}</small
              >
            </p>
          {:else}
            <p class="mb-0 ellipsis">
              <small class="save-text-clr">Workspace: </small>
              {#if workspace}
                <small class="text-whiteColor">
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
            <!-- 
            --
            create collection 
          --
          -->
            {#if path.length === 0 && createCollectionNameVisibility}
              <div class="d-flex justify-content-between">
                <div class="w-100 pe-3">
                  <input
                    class="form-input save-input"
                    type="text"
                    placeholder="Name your collection"
                    bind:value={createCollectionName}
                    autofocus
                  />
                </div>
                <div class="d-flex">
                  {#if !createDirectoryLoader}
                    <button
                      class="icon-btn {createCollectionName.length > 0
                        ? ''
                        : 'unclickable'}"
                      on:click={() => {
                        handleCreateCollection(createCollectionName);
                      }}
                    >
                      <img src={tickIcon} alt="" />
                    </button>

                    <button
                      class="icon-btn"
                      on:click={() => {
                        createCollectionNameVisibility = false;
                        createCollectionName = constant.newCollection;
                      }}
                    >
                      <img src={crossIcon} alt="" />
                    </button>
                  {:else}
                    <button
                      class="d-flex justify-content-center border-0"
                      style="width:50px; background-color: transparent;"
                    >
                      <Spinner size={"16px"} />
                    </button>
                  {/if}
                </div>
              </div>
              <!-- 
            --
            create folder 
          --
          -->
            {:else if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION && createFolderNameVisibility}
              <div class="d-flex justify-content-between">
                <div class="w-100 pe-3">
                  <input
                    class="form-input save-input"
                    type="text"
                    placeholder="Name your folder"
                    bind:value={createFolderName}
                    autofocus
                  />
                </div>
                <div class="d-flex">
                  {#if !createDirectoryLoader}
                    <button
                      class="icon-btn {createFolderName.length > 0
                        ? ''
                        : 'unclickable'}"
                      on:click={() => {
                        handleFolderClick(createFolderName);
                      }}
                    >
                      <img src={tickIcon} alt="" />
                    </button>

                    <button
                      class="icon-btn"
                      on:click={() => {
                        createFolderNameVisibility = false;
                        createFolderName = constant.newFolder;
                      }}
                    >
                      <img src={crossIcon} alt="" />
                    </button>
                  {:else}
                    <button
                      class="d-flex justify-content-center border-0"
                      style="width:50px; background-color: transparent;"
                    >
                      <Spinner size={"16px"} />
                    </button>
                  {/if}
                </div>
              </div>
            {/if}
            {#each directory as col}
              <!-- 
            --
            render collection, folder and requests 
          --
          -->
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
            <div>
              {#if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION && createFolderNameVisibility}
                <div class="d-flex justify-content-between">
                  <div class="w-100 pe-3">
                    <input
                      class="form-input save-input"
                      type="text"
                      placeholder="Name your folder"
                      bind:value={createFolderName}
                      autofocus
                    />
                  </div>
                  <div class="d-flex">
                    {#if !createDirectoryLoader}
                      <button
                        class="icon-btn {createFolderName.length > 0
                          ? ''
                          : 'unclickable'}"
                        on:click={() => {
                          handleFolderClick(createFolderName);
                        }}
                      >
                        <img src={tickIcon} alt="" />
                      </button>

                      <button
                        class="icon-btn"
                        on:click={() => {
                          createFolderNameVisibility = false;
                          createFolderName = constant.newFolder;
                        }}
                      >
                        <img src={crossIcon} alt="" />
                      </button>
                    {:else}
                      <button
                        class="d-flex justify-content-center border-0"
                        style="width:50px; background-color: transparent;"
                      >
                        <Spinner size={"16px"} />
                      </button>
                    {/if}
                  </div>
                </div>
              {:else if path.length === 0 && createCollectionNameVisibility}
                <div class="d-flex justify-content-between">
                  <div class="w-100 pe-3">
                    <input
                      class="form-input save-input"
                      type="text"
                      placeholder="Name your collection"
                      bind:value={createCollectionName}
                      autofocus
                    />
                  </div>
                  <div class="d-flex">
                    {#if !createDirectoryLoader}
                      <button
                        class="icon-btn {createCollectionName.length > 0
                          ? ''
                          : 'unclickable'}"
                        on:click={() => {
                          handleCreateCollection(createCollectionName);
                        }}
                      >
                        <img src={tickIcon} alt="" />
                      </button>
                      <button
                        class="icon-btn"
                        on:click={() => {
                          createCollectionNameVisibility = false;
                          createCollectionName = constant.newCollection;
                        }}
                      >
                        <img src={crossIcon} alt="" />
                      </button>
                    {:else}
                      <button
                        class="d-flex justify-content-center border-0"
                        style="width:50px; background-color: transparent;"
                      >
                        <Spinner size={"16px"} />
                      </button>
                    {/if}
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
                <div>
                  <p
                    style="font-size: 12px;"
                    class="w-100 save-text-clr text-center"
                  >
                    You have no collections in this workspace. Create a
                    Collection to easily organize and use your API requests.
                  </p>
                  <div class="w-100 d-flex justify-content-center">
                    <CoverButton
                      text={"+ Collection"}
                      size={14}
                      type={"primary"}
                      onClick={() => {
                        createCollectionNameVisibility = true;
                      }}
                    />
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
      <div class="col-6">
        <!-- Right panel  -->
        <div
          class="d-flex justify-content-between"
          on:click={handleDropdownClick}
        >
          <p class="save-text-clr mb-1" style="font-size:12px">
            Request Name <span class="text-dangerColor">*</span>
          </p>
          <span
            id="3456-dropdown900"
            class="instruction-btn {instructionEnabled
              ? 'bg-sparrowBottomBorder'
              : ''} rounded d-flex align-items-center justify-content-center position-relative"
          >
            <img
              on:click={() => {
                instructionEnabled = !instructionEnabled;
              }}
              src={questionIcon}
              alt="question"
            />
            {#if instructionEnabled}
              <div class="bg-blackColor api-name-usage p-2">
                <p class="text-whiteColor">Best Practices</p>
                <p class="save-as-instructions">
                  When naming your requests, remember that resources are at the
                  core of REST. Use nouns to represent your resources, such as
                  'user accounts' or 'managed devices.' Keep your URIs clear and
                  consistent by using forward slashes to indicate hierarchy,
                  avoid file extensions.
                </p>
                <div class="d-flex">
                  <div class="w-50">
                    <p class="save-as-instructions">Do's:</p>
                    <ul class="save-as-instructions">
                      <li>Use nouns to represent resources</li>
                      <li>Use forward slashes for hierarchy</li>
                      <li>Use hyphens for readability</li>
                      <li>Use lowercase letters in URIs</li>
                      <li>Use HTTP methods for CRUD actions</li>
                    </ul>
                  </div>
                  <div class="w-50">
                    <p class="save-as-instructions">Don'ts:</p>
                    <ul class="save-as-instructions">
                      <li>Don't use file extensions.</li>
                      <li>Don't use underscores in URIs.</li>
                      <li>Don't use verbs in the URIs.</li>
                      <li>Don't put CRUD function names in URIs.</li>
                      <li>Don't use capital letters in URIs.</li>
                    </ul>
                  </div>
                </div>
              </div>
            {/if}
          </span>
        </div>
        <div class="pb-2">
          <input
            type="text"
            style="width: 100%; font-size: 12px; {tabName?.length === 0
              ? `outline: 1px solid #FE8C98`
              : ``}"
            placeholder="Enter request name."
            class="p-1 bg-black outline-0 rounded border-0"
            bind:value={tabName}
            autofocus
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
            style="width: 100%; font-size: 12px; resize:none;"
            class="p-1 bg-black rounded border-0"
            rows="5"
            maxlength="1024"
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
          <!-- 
            --
            current directory path 
          --
          -->
          <div class="url d-flex align-items-center pb-3">
            <p class="ellipsis mb-0">
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
            </p>
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
    z-index: 9;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }
  .save-request {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    padding: 24px;
    background-color: var(--background-color);
    width: 100%;
    max-width: 960px;
    height: 640px;
    z-index: 10;
    border-radius: 8px;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .api-url {
    word-break: break-all;
    font-size: 12px;
    color: #999999;
    font-family: monospace;
    align-self: center;
  }
  .save-request input:focus,
  .save-request textarea:focus {
    outline: none;
    padding: 6px 12px;
  }
  .tabname-error-text {
    font-size: 12px;
  }

  .unclickable {
    pointer-events: none;
  }
  .save-request .icon-btn {
    width: 25px;
    height: 25px;
    background-color: transparent;
    outline: none;
    border: none;
  }
  .save-input {
    width: 100%;
    padding: 0 8px !important;
    font-size: 14px;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid var(--sparrow-bottom-border);
  }
  .save-input:focus {
    background-color: var(--border-color);
  }
  .save-text-clr {
    color: #8a9299;
  }
  .api-name-usage {
    position: absolute;
    top: 25px;
    right: 0;
    width: 521px;
    border-radius: 8px;
  }
  .save-as-instructions {
    font-size: 12px;
    color: #cccccc;
  }
  ul.save-as-instructions {
    padding-left: 15px;
  }
  .instruction-btn {
    width: 24px;
    height: 24px;
  }
</style>
