<script>
  import { appWindow } from "@tauri-apps/api/window";
  import logo from "$lib/assets/logo.svg";
  import closeIcon from "$lib/assets/close.svg";
  import resizeIcon from "$lib/assets/resize.svg";
  import minimizeIcon from "$lib/assets/minimize.svg";
  import circleIcon from "$lib/assets/Ellipse.svg";
  import dropdown from "$lib/assets/dropdown.svg";
  import searchIcon from "$lib/assets/search.svg";
  import settingIcon from "$lib/assets/setting.svg";
  import profileIcon from "$lib/assets/profile.svg";
  import notifyIcon from "$lib/assets/notify.svg";

  const onMinimize = () => {
    appWindow.minimize();
  };

  const onClose = () => {
    appWindow.close();
  };

  const toggleSize = () => {
    appWindow.toggleMaximize();
  };
</script>

<!-- <section
  class="d-flex w-100 justify-content-between align-items-center bg-black border-0 border-bottom border-dark p-0"
  data-tauri-drag-region
>
  <div class="d-flex gap-3">
    <div class="logo">
      <img src={logo} alt="" class="w-100" />
    </div>
  </div>
  <div class="d-flex gap-0">
    <button on:click={onMinimize} class="btn btn-black button">
      <img src={minimizeIcon} alt="" class="w-100" />
    </button>
    <button on:click={toggleSize} class="btn btn-black button">
      <img src={resizeIcon} alt="" class="w-100" />
    </button>
    <button on:click={onClose} class="btn btn-black">
      <img src={closeIcon} alt="" class="w-100" />
    </button>
  </div>    
</section> -->

<div
  class="d-flex p-1 align-items-center justify-content-between bg-blackColor"
  data-tauri-drag-region
>
  <div
    class="d-flex d-flex align-items-center justify-content-center"
    style="width: 238px;height:20px ;padding: 0px, 6px, 0px, 6px; gap: 12px;
"
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
      <p style="font-size: 12px;" class="mb-0">Workspace</p>
      <button class="p-1 border-0 bg-blackColor">
        <img src={dropdown} alt="" />
      </button>
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
        <button class="btn btn-black">
          <img src={profileIcon} alt="" />
        </button>
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
</style>
