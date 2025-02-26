<script lang="ts">
  import {
    CrossIconV2,
    DismissRegular,
    DoubleResizeIcon,
    ExpandIcon,
    MiniMizeIcon,
    SquareIcon,
    SubtractIcon,
  } from "@sparrow/library/icons";
  import { invoke } from "@tauri-apps/api/core";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onDestroy } from "svelte";
  import { WindowMultipleIcon } from "@sparrow/library/icons";

  export let isWindows = true;

  let appWindow = getCurrentWindow();

  let hoveredButton = "";
  const handleMouseEnter = (buttonName: string) => {
    hoveredButton = buttonName;
  };

  const handleMouseLeave = () => {
    hoveredButton = "";
  };

  const onMinimize = () => {
    appWindow.minimize();
  };

  const onClose = () => {
    appWindow.close();
  };
  let isFullscreen: boolean = false;

  const toggleSize = async () => {
    if (!isWindows) {
      const currentFullscreenState = await appWindow.isFullscreen();

      // Show original Toolbar when window is maximized
      if (!currentFullscreenState) {
        await invoke("show_toolbar");
      }

      // Toggle fullscreen mode
      await appWindow.setFullscreen(!currentFullscreenState);

      // Update isFullscreen state
      isFullscreen = !currentFullscreenState;
      console.log("Updated fullscreen state:", isFullscreen);
    } else {
      // Other platforms: Use maximize
      const isMaximized = await appWindow.isMaximized();
      if (isMaximized) {
        appWindow.unmaximize();
      } else {
        appWindow.maximize();
      }
    }
  };

  let isMaximizeWindow = false;

  const checkSize = async () => {
    isMaximizeWindow = await appWindow.isMaximized();
  };

  if (isWindows) {
    try {
      // Add event listener for window resize
      const unlistenResize = appWindow.onResized(checkSize);

      // // Cleanup listener when component is destroyed
      onDestroy(() => {
        unlistenResize.then((f) => f());
      });
    } catch {
      console.log("Insidie catch");
    }
  }

  if (!isWindows) {
    const unlistenResize = appWindow.onResized(async () => {
      isFullscreen = await appWindow.isFullscreen();
    });

    onDestroy(() => {
      unlistenResize.then((f) => f());
    });
  }
</script>

{#if isWindows}
  <!-- Windows Style Buttons -->
  <div class="d-flex">
    <div class="controller-btn">
      <button
        on:click={onMinimize}
        on:mouseenter={() => handleMouseEnter("minimize")}
        on:mouseleave={handleMouseLeave}
        class="custom-header-button button-minus border-0 py-1 px-1"
      >
        <SubtractIcon
        size={"16px"}
        color={hoveredButton === "minimize"
            ? "white"
            : "var(--text-secondary-200)"}
        />
      </button>
    </div>

    <div class="controller-btn">
      <button
        on:click={toggleSize}
        on:mouseenter={() => handleMouseEnter("resize")}
        on:mouseleave={handleMouseLeave}
        class="custom-header-button button-resize border-0 py-1 px-1"
        id="resize-button"
      >
        {#if isMaximizeWindow}
          <WindowMultipleIcon
          size={"16px"}
          color={hoveredButton === "resize"
            ? "white"
            : "var(--text-secondary-200)"}
          />
        {:else}
          <SquareIcon
            height={"10"}
            width={"10"}
            color={hoveredButton === "resize"
              ? "white"
              : "var(--text-secondary-200)"}
          />
        {/if}
      </button>
    </div>

    <div class="controller-btn">
      <button
        on:click={onClose}
        on:mouseenter={() => handleMouseEnter("close")}
        on:mouseleave={handleMouseLeave}
        class="custom-header-button button-close border-0 py-1 px-1"
      >
        <DismissRegular
        size={"16px"}
        color={hoveredButton === "close"
            ? "white"
            : "var(--text-secondary-200)"}/>
      </button>
    </div>
  </div>
{:else}
  <!-- Mac Style Buttons -->
  <div class="d-flex mac-container me-2" class:notivisible={isFullscreen}>
    <div class="d-flex">
      <div on:click={onClose} class="mac-nav">
        <div class="icon">
          <CrossIconV2 height={"6"} width={"6"} color={"#285F17"} />
        </div>
      </div>
      <div on:click={onMinimize} class="mac-nav">
        <div class="icon">
          <MiniMizeIcon height={"6"} width={"6"} color={"black"} />
        </div>
      </div>
      <div on:click={toggleSize} id="resize-button" class="mac-nav">
        <div class="icon">
          <ExpandIcon height={"6"} width={"6"} color={"#285F17"} />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .notivisible {
    opacity: 0 !important;
    height: 20px !important;
    background-color: red;
  }
  .mac-nav .icon {
    display: none; /* Hide the icons by default */
    margin-bottom: 1px;
  }
  .mac-container:hover .icon {
    display: block; /* Show the icon when the container is hovered */
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mac-nav {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center !important;
    justify-content: center !important;
  }

  .mac-nav:nth-child(1) {
    background-color: #ec6a5e;
  }

  .mac-nav:nth-child(2) {
    background-color: #f5be4f;
    margin: 0 10px;
  }

  .mac-nav:nth-child(3) {
    background-color: #62c554;
    margin-left: 1pxz;
  }

  .custom-header-button {
    background-color: transparent;
    color: var(--text-primary-300);
    cursor: pointer;
  }

  .d-flex {
    display: flex;
    align-items: center;
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
    background-color: #e81123;
  }

  .controller-btn button {
    height: 42px;
    width: 42px;
  }
</style>
