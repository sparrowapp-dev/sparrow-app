<script>
  import { appWindow } from "@tauri-apps/api/window";
  import logo from "$lib/assets/logo.svg";
  import closeIcon from "$lib/assets/close.svg";
  import resizeIcon from "$lib/assets/resize.svg";
  import minimizeIcon from "$lib/assets/minimize.svg";
  import notify from "$lib/assets/notify.svg";
  import profile from "$lib/assets/profile.svg";
  import setting from "$lib/assets/setting.svg";

  let isFullScreen = true;

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

<section class="headerComponent">
  <div class="leftSection">
    <div class="logo"><img src={logo} alt="" /></div>
  </div>

  <div class="rightSection">
    <div class="action">
      <button on:click={onMinimize}>
        <img src={minimizeIcon} alt="" />
      </button>
      <button on:click={toggleSize}>
        <img src={resizeIcon} alt="" />
      </button>
      <button on:click={onClose}>
        <img src={closeIcon} alt="" />
      </button>
    </div>
  </div>
</section>
<div class="borderBottom" />

<style>
  .headerComponent {
    width: 100%;
    height: 5px;
    background-color: black;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .borderBottom {
    border-bottom: 0.5px solid rgba(128, 128, 128, 0.229);
    margin-top: 20px;
  }

  .leftSection {
    padding-left: 0px;
  }

  .leftSection .logo img {
    width: 98px;
    height: 36px;
    padding: 8px, 0px, 8px, 0px;
  }

  .rightSection button {
    background-color: transparent;
    border: none;
    width: 30px;
  }


</style>
