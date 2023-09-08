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
    <div class="workSpace">Workspace</div>
  </div>

  <div class="middleSection">
    <input type="text" name="" id="" />
  </div>

  <div class="rightSection">
    <div class="features">
      <button>
        <img src={setting} alt="" />
      </button>
      <button>
        <img src={notify} alt="" />
      </button>
      <button>
        <img src={profile} alt="" />
      </button>
    </div>

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

<style>
  .headerComponent {
    width: 100%;
    height: 45px;
    background-color: black;
    display: grid;
    grid-template-columns: 300px 1fr 400px;
    align-items: center;
  }

  .leftSection {
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-size: 14px;
  }

  .leftSection .logo {
    padding-left: 20px;
  }

  .leftSection .logo img {
    width: 80%;
    height: auto;
  }

  .leftSection .workSpace {
    display: flex;
    align-items: center;
  }

  .middleSection {
    text-align: right;
  }

  .middleSection input {
    width: 85%;
    height: 25px;
  }

  .rightSection {
    display: grid;
    grid-template-columns: 1fr 130px;
  }

  .rightSection .features {
    text-align: right;
    padding-right: 30px;
  }

  .rightSection button {
    background-color: transparent;
    border: none;
    min-width: 0px;
    width: 35px;
    padding: 0px;
    height: 30px;
  }
</style>
