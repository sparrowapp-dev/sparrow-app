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
  import { type WorkspaceDocument } from "$lib/database/app.database";
  import { useNavigate } from "svelte-navigator";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  export let collectionsMethods: CollectionsMethods;
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";

  const navigate = useNavigate();
  const _viewModel = new HeaderDashboardViewModel();
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;

  let profile: boolean = false;
  let activeWorkspaceRxDoc: WorkspaceDocument;

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
        if (!activeWorkspaceRxDoc) {
          _viewModel.activateWorkspace(value[0].get("_id"));
          updateCurrentWorkspace(value[0].get("_id"), value[0].get("name"));
        }
      }
    },
  );

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    (value: WorkspaceDocument) => {
      activeWorkspaceRxDoc = value;
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

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
    unsubscribeUser();
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
</script>

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
      class="d-flex d-flex align-items-center justify-content-center gap-2"
      style="height: 36px; width:116px"
    >
      <HeaderDropdown
        data={workspaces}
        onclick={handleDropdown}
        {collectionsMethods}
      />
    </div>
  </div>

  <div
    style="height:32px; width:400px;"
    class="bg-backgroundColor pe-2 d-flex align-items-center justify-content-end rounded"
  >
    <div class="ps-3 d-flex align-items-center justify-content-center">
      <img src={icons.searchIcon} alt="" />
    </div>

    <div class="w-100">
      <input
        type="search"
        style="font-size: 12px;"
        class="form-control border-0 bg-backgroundColor"
        placeholder="Search your workspaces, collections and endpoints"
      />
    </div>
  </div>

  <div
    class="d-flex align-items-center justify-content-center"
    style="margin-left: 45px;"
  >
    <div class="gap-{!isSearchVisible ? '0' : '3'} d-flex">
      <div class="col-{!isSearchVisible ? '1' : '1'}">
        <Tooltip>
          <button class="bg-blackColor border-0">
            <img src={icons.settingIcon} alt="" />
          </button>
        </Tooltip>
      </div>
      <div class="col-{!isSearchVisible ? '1' : '2'}">
        <Tooltip>
          <button class="bg-blackColor border-0">
            <img src={icons.notifyIcon} alt="" />
          </button>
        </Tooltip>
      </div>
      <div class="col-{!isSearchVisible ? '1' : '2'}">
        <div class="position-relative">
          <button
            class={`bg-blackColor border-0`}
            id="profile-dropdown"
            style="width: 24px; height: 24px;"
            on:click={toggleDropdown}
          >
            <p
              class={`profile-circle ${
                isOpen
                  ? "bg-plusButton text-black"
                  : "profile-btn text-defaultColor"
              } m-auto text-center align-items-center justify-content-center `}
              style={`font-size: 12px; ${
                isOpen
                  ? "border: 2.2px solid #1193F0;"
                  : "border: 2.2px solid #45494D;"
              } `}
            >
              {firstLetter.toUpperCase()}
            </p>
          </button>

          <div
            class="rounded z-3 profile-explorer position-absolute text-color-white py-1"
            style="border: 1px solid #313233; background-color: rgba(0,0,0,0.7); backdrop-filter: blur(15px); display: {isOpen
              ? 'block'
              : 'none'}; top: 40px; right: -10px; width: 219px;"
            on:click={() => {
              isOpen = false;
            }}
          >
            <div
              class="text-center align-items-center justify-content-center pt-3"
            >
              <p
                class={`text-defaultColor m-auto text-center align-items-center justify-content-center profile-circle bg-dullBackground border-defaultColor border-2`}
                style={`font-size: 40px; width: 33%; border: 2px solid #45494D;`}
              >
                {firstLetter.toUpperCase()}
              </p>
              <h1
                class="text-white fw-normal mt-3"
                style="color: #999; font-family: Roboto; font-size: 12px;"
              >
                {name}
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
              on:click={() => {
                if (_viewModel.logout()) {
                  navigate("/login");
                }
              }}
            >
              <img src={icons.signout} alt="" /><span
                class="m-2"
                style="font-size: 12px;">Sign Out</span
              >
            </div>
          </div>
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
</style>
