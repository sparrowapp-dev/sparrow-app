<script lang="ts">
  import { appWindow } from "@tauri-apps/api/window";
  import { user } from "$lib/store/auth.store";
  import { Observable } from "rxjs";
  import HeaderDropdown from "../../dropdown/HeaderDropdown.svelte";
  import icons from "$lib/assets/app.asset";
  import {
    setCurrentWorkspace,
    updateCurrentWorkspace,
  } from "$lib/store/workspace.store";
  import { onDestroy } from "svelte";
  import { HeaderDashboardViewModel } from "./HeaderDashboard.ViewModel";
  import { type WorkspaceDocument } from "$lib/database/app.database";

  const _viewModel = new HeaderDashboardViewModel();
  const workspaces : Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const activeWorkspace : Observable<WorkspaceDocument> = _viewModel.activeWorkspace;
  let minimiMaximizeWindow: boolean = false;
  let profile: boolean = false;
  let activeWorkspaceRxDoc: WorkspaceDocument;

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

  const onMinimize = () => {
    appWindow.minimize();
  };

  const onClose = () => {
    appWindow.close();
  };

  const toggleSize = () => {
    appWindow.toggleMaximize();
    minimiMaximizeWindow = !minimiMaximizeWindow;
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
    setCurrentWorkspace(id, tab);
  };

  onDestroy(() => {
    userUnsubscribe();
    workspaceSubscribe.unsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<div
  class="d-flex w-100 ps-1 pe-2 align-items-center justify-content-between bg-blackColor pe-0"
  style="z-index:9999999999999999;position:fixed;left:0px;height:44px;"
  data-tauri-drag-region
>
  <div
    class="d-flex d-flex align-items-center justify-content-center"
    style="width: 238px;height:20px ;padding: 0px, 6px, 0px, 6px; gap: 12px;"
  >
    <div class="d-flex align-items-center justify-content-center gap-2">
      <div>
        <img src={icons.circleIcon} alt="sparrowLogo" />
      </div>
      <p style="font-size: 18px;" class="mb-0 gradient-text">sparrow</p>
    </div>
    <div
      class="d-flex d-flex align-items-center justify-content-center gap-2"
      style="height: 36px; width:116px"
    >
      <HeaderDropdown data={workspaces} onclick={handleDropdown} />
    </div>
  </div>

  <div
    style="height:32px; width:400px "
    class="inputField bg-backgroundColor pe-2 d-flex align-items-center justify-content-center rounded"
  >
    <div class="ps-3">
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

  <div class="d-flex align-items-center justify-content-center">
    <div class="row gap-1">
      <div class="col-3">
        <button class="bg-blackColor border-0">
          <img src={icons.settingIcon} alt="" />
        </button>
      </div>
      <div class="col-3">
        <button class="bg-blackColor border-0">
          <img src={icons.notifyIcon} alt="" />
        </button>
      </div>
      <div class="col-3">
        <div class="position-relative">
          <button class="bg-blackColor border-0">
            <img
              src={icons.profileIcon}
              on:click={() => {
                setTimeout(() => {
                  profile = true;
                }, 100);
              }}
              alt=""
            />
          </button>
          <div
            class="rounded profile-explorer position-absolute text-color-white py-1"
            style="border: 1px solid #313233; background-color: rgba(0,0,0,0.7); backdrop-filter: blur(10px); display: {profile
              ? 'block'
              : 'none'}; top: 40px; right: 0; width: 219px;"
            on:click={() => {
              profile = false;
            }}
          >
            <div
              class="cursor-pointer d-flex align-items-center flex-start px-3 height: 26px"
              on:click={() => {
                profile = false;
              }}
            >
              <img src={icons.account} alt="" /><span
                class="m-2"
                style="font-size: 12px;">View Account</span
              >
            </div>
            <div
              class="cursor-pointer d-flex align-items-center flex-start px-3 height: 26px"
              on:click={() => {
                profile = false;
              }}
            >
              <img src={icons.settings} alt="" /><span
                class="m-2"
                style="font-size: 12px;">Notification Settings</span
              >
            </div>
            <div
              class="cursor-pointer d-flex align-items-center flex-start px-3 height: 26px"
              on:click={() => {
                profile = false;
              }}
            >
              <img src={icons.shortcut} alt="" /><span
                class="m-2"
                style="font-size: 12px;">App Shortcuts</span
              >
            </div>
            <div
              class="cursor-pointer d-flex align-items-center flex-start px-3 height: 26px"
              on:click={() => {
                profile = false;
              }}
            >
              <img src={icons.about} alt="" /><span
                class="m-2"
                style="font-size: 12px;">About Sparrow</span
              >
            </div>
            <div
              class="cursor-pointer d-flex align-items-center flex-start px-3 height: 26px"
              on:click={() => {
                _viewModel.logout();
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

    <div class="col-2">
      <button on:click={onMinimize} class="button-minus border-0 py-1 px-2">
        <img src={icons.minimizeIcon} alt="" />
      </button>
    </div>

    <div class="col-2">
      <button on:click={toggleSize} class="button-resize border-0 py-1 px-2">
        {#if minimiMaximizeWindow === true}
          <img src={icons.resizeIcon} alt="" />
        {/if}
        {#if minimiMaximizeWindow === false}
          <img src={icons.doubleResizeIcon} alt="" />
        {/if}
      </button>
    </div>

    <div class="col-2 pe-2">
      <button on:click={onClose} class="button-close border-0 py-1 px-2">
        <img src={icons.closeIcon} alt="" />
      </button>
    </div>
  </div>
</div>

<style>
  .button-minus,
  .button-resize,
  .button-close {
    background-color: transparent;
    border: none;
  }

  .button-minus:hover,
  .button-resize:hover {
    background-color: rgba(66, 65, 65, 0.315);
  }

  .button-close:hover {
    background-color: red;
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