<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import collectionAsset from "$lib/assets/collection.svg";
  import workspaceAsset from "$lib/assets/workspace.svg";
  import folderAsset from "$lib/assets/folder.svg";
  import leftArrowAsset from "$lib/assets/angleLeft.svg";
  import { searchTreeDocument } from "$lib/components/collections/req-res-section/sub-components/save-request/SaveRequest";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import type { Observable } from "rxjs";
  import type { CollectionDocument } from "$lib/database/app.database";
  import tickIcon from "$lib/assets/tick-grey.svg";
  import crossIcon from "$lib/assets/cross-grey.svg";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import QuestionIcon from "$lib/assets/question.svelte";
  import Button from "$lib/components/buttons/Button.svelte";
  import FileType from "$lib/components/file-types/FileType.svelte";
  import ComboText from "$lib/components/text/ComboText.svelte";
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import {
    bestPractice,
    dos,
    donts,
  } from "$lib/utils/constants/request.constant";

  export let onClick;
  export let onFinish = (id: string) => {};
  export let type: "SAVE_DESCRIPTION" | "SAVE_API" = "SAVE_API";
  export let onSaveAsRequest;
  export let collections: CollectionDocument[];
  export let readWorkspace;
  export let onCreateFolder;
  export let onCreateCollection;
  export let requestMethod;
  export let requestUrl;
  export let requestName;
  export let requestDescription;
  export let requestPath;

  interface Path {
    name: string;
    id: string;
    type: string;
  }

  let workspaceMeta: {
    id: string;
    name: string;
  } = {
    id: "",
    name: "",
  };

  const saveType = {
    SAVE_DESCRIPTION: "SAVE_DESCRIPTION",
  };

  let componentData = {
    path: requestPath,
    name: requestName,
    description: requestDescription,
    property: {
      request: {
        method: requestMethod,
        url: requestUrl,
      },
    },
  };

  const constant = {
    newFolder: "New Folder",
    newCollection: "New Collection",
  };

  let collection: any[] = [];
  let directory: any[] = [];
  let path: Path[] = [];

  let tabName: string;
  let description: string;
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

  const handleDropdownClick = (event: MouseEvent) => {
    const dropdownElement = document.getElementById(`3456-dropdown900`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      instructionEnabled = false;
    }
  };

  onMount(async () => {
    window.addEventListener("click", handleDropdownClick);
    // Setting save request name and description on load
    if (!componentData.path.workspaceId || !componentData.path.collectionId) {
      tabName = componentData.name;
      description = componentData.description;
    } else {
      tabName = componentData.name + " Copy";
      description = componentData.description + " Copy";
    }
  });

  const getFilteredCollection = async (value: CollectionDocument[]) => {
    const _workspace = await readWorkspace(componentData?.path?.workspaceId);
    workspaceMeta.id = _workspace._id;
    workspaceMeta.name = _workspace.name;
    collection = value.filter((collectionDocument: CollectionDocument) => {
      return collectionDocument.workspaceId === workspaceMeta.id;
    });
    directory = JSON.parse(JSON.stringify(collection));
    if (latestRoute.id) navigateToDirectory(latestRoute);
  };

  $: {
    if (collections) {
      getFilteredCollection(collections);
    }
  }

  const navigateToWorkspace = () => {
    directory = JSON.parse(JSON.stringify(collection));
    path = [];
  };

  const navigateToDirectory = (elem: { _id?: string; id?: string }) => {
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

  const handleCreateFolder = async (folderName: string): Promise<void> => {
    createDirectoryLoader = true;
    const res = await onCreateFolder(workspaceMeta, path[0].id, folderName);
    if (res.status === "success") {
      latestRoute = res.data.latestRoute;
      res.data.addRequestOrFolderInCollection(
        res.data.collectionId,
        res.data.data,
      );
      createFolderName = constant.newFolder;
      notifications.success("New Folder Created");
    } else {
      notifications.error(res.message);
    }
    createDirectoryLoader = false;
  };

  const handleCreateCollection = async (collectionName: string) => {
    createDirectoryLoader = true;
    const res = await onCreateCollection(workspaceMeta, collectionName);
    if (res.status === "success") {
      latestRoute = res.data.latestRoute;
      res.data.addCollection(res.data.storage);
      createCollectionName = constant.newCollection;
      notifications.success("New Collection Created");
    } else {
      notifications.error(res.message);
    }
    createDirectoryLoader = false;
  };

  onDestroy(() => {
    // collectionListUnsubscribe.unsubscribe();
    window.removeEventListener("click", handleDropdownClick);
  });
</script>

<div class="url d-flex align-items-center pb-3">
  <p class="ellipsis mb-0">
    {#if path.length > 0}
      <span
        class="cursor-pointer"
        style="height:24px; width:24px;"
        on:click={navigateToLastRoute}><img src={leftArrowAsset} alt="" /></span
      >
    {/if}
    {#if workspaceMeta}
      <span
        on:click={navigateToWorkspace}
        class="sparrow-fs-12 {path.length === 0
          ? 'text-whiteColor'
          : ''} cursor-pointer px-1"
      >
        <img
          style="height:10.67px; width: 10.67px;"
          src={workspaceAsset}
          alt=""
        />
        {workspaceMeta.name}</span
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
            : ''} cursor-pointer px-1 sparrow-fs-12"
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
          <small class="text-whiteColor"> {path[path.length - 1].name}</small>
        </p>
        <small class="save-text-clr sparrow-fs-12"
          >Save your request in this collection or any of its folders.</small
        >
      {:else if path.length > 0 && path[path.length - 1].type === ItemType.FOLDER}
        <p class="mb-0 ellipsis">
          <small class="save-text-clr">Folder: </small>
          <small class="text-whiteColor"> {path[path.length - 1].name}</small>
        </p>
      {:else}
        <p class="mb-0 ellipsis">
          <small class="save-text-clr">Workspace: </small>
          {#if workspaceMeta}
            <small class="text-whiteColor">
              {workspaceMeta.name}
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
                    handleCreateFolder(createFolderName);
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
            {#if col.source === "USER"}
              <div
                on:click={() => {
                  navigateToDirectory(col);
                }}
              >
                <FileType name={col.name} type={ItemType.FOLDER} />
              </div>
            {/if}
          {:else if col.type === ItemType.REQUEST}
            <FileType
              name={col.name}
              method={col.request.method}
              type={ItemType.REQUEST}
            />
          {:else}
            <div
              on:click={() => {
                navigateToDirectory(col);
              }}
            >
              <FileType name={col.name} type={ItemType.COLLECTION} />
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
                      handleCreateFolder(createFolderName);
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
            <p class="save-text-clr text-center">This Collection is empty</p>
          {:else if path.length === 0}
            <div>
              <p class="w-100 save-text-clr text-center sparrow-fs-12">
                {bestPractice}
              </p>
              <div class="w-100 d-flex justify-content-center">
                <Button
                  title={"+ Collection"}
                  buttonClassProp={"fs-6"}
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
  <div class="col-6 ps-5">
    <!-- Right panel  -->
    <div class="d-flex justify-content-between" on:click={handleDropdownClick}>
      <p class="save-text-clr mb-1 sparrow-fs-12">
        Request Name <span class="text-dangerColor">*</span>
      </p>
      <span
        id="3456-dropdown900"
        class="instruction-btn {instructionEnabled
          ? 'bg-sparrowBottomBorder'
          : ''} rounded d-flex align-items-center justify-content-center position-relative"
      >
        <span
          on:click={() => {
            instructionEnabled = !instructionEnabled;
          }}
        >
          <QuestionIcon
            color={instructionEnabled
              ? "var(--blackColor)"
              : "var(--sparrow-text-color)"}
          />
        </span>
        {#if instructionEnabled}
          <div class="bg-blackColor api-name-usage p-3">
            <div class="d-flex justify-content-between">
              <p class="text-whiteColor">Best Practices</p>
              <img
                src={crossIcon}
                on:click={() => {
                  instructionEnabled = !instructionEnabled;
                }}
                class="mb-4 cursor-pointer"
                alt=""
              />
            </div>
            <p class="save-as-instructions">
              {bestPractice}
            </p>
            <div class="d-flex">
              <div class="w-50">
                <p class="save-as-instructions">Do's:</p>
                <ol class="save-as-instructions">
                  {#each dos as para}
                    <li>{para}</li>
                  {/each}
                </ol>
              </div>
              <div class="w-50">
                <p class="save-as-instructions">Don'ts:</p>
                <ol class="save-as-instructions">
                  {#each donts as para}
                    <li>{para}</li>
                  {/each}
                </ol>
              </div>
            </div>
          </div>
        {/if}
      </span>
    </div>
    <div class="pb-2 pt-1">
      <input
        type="text"
        style="width: 100%; {tabName?.length === 0
          ? `outline: 1px solid #FE8C98`
          : ``}"
        placeholder="Enter request name."
        class="p-1 bg-black outline-0 rounded border-0 sparrow-fs-12"
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
      <ComboText
        value={componentData?.property.request.method}
        comboContainerClassProp={"d-flex flex-start pb-2"}
        singleTextClassProp={"rounded d-flex align-items-center py-2 px-3 justify-content-center"}
        valueClassProp={`text-${getMethodStyle(
          componentData?.property.request.method,
        )}`}
      />
      <p class="api-url">{componentData?.property.request.url}</p>
    </div>
    <p class="save-text-clr mb-1 sparrow-fs-12">Description</p>
    <div class="pb-1">
      <textarea
        style="width: 100%; resize:none;"
        class="p-1 bg-black rounded border-0 sparrow-fs-12"
        rows="5"
        maxlength="1024"
        placeholder="Give a description to help people know about this request."
        bind:value={description}
      />
    </div>
    <p class="save-text-clr mb-1 sparrow-fs-12">Saving to</p>
    {#if path.length === 0}
      <p class="save-text-clr text-dangerColor sparrow-fs-12">
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
          {#if workspaceMeta}
            <span class="px-1 sparrow-fs-12">
              <img
                style="height:10.67px; width: 10.67px;"
                src={workspaceAsset}
                alt=""
              />
              {workspaceMeta.name}</span
            >
          {/if}
          {#if path.length > 0}
            {#each path as elem}
              <span>/</span>
              <span class="px-1 sparrow-fs-12">
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
      <Button
        onClick={() => {
          createCollectionNameVisibility = true;
        }}
        title={"+ Collection"}
        buttonClassProp={"btn mb-2"}
        buttonStyleProp={"color: var(--send-button); font-size: var(--base-text); border: 1px solid var(--send-button);"}
      />
    {:else if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
      <Button
        onClick={() => {
          createFolderNameVisibility = true;
        }}
        title={"+ Folder"}
        buttonClassProp={"btn mb-2"}
        buttonStyleProp={"color: var(--send-button); font-size: var(--base-text); border: 1px solid var(--send-button);"}
      />
    {/if}
  </div>
  <div class="d-flex">
    <span class="mx-1">
      <Button
        title={"Cancel"}
        textClassProp={"fs-6 px-2"}
        type={"dark"}
        onClick={() => {
          onClick(false);
        }}
      />
    </span>
    <span class="mx-1">
      <Button
        disable={path.length > 0 ? (tabName.length > 0 ? false : true) : true}
        title={"Save"}
        textClassProp={"fs-6"}
        type={"primary"}
        loader={isLoading}
        onClick={async () => {
          isLoading = true;
          const res = await onSaveAsRequest(
            workspaceMeta,
            path,
            tabName,
            description,
            type,
          );
          if (res.status === "success") {
            onFinish(res.data.id);
            onClick(false);
            if (type !== saveType.SAVE_DESCRIPTION) {
              notifications.success("API request saved");
            } else {
              notifications.success("API documentation saved");
            }
          } else {
            notifications.error(res.message);
          }
          isLoading = false;
        }}
        loaderSize={18}
      />
    </span>
  </div>
</div>

<style>
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
  input:focus,
  textarea:focus {
    outline: none;
    padding: 6px 12px;
  }
  .tabname-error-text {
    font-size: 12px;
  }

  .unclickable {
    pointer-events: none;
  }
  .icon-btn {
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
    top: 29px;
    right: 0;
    width: 2000%;
    border-radius: 8px;
  }
  .save-as-instructions {
    font-size: 12px;
    color: #cccccc;
  }
  ol.save-as-instructions {
    padding-left: 15px;
  }
  .instruction-btn {
    width: 24px;
    height: 24px;
  }
</style>
