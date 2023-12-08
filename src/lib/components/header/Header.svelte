<script lang="ts">
  import { appWindow } from "@tauri-apps/api/window";
  import sparrowicon from "$lib/assets/sparrowIcon.svg";
  import icons from "$lib/assets/app.asset";

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
</script>

<section
  class="d-flex justify-content-between align-items-center bg-black border-0 border-bottom border-dark p-0"
  data-tauri-drag-region
>
  <div class="d-flex gap-3">
    <div class="logo">
      <img src={sparrowicon} alt="" class="w-100" />
    </div>
  </div>
  <div class="d-flex gap-0">
    <button on:click={onMinimize} class="button-minus py-1 px-2">
      <img src={icons.minimizeIcon} alt="" class="w-100" />
    </button>
    <button
      on:click={toggleSize}
      class="button-resize py-1 px-2"
      id="resize-button"
    >
      {#if isMaximizeWindow === true}
        <img src={icons.doubleResizeIcon} alt="" />
      {:else}
        <img src={icons.resizeIcon} alt="" />
      {/if}
    </button>
    <button on:click={onClose} class="button-close py-1 px-2">
      <img src={icons.closeIcon} alt="" class="w-100" />
    </button>
  </div>
</section>

<style>
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
</style>
