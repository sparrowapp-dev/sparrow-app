<script lang="ts">
  import { appWindow } from "@tauri-apps/api/window";
  import closeIcon from "$lib/assets/close.svg";
  import resizeIcon from "$lib/assets/resize.svg";
  import minimizeIcon from "$lib/assets/minimize.svg";
  import sparrowicon from "$lib/assets/sparrowIcon.svg";
  import doubleResizeIcon from "$lib/assets/close-icon.svg";
  import { user } from "$lib/store/auth.store";
  import { onMount } from "svelte";

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

  let isloggedIn;
  user.subscribe((value) => {
    isloggedIn = value;
  });

  onMount(() => {
    if (isloggedIn === null) {
      const resizeButton = document.getElementById("resize-button");
      if (resizeButton) {
        if (window.innerWidth > 800) {
          resizeButton.click();
          isMaximizeWindow = false;
        }
      }
    }
  });
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
    <button on:click={onMinimize} class="btn btn-black button">
      <img src={minimizeIcon} alt="" class="w-100" />
    </button>
    <button
      on:click={toggleSize}
      class="btn btn-black button"
      id="resize-button"
    >
      {#if isMaximizeWindow === true}
        <img src={doubleResizeIcon} alt="" />
      {:else}
        <img src={resizeIcon} alt="" />
      {/if}
    </button>
    <button on:click={onClose} class="btn btn-black">
      <img src={closeIcon} alt="" class="w-100" />
    </button>
  </div>
</section>
