<script lang="ts">
  import { Select } from "@sparrow/library/forms";

  import { getCurrentWindow } from "@tauri-apps/api/window";

  import { SparrowIcon } from "@sparrow/library/icons";

  import { onMount } from "svelte";
  import CustomHeader from "../header/custom-header-button/CustomHeader.svelte";
  import { OSDetector } from "../../utils";

  let isMaximizeWindow: boolean = true;

  const appWindow = getCurrentWindow();

  let titlebar; // Reference to the title bar element

  function handleMouseDown(e: MouseEvent) {
    // Check if the target or any parent element matches the exclusion criteria
    if (
      e.buttons === 1 &&
      !e.target.closest(".no-drag") // Prevent dragging for elements with the "no-drag" class
    ) {
      if (e.detail === 2) {
        isMaximizeWindow = !isMaximizeWindow;
        appWindow.toggleMaximize(); // Maximize on double click
      } else {
        appWindow.startDragging(); // Start dragging on single click
        isMaximizeWindow = false;
      }
    }
  }

  let isWindows = false;
  let os = "";
  const osDetector = new OSDetector();
  onMount(() => {
    os = osDetector.getOS();
    if (os === "windows") {
      isWindows = true;
    }
  });
</script>

<header
  id="titlebar"
  class="titlebar app-header ps-1 d-flex align-items-center justify-content-between gap-5"
  on:mousedown={handleMouseDown}
>
  <div class="d-flex ms-3 justify-content-cdenter align-items-center no-drag">
    {#if !isWindows}
      <CustomHeader  {isWindows} />
    {/if}

    <div>
      <SparrowIcon
        height="17px"
        width="17px"
        color="var(--primary-btn-color)"
      />
    </div>
  </div>

  <div class="d-flex align-items-center no-drag" style="position: relative;">
    {#if isWindows}
      <div class="d-flex gap-3 ms-4 me-1 no-drag">
        <CustomHeader bind:isMaximizeWindow isWindows={true} />
      </div>
    {/if}
  </div>
</header>

<style>
  header {
    height: 44px;
    background-color: var(--bg-secondary-850);
  }

  .app-header {
    border-bottom: 2px solid var(--border-secondary-900);
  }
</style>
