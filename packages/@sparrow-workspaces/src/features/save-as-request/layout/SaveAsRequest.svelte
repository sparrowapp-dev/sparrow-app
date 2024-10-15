<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { ItemType } from "@sparrow/common/enums/item-type.enum";
  import { angleLeftIcon as leftArrowAsset } from "@sparrow/library/assets";
  import { searchTreeDocument } from "../utils";
  import { notifications } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
  import type { CollectionDocument } from "@app/database/database";
  import { tickGreyIcon as tickIcon } from "@sparrow/library/assets";
  import { crossGreyIcon as crossIcon } from "@sparrow/library/assets";
  import { Spinner } from "@sparrow/library/ui";
  import { QuestionIcon } from "@sparrow/library/assets";
  import { Button } from "@sparrow/library/ui";
  import { FileType } from "../components";
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";
  import {
    bestPractice,
    dos,
    donts,
  } from "@sparrow/common/constants/request.constant";
  import {
    CollectionIcon,
    FolderIcon2,
    PencilIcon2,
    SocketIcon,
    WorkspaceIcon,
  } from "@sparrow/library/icons";
  import { TabTypeEnum } from "@sparrow/common/types/workspace";
  import { TextEditor } from "@sparrow/library/forms";

  export let onClick;
  export let onFinish = (id: string) => {};
  export let type: "SAVE_DESCRIPTION" | "SAVE_API" = "SAVE_API";
  export let onSave;
  export let collections: CollectionDocument[];
  export let readWorkspace;
  export let onCreateFolder;
  export let onCreateCollection;
  export let requestMethod;
  export let requestUrl;
  export let requestName;
  export let requestDescription;
  export let requestPath;
  export let onRenameCollection;
  export let onRenameFolder;

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
    // description: requestDescription,
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
  // let description: string;

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
      // description = componentData.description;
    } else {
      tabName = componentData.name + " Copy";
      // description = componentData.description + " Copy";
    }
  });

  // console.log(description, "description");

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

  let editCollectionName = "";
  let editFolderName = "";

  const navigateToWorkspace = () => {
    directory = JSON.parse(JSON.stringify(collection));
    path = [];
  };

  const navigateToDirectory = (elem: { _id?: string; id?: string }) => {
    let response = searchTreeDocument(
      collection,
      elem._id ? elem._id : elem.id,
    );
    isCollectionNameEditable = false;
    isFolderNameEditable = false;
    directory = response.items;
    path = response.path;
    editCollectionName = path[0]?.name ?? "";
    editFolderName = path[1]?.name ?? "";
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
      notifications.success("New folder created successfully.");
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
      notifications.success("New Collection created successfully.");
    } else {
      notifications.error(res.message);
    }
    createDirectoryLoader = false;
  };

  onDestroy(() => {
    // collectionListUnsubscribe.unsubscribe();
    window.removeEventListener("click", handleDropdownClick);
  });

  let isSaveTouched = false;
  let isCollectionNameEditable = false;
  let isFolderNameEditable = false;
</script>

<div class="url d-flex align-items-center pt-3">
  <p class="ellipsis mb-3 ps-3">
    {#if path.length > 0}
      <span
        class="cursor-pointer pe-3"
        style="height:24px; width:24px;"
        on:click={navigateToLastRoute}><img src={leftArrowAsset} alt="" /></span
      >
    {/if}
    {#if workspaceMeta}
      <span
        on:click={navigateToWorkspace}
        class="sparrow-fs-12 {path.length === 0
          ? 'text-secondary-100'
          : 'text-secondary-200'} cursor-pointer px-1"
      >
        <WorkspaceIcon
          height={"10px"}
          width={"10px"}
          color={path.length === 0
            ? "var(--text-secondary-100)"
            : "var(--text-secondary-200)"}
        />
        <span style="padding-left: 6px; padding-right:2px;">
          {workspaceMeta.name}
        </span>
      </span>
    {/if}
    {#if path.length > 0}
      {#each path as elem, index}
        <span class="text-secondary-200">/</span>
        <span
          on:click={() => {
            navigateToDirectory(elem);
          }}
          class="{path.length - 1 === index
            ? 'text-secondary-100'
            : 'text-secondary-200'} cursor-pointer px-1 sparrow-fs-12"
        >
          {#if elem.type === ItemType.COLLECTION}
            <CollectionIcon
              height={"10px"}
              width={"10px"}
              color={path.length - 1 === index
                ? "var(--text-secondary-100)"
                : "var(--text-secondary-200)"}
            />
          {:else if elem.type === ItemType.FOLDER}
            <FolderIcon2
              height={"10px"}
              width={"10px"}
              color={path.length - 1 === index
                ? "var(--text-secondary-100)"
                : "var(--text-secondary-200)"}
            />
          {/if}
          <span style="padding-left: 6px; padding-right:2px;">
            {elem.name}
          </span>
        </span>
      {/each}
    {/if}
  </p>
</div>
<div class="row">
  <div class="col-6" style="border-right: 1px solid var(--border-color);">
    <!--
    -- 
    --  left panel
    --
    -->
    <div class="ps-3 row-left-section" style="height: 430px; overflow:auto;">
      <!-- 
              --
              shows current directory 
            --
            -->
      {#if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
        <p class="mb-0 ellipsis">
          <small class="save-text-clr">Collection: </small>
          {#if !isCollectionNameEditable}
            <small
              class="text-whiteColor item-header"
              style="font-weight: 700;"
              on:click={() => {
                isCollectionNameEditable = true;
              }}
            >
              {path[path.length - 1].name}
              <span class="edit-pencil ms-2" style="display: none;">
                <PencilIcon2
                  height={"12px"}
                  width={"12px"}
                  color={"var(--icon-secondary-200)"}
                />
              </span>
            </small>
          {:else}
            <input
              type="text"
              class="edit-input fw-bold"
              style="width: calc(100% - 130px);"
              bind:value={editCollectionName}
              autofocus
            />
            <button
              class="icon-btn"
              on:click={async (e) => {
                if (editCollectionName === "") {
                  isCollectionNameEditable = false;
                } else {
                  const response = await onRenameCollection(
                    workspaceMeta.id,
                    path[path.length - 1].id,
                    editCollectionName,
                  );
                  latestRoute = {
                    id: path[path.length - 1].id,
                  };
                  if (response.isSuccessful) {
                    isCollectionNameEditable = false;
                  }
                }
              }}
            >
              <img src={tickIcon} alt="" /></button
            >
            <button
              class="icon-btn"
              on:click={() => {
                editCollectionName = path[path.length - 1].name;
                isCollectionNameEditable = false;
              }}><img src={crossIcon} alt="" /></button
            >
          {/if}
        </p>
        <small class="save-text-clr sparrow-fs-12"
          >Save your request in this collection or select a folder to save it.</small
        >
      {:else if path.length > 0 && path[path.length - 1].type === ItemType.FOLDER}
        <p class="mb-0 ellipsis">
          <small class="save-text-clr">Folder: </small>
          {#if !isFolderNameEditable}
            <small
              class="text-whiteColor item-header"
              style="font-weight: 700;"
              on:click={() => {
                isFolderNameEditable = true;
              }}
            >
              {path[path.length - 1].name}
              <span class="edit-pencil ms-2" style="display: none;">
                <PencilIcon2
                  height={"12px"}
                  width={"12px"}
                  color={"var(--icon-secondary-200)"}
                />
              </span>
            </small>
          {:else}
            <input
              type="text"
              class="edit-input fw-bold"
              style="width: calc(100% - 110px);"
              bind:value={editFolderName}
              autofocus
            />
            <button
              class="icon-btn"
              on:click={async (e) => {
                if (editFolderName === "") {
                  isFolderNameEditable = false;
                } else {
                  const response = await onRenameFolder(
                    workspaceMeta.id,
                    path[path.length - 2]?.id,
                    path[path.length - 1].id,
                    editFolderName,
                  );
                  latestRoute = {
                    id: path[path.length - 1].id,
                  };
                  if (response.isSuccessful) {
                    isFolderNameEditable = false;
                  }
                }
              }}
            >
              <img src={tickIcon} alt="" /></button
            >
            <button
              class="icon-btn"
              on:click={() => {
                editFolderName = path[path.length - 1].name;
                isFolderNameEditable = false;
              }}><img src={crossIcon} alt="" /></button
            >
          {/if}
        </p>
        <small class="save-text-clr sparrow-fs-12"
          >Save your request in this folder.</small
        >
      {:else}
        <p class="mb-0 ellipsis">
          <small class="save-text-clr">Workspace: </small>
          {#if workspaceMeta}
            <small class="text-whiteColor" style="font-weight: 700;">
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
            <!-- {#if col.source === "USER"} -->
            <div
              class="item ps-2"
              on:click={() => {
                navigateToDirectory(col);
              }}
            >
              <FileType name={col.name} type={ItemType.FOLDER} />
            </div>
            <!-- {/if} -->
          {:else if col.type === ItemType.REQUEST}
            <div class=" ps-2">
              <FileType
                name={col.name}
                method={col.request.method}
                type={ItemType.REQUEST}
              />
            </div>
          {:else if col.type === ItemType.WEB_SOCKET}
            <div class=" ps-2">
              <FileType name={col.name} type={ItemType.WEB_SOCKET} />
            </div>
          {:else}
            <div
              class="item ps-2"
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
            <p class="save-text-clr-empty text-center">This folder is empty</p>
          {:else if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
            <p class="save-text-clr-empty text-center">
              This collection is empty
            </p>
          {:else if path.length === 0}
            <div>
              <p class="save-text-clr-empty text-center text-fs-12">
                You do not have any collections in this workspace. Create a
                collection to easily organize and manage your APIs.
              </p>
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
    </div>
    <div class="pb-2 pt-1 position-relative">
      <input
        type="text"
        style="width: 100%; border: 1px solid var(--border-secondary-400); {tabName?.length ===
        0
          ? `outline: 1px solid #FE8C98`
          : ``}"
        placeholder="Enter request name"
        class="py-2 ps-3 pe-5 bg-tertiary-300 outline-0 border-radius-2 sparrow-fs-12"
        bind:value={tabName}
        autofocus
      />
      <div class="position-absolute" style="top:9px; right: 10px;">
        <span
          id="3456-dropdown900"
          style=""
          class="instruction-btn {instructionEnabled
            ? 'bg-tertiary-650'
            : ''} rounded d-flex align-items-center justify-content-center position-relative"
        >
          <span
            on:click={() => {
              instructionEnabled = !instructionEnabled;
            }}
          >
            <QuestionIcon color={"var(--sparrow-text-color)"} />
          </span>
          {#if instructionEnabled}
            <div
              style="z-index: 10;"
              class="bg-tertiary-300 api-name-usage p-3"
            >
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
                  <p class="save-as-instructions m-0">Do's:</p>
                  <ol class="save-as-instructions">
                    {#each dos as para}
                      <li>{para}</li>
                    {/each}
                  </ol>
                </div>
                <div class="w-50">
                  <p class="save-as-instructions m-0">Don'ts:</p>
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
    </div>
    {#if tabName?.length === 0}
      <p class="tabname-error-text text-dangerColor">
        Please add the request name to save the request.
      </p>
    {/if}
    <div class="d-flex pt-3">
      <!-- <ComboText
        value={componentData?.property.request.method}
        comboContainerClassProp={"d-flex flex-start pb-2"}
        singleTextClassProp={"rounded d-flex align-items-center py-2 px-3 justify-content-center"}
        valueClassProp=
        
      /> -->
      {#if componentData?.property.request.method === TabTypeEnum.WEB_SOCKET}
        <span class={`text-fs-12 me-3 fw-bold `}
          ><SocketIcon
            height={"12px"}
            width={"16px"}
            color={"var(--icon-primary-300)"}
          /></span
        >
      {:else}
        <span
          class={`text-fs-12 me-3 fw-bold text-${getMethodStyle(
            componentData?.property.request.method,
          )}`}>{componentData?.property.request.method}</span
        >
      {/if}
      <p class="api-url">{componentData?.property.request.url}</p>
    </div>
    {#if !(componentData?.property.request.method === TabTypeEnum.WEB_SOCKET)}
      <p class="save-text-clr mb-1 sparrow-fs-12">Description</p>
      <div style="height:170px; overflow:auto !important;">
        <div
          class="pb-1 bg-tertiary-300"
          id="editor1"
          style="width:100%;  margin:0px !important; pointer-events: none !important;"
        >
          <TextEditor
            placeholder={"Add a description to help people know about this request."}
            isReadOnly={true}
            id={"editor1"}
            value={requestDescription}
          />
        </div>
      </div>
    {/if}
    <p class="save-text-clr mb-1 sparrow-fs-12">Saving to</p>
    {#if path.length === 0}
      <p
        class=" {isSaveTouched
          ? 'text-dangerColor'
          : 'save-text-clr'}  sparrow-fs-12"
      >
        Select a collection or folder.
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
              <WorkspaceIcon
                height={"12px"}
                width={"12px"}
                color={"var(--icon-secondary-200)"}
              />
              <span style="padding-left: 6px; padding-right: 2px; ">
                {workspaceMeta.name}
              </span>
            </span>
          {/if}
          {#if path.length > 0}
            {#each path as elem}
              <span class="text-secondary-200">/</span>
              <span class="px-1 sparrow-fs-12">
                {#if elem.type === ItemType.COLLECTION}
                  <CollectionIcon
                    height={"10px"}
                    width={"10px"}
                    color={"var(--icon-secondary-200)"}
                  />
                {:else if elem.type === ItemType.FOLDER}
                  <FolderIcon2
                    height={"12px"}
                    width={"12px"}
                    color={"var(--icon-secondary-200)"}
                  />
                {/if}
                <span style="padding-left: 6px; padding-right: 2px; "
                  >{elem.name}</span
                ></span
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
        type={"teritiary"}
        buttonStyleProp={"font-size: var(--base-text);"}
      />
    {:else if path.length > 0 && path[path.length - 1].type === ItemType.COLLECTION}
      <Button
        onClick={() => {
          createFolderNameVisibility = true;
        }}
        title={"+ Folder"}
        buttonClassProp={"btn mb-2"}
        type={"teritiary"}
        buttonStyleProp={"font-size: var(--base-text);"}
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
        title={"Save"}
        textClassProp={"fs-6"}
        type={"primary"}
        loader={isLoading}
        onClick={async () => {
          isSaveTouched = true;
          if (path.length > 0 && tabName.length > 0) {
            isLoading = true;
            const res = await onSave(
              workspaceMeta,
              path,
              tabName,
              requestDescription,
              type,
            );
            if (res.status === "success") {
              onFinish(res.data.id);
              onClick(false);
              if (type !== saveType.SAVE_DESCRIPTION) {
                notifications.success("API request saved successfully.");
              } else {
                notifications.success("Documentation saved successfully.");
              }
            } else {
              notifications.error(
                "Failed to save the request. Please try again",
              );
            }
            isLoading = false;
          }
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
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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
    background-color: var(--bg-tertiary-300);
  }
  .save-text-clr {
    color: var(--text-secondary-200);
  }
  .save-text-clr-empty {
    color: var(--text-secondary-350);
  }
  .api-name-usage {
    position: absolute;
    top: -5px;
    right: 30px;
    width: 2000%;
    border-radius: 8px;
    box-shadow: 0px 16px 48px 0px #0000002d;
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
    cursor: pointer;
  }
  .instruction-btn:hover {
    background-color: var(--bg-tertiary-650) !important;
  }
  .instruction-btn:active {
    background-color: var(--bg-primary-400) !important;
  }
  .edit-input {
    padding: 0 8px !important;
    font-size: 14px;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid var(--sparrow-bottom-border);
  }
  .edit-input:focus {
    background-color: var(--bg-tertiary-300);
  }
  .item-header {
    padding: 2px;
    padding-left: 6px;
    border-bottom: 1px solid transparent;
  }
  .item-header:hover {
    background-color: var(--bg-tertiary-300);
    border-bottom: 1px solid var(--sparrow-bottom-border);
  }
  .item-header:hover .edit-pencil {
    display: inline-block !important;
  }
  .item:hover {
    background-color: var(--bg-tertiary-300) !important ;
  }

  .row-left-section::-webkit-scrollbar-thumb {
    background-color: var(--bg-tertiary-100);
  }

  .row-left-section::-webkit-scrollbar-button {
    color: var(--bg-tertiary-100);
  }
</style>
