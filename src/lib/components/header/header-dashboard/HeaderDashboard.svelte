<script lang="ts">
  import { appWindow } from "@tauri-apps/api/window";
  import { Observable } from "rxjs";
  import HeaderDropdown from "../../dropdown/HeaderDropdown.svelte";
  import icons, {
    NotifyIcon,
    SearchIcon,
    SettingIcon,
  } from "$lib/assets/app.asset";
  import {
    isWorkspaceCreatedFirstTime,
    isWorkspaceLoaded,
    user,
  } from "$lib/store";
  import { onDestroy, onMount } from "svelte";
  import { HeaderDashboardViewModel } from "./HeaderDashboard.ViewModel";
  import {
    type CollectionDocument,
    type TeamDocument,
    type WorkspaceDocument,
  } from "$lib/database/app.database";
  import { useNavigate } from "svelte-navigator";
  import GlobalSearchBarPopup from "$lib/components/header/global-search-bar/GlobalSearchBar.svelte";
  import { useTree } from "$lib/components/collections/collections-list/collectionList";
  import { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  import { CollectionsViewModel } from "../../../../pages/Collections/Collections.ViewModel";
  const [, , searchNode] = useTree();
  import type {
    CollectionsMethods,
    CurrentTeam,
    CurrentWorkspace,
  } from "$lib/utils/interfaces";
  export let collectionsMethods: CollectionsMethods;
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { fade, slide } from "svelte/transition";
  import { TeamViewModel } from "../../../../pages/Teams/team.viewModel";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";

  export let handleWorkspaceSwitch;

  export let activeSideBarTabMethods: any;
  export let activeWorkspaceRxDoc: Observable<WorkspaceDocument>;
  export let currentTeam: CurrentTeam;
  export let currentWorkspace: CurrentWorkspace;
  export let currWorkspace: CurrentWorkspace;
  export let teams: Observable<TeamDocument[]>;

  const isWin = navigator.platform.toLowerCase().includes("win");
  const navigate = useNavigate();
  const _workspaceViewModel = new TeamViewModel();
  const _viewModel = new HeaderDashboardViewModel();
  const _collectionMethods = new CollectionsViewModel();
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;
  const _colllectionListViewModel = new CollectionListViewModel();
  const collection = _colllectionListViewModel.collection;

  let collections = [];
  let allworkspaces = [];
  let activeWorkspaceId: string;
  let activeWorkspaceName: string;
  let searchData: string = "";
  let ownerName: string = "";
  let hideHeaders = false;
  let profile: boolean = false;
  let activeWorkspaceRxDocVal: WorkspaceDocument;
  let showGlobalSearchPopup: boolean = false;
  let trackWorkspaceId: string;
  let name: string = "";
  let email: string = "";
  let userId: string | undefined;
  let firstLetter: string;
  let isMaximizeWindow: boolean = false;
  let filteredCollection = [];
  let filteredFolder = [];
  let filteredRequest = [];
  let isOpen: boolean = false;

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

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      if (value) {
        activeWorkspaceRxDocVal = value;
        activeWorkspaceId = value._data._id;
        activeWorkspaceName = value._data.name;
        if (ownerName) {
          name = ownerName;
          firstLetter = name[0];
        } else {
          name = name;
        }
        if (trackWorkspaceId !== value.get("_id")) {
          const response = await _viewModel.getServerEnvironments(
            value.get("_id"),
          );
          if (response.isSuccessful && response.data.data) {
            const environments = response.data.data;
            _viewModel.refreshEnvironment(environments, value.get("_id"));
          }
        }
        trackWorkspaceId = value.get("_id");
      }
    },
  );

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

        if (!activeWorkspaceRxDoc && currWorkspace) {
          isWorkspaceLoaded.set(false);
          isWorkspaceLoaded.set(true);
        }
      }
    },
  );

  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      userId = value._id;
      email = value?.email;
      name = value?.name;
      if (name) {
        firstLetter = name[0];
      }
    }
  });

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

  const handleDropdown = (id: string, tab: string, team: any) => {
    isWorkspaceLoaded.set(false);
    _viewModel.activateWorkspace(id);

    isWorkspaceCreatedFirstTime.set(false);
    isWorkspaceLoaded.set(true);
  };

  onDestroy(() => {
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
    hideHeaders = window.innerWidth <= 700;
  }

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
    MixpanelEvent(Events.GLOBAL_SEARCH, { clicked: true });
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
  class="d-flex w-100 ps-1 align-items-center justify-content-between bg-backgroundColor header"
  style="height:44px;"
  data-tauri-drag-region
>
  <div
    class="d-flex d-flex align-items-center justify-content-center"
    style="height:20px ;padding: 0px, 6px, 0px, 6px;"
    data-tauri-drag-region
  >
    {#if !isWin}
      <div class="d-flex mac-container">
        <div on:click={onClose} class="mac-nav"></div>
        <div on:click={onMinimize} class="mac-nav"></div>
        <div on:click={toggleSize} id="resize-button" class="mac-nav"></div>
      </div>
    {/if}
    <div class="d-flex align-items-center justify-content-center gap-2">
      <div>
        <img src={icons.appIcon} class="app-icon" alt="sparrowLogo" />
      </div>
    </div>
    <div
      class="d-flex d-flex align-items-center justify-content-center gap-2 {showGlobalSearchPopup &&
      hideHeaders
        ? ''
        : ''}"
    >
      <HeaderDropdown
        {teams}
        {userId}
        {currentTeam}
        {currentWorkspace}
        data={workspaces}
        onclick={handleDropdown}
        {collectionsMethods}
        {activeSideBarTabMethods}
        {activeWorkspaceId}
      />
    </div>
  </div>

  <div
    style="height:32px;
    
    {!showGlobalSearchPopup ? 'width:180px;' : 'width:400px;'}
    
     position: relative;{showGlobalSearchPopup && hideHeaders
      ? 'left:50%;transform: translateX(-50%);'
      : ''}"
    class="{showGlobalSearchPopup && hideHeaders
      ? 'position-absolute'
      : ''} search-container sc-desktop bg-backgroundLight pe-2 d-flex align-items-center search-bar justify-content-end rounded"
  >
    <div class="ps-3 d-flex align-items-center justify-content-center">
      <SearchIcon />
    </div>

    <div class="w-100">
      <input
        type="search"
        style="font-size: 12px;"
        class="input-search-bar bg-backgroundLight"
        placeholder="Search Sparrow"
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

  {#if showGlobalSearchPopup && hideHeaders}
    <div style="height:32px; width:400px;position: relative;"></div>
  {/if}

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
      class="my-auto align-items-center pe-3 gap-{!isSearchVisible
        ? '0'
        : '2'} d-flex"
    >
      <div
        style="height:32px;
    
    {!showGlobalSearchPopup ? 'width:40px; z-index:1;' : 'width:400px;'}
    
     position: relative;{showGlobalSearchPopup
          ? 'left:50%;transform: translateX(-50%);'
          : ''}"
        class="{showGlobalSearchPopup
          ? 'position-absolute'
          : ''} search-container sc-mobile bg-backgroundLight pe-2 d-flex align-items-center search-bar justify-content-end rounded"
      >
        <div class="w-100 position-relative">
          <div
            on:click={() => {
              handleGlobalSearchPopup(true);
            }}
            class="position-absolute"
            style="
        
        left: 12px;
          top:2px;
          width:20px;
        "
          >
            <SearchIcon />
          </div>
          <input
            type="search"
            style="font-size: 12px;"
            class="input-search-bar bg-backgroundLight"
            placeholder="Search Sparrow"
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
      <div
        class="my-auto {showGlobalSearchPopup && hideHeaders ? 'd-none' : ''}"
      >
        <Tooltip placement={"bottom"} title={"Coming Soon!"}>
          <button class="bg-backgroundColor border-0" style="height:40px;">
            <SettingIcon width={33} height={33} />
          </button>
        </Tooltip>
      </div>
      <div
        class="my-auto {showGlobalSearchPopup && hideHeaders ? 'd-none' : ''}"
      >
        <Tooltip placement={"bottom"} title={"Coming Soon!"}>
          <button class="bg-backgroundColor border-0" style="height:40px;">
            <NotifyIcon width={39} height={39} />
          </button>
        </Tooltip>
      </div>
      <div
        class="my-auto px-1 {showGlobalSearchPopup && hideHeaders
          ? 'd-none'
          : ''}"
      >
        <div class="position-relative" style="z-index: 6;">
          <button
            class={`bg-backgroundColor border-0`}
            id="profile-dropdown"
            style="width: 24px; height: 24px;"
            on:click={toggleDropdown}
          >
            <p
              class="{showGlobalSearchPopup && hideHeaders
                ? 'd-none'
                : ''}{`profile-circle ${
                isOpen
                  ? 'bg-plusButton text-black'
                  : 'profile-btn text-defaultColor'
              } m-auto text-center d-flex align-items-center justify-content-center `}"
              style={`font-size: 12px; width: 100%; height: 100%; margin: 0; ${
                isOpen
                  ? "border: 2.2px solid #1193F0;"
                  : "border: 2.2px solid #45494D;"
              }`}
            >
              {!firstLetter
                ? email[0]?.toUpperCase()
                : firstLetter?.toUpperCase()}
            </p>
          </button>

          {#if isOpen}
            <div
              class="rounded z-3 profile-explorer bg-backgroundDropdown position-absolute text-color-white py-1"
              style="border: 1px solid #313233; backdrop-filter: blur(15px); display: {isOpen
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
                  style={`font-size: 40px; padding-top: 2px; width: 60px; height: 60px; display: flex; border: 2px solid #45494D;border-radius: 50%;`}
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

    {#if isWin}
      <div class="d-flex">
        <div class="controller-btn">
          <button on:click={onMinimize} class="button-minus border-0 py-1 px-1">
            <img src={icons.minimizeIcon} alt="" />
          </button>
        </div>

        <div class="controller-btn">
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
        <div class="controller-btn">
          <button on:click={onClose} class="button-close border-0 py-1 px-1">
            <img src={icons.closeIcon} alt="" />
          </button>
        </div>
      </div>
    {/if}
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
    border-radius: 50%;
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
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 7;
  }
  .input-search-bar {
    width: 100%;
    font-size: 16px;
    line-height: 1.5;
    border-radius: 4px;
    border: none;
    outline: none;
    padding: 6px 12px;
  }
  .search-container {
    border: 1px solid transparent;
  }
  .search-container:hover {
    border: 1px solid var(--workspace-hover-color);
  }
  .controller-btn button {
    height: 44px;
    width: 44px;
  }
  .search-container {
    transition: 0.1s ease-in-out;
  }
  .app-icon {
    width: 17.5px;
    margin-left: 20px;
    margin-right: 30px;
  }
  .header {
    border-bottom: 1px solid var(--border-color);
  }
  .mac-container {
    margin-left: 20px;
  }
  .mac-nav {
    height: 10px;
    width: 10px;
    border-radius: 50%;
    cursor: pointer;
  }
  .mac-nav:nth-child(1) {
    background-color: #ff605c;
  }
  .mac-nav:nth-child(2) {
    background-color: #ffbd44;
    margin: 0 10px;
  }
  .mac-nav:nth-child(3) {
    background-color: #00ca4e;
  }
  @media only screen and (max-width: 992px) {
    .sc-desktop {
      display: none !important;
    }
    .input-search-bar {
      padding: 6px;
      padding-left: 32px;
    }
  }
  @media only screen and (min-width: 993px) {
    .sc-mobile {
      display: none !important;
    }
  }
</style>
