<script>
  import { appWindow } from "@tauri-apps/api/window";
  import logo from "$lib/assets/logo.svg";
  import closeIcon from "$lib/assets/close.svg";
  import resizeIcon from "$lib/assets/resize.svg";
  import minimizeIcon from "$lib/assets/minimize.svg";

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
    width: Fill (488px);
    height: Hug (44px);
    padding: 6px, 6px, 6px, 6px;
    border: 0px, 0px, 1px, 0px;
    background-color: black;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .borderBottom {
    border-bottom: 0.5px solid rgba(128, 128, 128, 0.229);
  }

  .leftSection {
    width: Hug (110px);
    height: Hug (36px);
    padding: 4px, 6px, 0px, 6px;
    gap: 12px;
  }

  .logo {
    width: Hug (98px);
    height: Hug (36px);
    padding: 8px, 0px, 8px, 0px;
    gap: 4px;
  }

  .leftSection .logo img {
    font-family: Poppins;
    width: 100%;
    font-weight: 400;
    line-height: 27px;
    letter-spacing: 0em;
    text-align: left;
  }

  .rightSection {
    width: Hug (100px);
    height: Hug (28px);
    gap: 8px;
  }

  .rightSection button {
    background-color: transparent;
    width: Hug (24px);
    height: Hug (24px);
    border: none;
    /* border-radius: 4px; */
    /* gap: 8px; */
  }

  @media (min-width: 600px) {
    .headerComponent {
      padding-bottom:  6px;
    }

    .leftSection {
      width: Hug (110px);
      height: Hug (36px);
      padding: 0px, 6px, 0px, 6px;
      gap: 12px;
    }

     .logo {
    width: Hug (98px);
    height: Hug (36px);
    padding: 2px, 0px, 2px, 0px;
    gap: 4px;
  }

    .borderBottom {
      border-bottom: 0.5px solid rgba(128, 128, 128, 0.229);
      /* margin-top: 10px; */
    }
  }
</style>
