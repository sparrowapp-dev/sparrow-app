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
    import HeaderDropdown from "../dropdown/HeaderDropdown.svelte";
    import { fetchWorkspaces } from "$lib/services/workspace.service";
    import { setCurrentWorkspace } from "$lib/store/workspace.store";
    import { onDestroy } from "svelte";

  const navigate = useNavigate();
  const onMinimize = () => {
    appWindow.minimize();
  };

  const onClose = () => {
    appWindow.close();
  };

  const toggleSize = () => {
    appWindow.toggleMaximize();
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

  let workspacedropDown : any[] = [];

  const handleWorkspace = async(userId: string) => {
    let response =  await fetchWorkspaces(userId);
    if (response.isSuccessful) {
      workspacedropDown = response.data.data;
      setCurrentWorkspace(response.data.data[0]._id, response.data.data[0].name);
    }
  }

  const userUnsubscribe = user.subscribe((value)=>{
    if(value){
      handleWorkspace(value._id);
    }
  })
  
  const handleDropdown = (id, tab)=>{
    setCurrentWorkspace(id, tab);
  }
  onDestroy(userUnsubscribe);
</script>

<div
  class="header d-flex w-100 p-1 align-items-center justify-content-between bg-blackColor" style="z-index:9999999999999999;"
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
      <HeaderDropdown data={workspacedropDown} onclick={handleDropdown}  />
    </div>
  </div>

  <div
    style="height:36px; width:480px "
    class="inputField bg-backgroundColor ps-3 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
  >
    <img src={searchIcon} alt="" />
    <input
      type="search"
      class="border-0 mb-0 focus-border-red w-100 h-100 fs-6 bg-backgroundColor"
      placeholder="Search your workspaces, collections and endpoints"
    />
  </div>

  <div class="d-flex justify-content-between">
    <div class="row g-0">
      <div class="col-3">
        <button class="btn btn-red">
          <img src={settingIcon} alt="" />
        </button>
      </div>
      <div class="col-4">
        <button class="btn btn-black">
          <img src={notifyIcon} alt="" />
        </button>
      </div>
      <div class="col-4">
        <div class="position-relative">
          <button class="btn btn-black" style="border:none; outline:none;">
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

    <div class="d-flex">
      <button on:click={onMinimize} class="btn btn-black w-25">
        <img src={minimizeIcon} alt="" />
      </button>

      <button on:click={toggleSize} class="btn btn-black w-25">
        <img src={resizeIcon} alt="" />
      </button>

      <button on:click={onClose} class="btn btn-black w-25">
        <img src={closeIcon} alt="" />
      </button>
    </div>
  </div>
</div>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 7vh;
  }

  .inputField > input {
    outline: none;
  }

  .inputField > input:focus {
    border-color: white;

    outline: none;
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
