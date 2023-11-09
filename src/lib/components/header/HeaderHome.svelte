<script lang="ts">
  import { appWindow } from "@tauri-apps/api/window";
  import closeIcon from "$lib/assets/close.svg";
  import resizeIcon from "$lib/assets/resize.svg";
  import minimizeIcon from "$lib/assets/minimize.svg";
  import circleIcon from "$lib/assets/Ellipse.svg";
  import searchIcon from "$lib/assets/search.svg";
  import settingIcon from "$lib/assets/setting.svg";
  import profileIcon from "$lib/assets/profile.svg";
  import notifyIcon from "$lib/assets/notify.svg";
  import { userLogout } from "$lib/services/auth.service";
  import { clearAuthJwt } from "$lib/utils/jwt";
  import { useNavigate } from "svelte-navigator";
  import { notifications } from "$lib/utils/notifications";
  import { setUser, user } from "$lib/store/auth.store";
  import signout from "$lib/assets/signout.svg";
  import shortcut from "$lib/assets/shortcut.svg";
  import about from "$lib/assets/about.svg";
  import settings from "$lib/assets/settings.svg";
  import account from "$lib/assets/account.svg";
  import doubleResizeIcon from "$lib/assets/close-icon.svg";

  import HeaderDropdown from "../dropdown/HeaderDropdown.svelte";
  import { fetchWorkspaces } from "$lib/services/workspace.service";
  import { setCurrentWorkspace } from "$lib/store/workspace.store";
  import { onDestroy } from "svelte";

  let minimiMaximizeWindow: boolean = false;

  const navigate = useNavigate();
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

  const logout = async () => {
    const response = await userLogout();
    if (response.isSuccessful) {
      clearAuthJwt();
      setUser(null);
      navigate("/login");
    } else {
      notifications.error("Something went wrong");
      throw "error registering user: " + response.message;
    }
  };
  let profile: boolean = false;
  window.addEventListener("click", () => {
    profile = false;
  });

  let workspacedropDown: any[] = [];

  const handleWorkspace = async (userId: string) => {
    let response = await fetchWorkspaces(userId);
    if (response.isSuccessful) {
      workspacedropDown = response.data.data;
      setCurrentWorkspace(
        response.data.data[0]._id,
        response.data.data[0].name,
      );
    }
  };

  const userUnsubscribe = user.subscribe((value) => {
    if (value) {
      handleWorkspace(value._id);
    }
  });

  const handleDropdown = (id, tab) => {
    setCurrentWorkspace(id, tab);
  };
  onDestroy(userUnsubscribe);
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
        <img src={circleIcon} alt="sparrowLogo" />
      </div>
      <p style="font-size: 18px;" class="mb-0 gradient-text">sparrow</p>
    </div>
    <div
      class="d-flex d-flex align-items-center justify-content-center gap-2"
      style="height: 36px; width:116px"
    >
      <HeaderDropdown data={workspacedropDown} onclick={handleDropdown} />
    </div>
  </div>

  <div
    style="height:32px; width:400px "
    class="inputField bg-backgroundColor pe-2 d-flex align-items-center justify-content-center rounded"
  >
    <div class="ps-3">
      <img src={searchIcon} alt="" />
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
          <img src={settingIcon} alt="" />
        </button>
      </div>
      <div class="col-3">
        <button class="bg-blackColor border-0">
          <img src={notifyIcon} alt="" />
        </button>
      </div>
      <div class="col-3">
        <div class="position-relative">
          <button class="bg-blackColor border-0">
            <img
              src={profileIcon}
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
              <img src={account} alt="" /><span
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
              <img src={settings} alt="" /><span
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
              <img src={shortcut} alt="" /><span
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
              <img src={about} alt="" /><span
                class="m-2"
                style="font-size: 12px;">About Sparrow</span
              >
            </div>
            <div
              class="cursor-pointer d-flex align-items-center flex-start px-3 height: 26px"
              on:click={() => {
                logout();
              }}
            >
              <img src={signout} alt="" /><span
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
        <img src={minimizeIcon} alt="" />
      </button>
    </div>

    <div class="col-2">
      <button on:click={toggleSize} class="button-resize border-0 py-1 px-2">
        {#if minimiMaximizeWindow === true}
          <img src={resizeIcon} alt="" />
        {/if}
        {#if minimiMaximizeWindow === false}
          <img src={doubleResizeIcon} alt="" />
        {/if}
      </button>
    </div>

    <div class="col-2 pe-2">
      <button on:click={onClose} class="button-close border-0 py-1 px-2">
        <img src={closeIcon} alt="" />
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
