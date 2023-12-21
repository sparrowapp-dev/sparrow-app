<script lang="ts">
  import { appWindow } from "@tauri-apps/api/window";
  import { user } from "$lib/store/auth.store";
  import { Observable } from "rxjs";

  import HeaderDropdown from "../../dropdown/HeaderDropdown.svelte";
  import icons from "$lib/assets/app.asset";
  import {
    isWorkspaceCreatedFirstTime,
    setCurrentWorkspace,
    updateCurrentWorkspace,
  } from "$lib/store/workspace.store";
  import { onDestroy, onMount } from "svelte";
  import { HeaderDashboardViewModel } from "./HeaderDashboard.ViewModel";
  import {
    type CollectionDocument,
    type WorkspaceDocument,
  } from "$lib/database/app.database";
  import { useNavigate } from "svelte-navigator";
  import GlobalSearchBarPopup from "$lib/components/Modal/GlobalSearchBarPopup.svelte";
  import { useTree } from "$lib/components/collections/collections-list/collectionList";
  import { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  import { CollectionsViewModel } from "../../../../pages/Collections/Collections.ViewModel";
  const [, , searchNode] = useTree();
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  export let collectionsMethods: CollectionsMethods;
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { fade, slide } from "svelte/transition";
  // import PageLoader from "$lib/components/Transition/PageLoader.svelte";
  export let activeSideBarTabMethods;

  const navigate = useNavigate();
  const _viewModel = new HeaderDashboardViewModel();
  const _collectionMethods = new CollectionsViewModel();
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;
  let collections = [];
  let allworkspaces = [];
  let activeWorkspaceId: string;
  let activeWorkspaceName: string;
  let searchData: string = "";
  // let isLoadingPage: boolean = false;
  const _colllectionListViewModel = new CollectionListViewModel();
  const collection = _colllectionListViewModel.collection;

  collection.subscribe((value) => {
    if (value) {
      const collectionArr = value.map(
        (collectionDocument: CollectionDocument) => {
          const collectionObj =
            _colllectionListViewModel.getCollectionDocument(collectionDocument);
          return collectionObj;
        },
      );
      collections = collectionArr;
    }
  });

  let profile: boolean = false;
  let activeWorkspaceRxDoc: WorkspaceDocument;
  let showGlobalSearchPopup: boolean = false;

  let name: string = "";
  let email: string = "";
  let firstLetter;
  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      if (value.personalWorkspaces) {
        name = value?.personalWorkspaces[0]?.name;
      }
      email = value?.email;
      if (name) {
        firstLetter = name[0];
      }
    }
  });

  const workspaceSubscribe = workspaces.subscribe(
    (value: WorkspaceDocument[]) => {
      if (value && value.length > 0) {
        const workspaceArr = value.map(
          (workspaceDocument: WorkspaceDocument) => {
            const workspaceObj =
              _viewModel.getWorkspaceDocument(workspaceDocument);
            return workspaceObj;
          },
        );
        allworkspaces = workspaceArr;
        if (!activeWorkspaceRxDoc) {
          _viewModel.activateWorkspace(value[0].get("_id"));
          updateCurrentWorkspace(value[0].get("_id"), value[0].get("name"));
        }
      }
    },
  );

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    (value: WorkspaceDocument) => {
      if (value) {
        activeWorkspaceRxDoc = value;
        activeWorkspaceId = value._data._id;
        activeWorkspaceName = value._data.name;
      }
    },
  );

  let isMaximizeWindow: boolean = false;

  const onMinimize = () => {
    appWindow.minimize();
  };

  const onClose = () => {
    appWindow.close();
  };

  const toggleSize = () => {
    appWindow.toggleMaximize();
    isMaximizeWindow = !isMaximizeWindow;
  };

  let filteredCollection = [];
  let filteredFolder = [];
  let filteredRequest = [];
  const handleSearch = () => {
    filteredCollection.length = 0;
    filteredFolder.length = 0;
    filteredRequest.length = 0;
    searchNode(
      searchData,
      filteredCollection,
      filteredFolder,
      filteredRequest,
      collections,
      activeWorkspaceName,
    );
  };

  window.addEventListener("click", () => {
    profile = false;
  });

  const userUnsubscribe = user.subscribe((value) => {
    if (value) {
      _viewModel.refreshWorkspaces(value._id);
    }
  });

  const handleDropdown = (id: string, tab: string) => {
    _viewModel.activateWorkspace(id);
    isWorkspaceCreatedFirstTime.set(false);
    setCurrentWorkspace(id, tab);
  };

  onDestroy(() => {
    userUnsubscribe();
    workspaceSubscribe.unsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
  });

  let isSearchVisible = true;
  onMount(() => {
    handleWindowSize();
  });
  window.addEventListener("resize", handleWindowSize);
  function handleWindowSize() {
    const minWidthThreshold = 500;
    isSearchVisible = window.innerWidth >= minWidthThreshold;
  }

  let isOpen: boolean = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById("profile-dropdown");
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  function handleGlobalSearchPopup(show: boolean) {
    showGlobalSearchPopup = show;
  }

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
    unsubscribeUser();
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
</script>

<!-- {#if !isLoadingPage} -->
<div
  class="d-flex w-100 ps-1 align-items-center justify-content-between bg-blackColor header"
  style="height:44px;"
  data-tauri-drag-region
>
  <div
    class="d-flex d-flex align-items-center justify-content-center"
    style="width: 238px; height:20px ;padding: 0px, 6px, 0px, 6px;"
    data-tauri-drag-region
  >
    <div class="d-flex align-items-center justify-content-center gap-2">
      <div>
        <img src={icons.sparrowicon} alt="sparrowLogo" />
      </div>
    </div>
    <div
      class="d-flex d-flex align-items-center justify-content-center gap-2 {showGlobalSearchPopup
        ? 'd-none'
        : ''}"
      style="height: 36px; width:116px"
    >
      <HeaderDropdown
        data={workspaces}
        onclick={handleDropdown}
        {collectionsMethods}
        {activeSideBarTabMethods}
        {activeWorkspaceId}
      />
    </div>
  </div>

  <div
    style="height:32px; width:400px;position: relative;"
    class="search-container bg-backgroundColor pe-2 d-flex align-items-center search-bar justify-content-end rounded"
  >
    <div class="ps-3 d-flex align-items-center justify-content-center">
      <img src={icons.searchIcon} alt="" />
    </div>

    <div class="w-100">
      <input
        type="search"
        style="font-size: 12px;"
        class="input-search-bar bg-backgroundColor"
        placeholder="Search your workspaces, collections and endpoints"
        bind:value={searchData}
        on:input={() => {
          handleGlobalSearchPopup(true);
          handleSearch();
        }}
        on:click={() => {
          handleGlobalSearchPopup(true);
        }}
      />
    </div>
    {#if showGlobalSearchPopup}
      <GlobalSearchBarPopup
        {searchData}
        {handleGlobalSearchPopup}
        {filteredCollection}
        {filteredFolder}
        {filteredRequest}
        workspaces={allworkspaces}
        {activeWorkspaceId}
        {handleDropdown}
      />
    {/if}
  </div>
  {#if showGlobalSearchPopup}
    <div
      class="background-overlay"
      transition:fade={{ delay: 0, duration: 200 }}
      on:click={() => {
        handleGlobalSearchPopup(false);
      }}
    />
  {/if}

  <div
    class="d-flex align-items-center justify-content-center"
    style="margin-left: 10px;"
  >
    <div
      class="my-auto gap-{!isSearchVisible
        ? '0'
        : '4'} d-flex {showGlobalSearchPopup ? 'd-none' : ''}"
    >
      <div class="my-auto col-{!isSearchVisible ? '1' : '1'}">
        <Tooltip>
          <button class="bg-blackColor border-0">
            <img src={icons.settingIcon} alt="" />
          </button>
        </Tooltip>
      </div>
      <div
        class="my-auto col-{!isSearchVisible ? '1' : '2'} {showGlobalSearchPopup
          ? 'd-none'
          : ''}"
      >
        <Tooltip>
          <button class="bg-blackColor border-0">
            <img src={icons.notifyIcon} alt="" />
          </button>
        </Tooltip>
      </div>
      <div
        class="my-auto col-{!isSearchVisible ? '1' : '2'} {showGlobalSearchPopup
          ? 'd-none'
          : ''}"
      >
        <div class="position-relative" style="z-index: 9;">
          <button
            class={`bg-blackColor border-0`}
            id="profile-dropdown"
            style="width: 24px; height: 24px;"
            on:click={toggleDropdown}
          >
            <p
              class="{showGlobalSearchPopup ? 'd-none' : ''}{`profile-circle ${
                isOpen
                  ? 'bg-plusButton text-black'
                  : 'profile-btn text-defaultColor'
              } m-auto text-center align-items-center justify-content-center `}"
              style={`font-size: 12px; ${
                isOpen
                  ? "border: 2.2px solid #1193F0;"
                  : "border: 2.2px solid #45494D;"
              } `}
            >
              {!firstLetter
                ? email[0]?.toUpperCase()
                : firstLetter?.toUpperCase()}
            </p>
          </button>

          {#if isOpen}
            <div
              class="rounded z-3 profile-explorer position-absolute text-color-white py-1"
              style="border: 1px solid #313233; background-color: rgba(0,0,0,0.7); backdrop-filter: blur(15px); display: {isOpen
                ? 'block'
                : 'none'}; top: 40px; right: -10px; width: 219px;"
              on:click={() => {
                isOpen = false;
              }}
              transition:slide={{ duration: 300 }}
            >
              <div
                class="text-center align-items-center justify-content-center pt-3"
              >
                <p
                  class={`text-defaultColor m-auto text-center align-items-center justify-content-center profile-circle bg-dullBackground border-defaultColor border-2`}
                  style={`font-size: 40px; width: 33%; border: 2px solid #45494D;`}
                >
                  {!firstLetter
                    ? email[0]?.toUpperCase()
                    : firstLetter?.toUpperCase()}
                </p>
                <h1
                  class="text-white fw-normal mt-3"
                  style="color: #999; font-family: Roboto; font-size: 12px;"
                >
                  {!name ? email[0]?.toUpperCase() : name}
                </h1>
                <p
                  class="text-requestBodyColor fw-medium mb-0"
                  style="font-size: 12px;"
                >
                  {email}
                </p>
              </div>
              <hr class="" />

              <div
                class="cursor-pointer d-flex align-items-center flex-start px-3 height: 26px signOut"
                on:click={async () => {
                  await _viewModel.logout();
                }}
              >
                <img src={icons.signout} alt="" /><span
                  class="m-2"
                  style="font-size: 12px;">Sign Out</span
                >
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class=" d-flex {isSearchVisible ? 'gap-4' : ' gap-3'} ">
      <div class="col-2">
        <button on:click={onMinimize} class="button-minus border-0 py-1 px-1">
          <img src={icons.minimizeIcon} alt="" />
        </button>
      </div>

      <div class="col-2">
        <button
          on:click={toggleSize}
          class="button-resize border-0 py-1 px-1"
          id="resize-button"
        >
          {#if isMaximizeWindow === true}
            <img src={icons.doubleResizeIcon} alt="" />
          {:else}
            <img src={icons.resizeIcon} alt="" />
          {/if}
        </button>
      </div>
      <div class="col-2">
        <button on:click={onClose} class="button-close border-0 py-1 px-1">
          <img src={icons.closeIcon} alt="" />
        </button>
      </div>
    </div>
  </div>
</div>

<!-- {:else}
  <PageLoader />
{/if} -->

<style>
  .signOut:hover {
    background-color: var(--background-color);
  }

  .button-minus,
  .button-resize,
  .button-close {
    background-color: transparent;
    border: none;
  }

  .button-minus:hover,
  .button-resize:hover {
    background-color: rgba(128, 128, 128, 0.288);
  }

  .button-close:hover {
    background-color: red;
  }
  .profile-circle {
    border-radius: 100%;
  }
  .profile-btn:hover {
    border: 2.2px solid #8a9299 !important;
    color: #8a9299 !important;
  }

  .gradient-text {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .search-bar {
    z-index: 8;
  }
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    backdrop-filter: blur(3px);
    z-index: 4;
  }
  .input-search-bar {
    width: 100%;
    padding: 6px 12px;
    font-size: 16px;
    line-height: 1.5;
    border-radius: 4px;
    border: none;
    outline: none;
  }
  .search-container:hover {
    border: 1px solid var(--workspace-hover-color);
  }
</style>
