<script lang="ts">
  import { Select } from "@sparrow/library/forms";

  import { getCurrentWindow } from "@tauri-apps/api/window";

  import { SparrowIcon } from "@sparrow/library/icons";

  import { onMount } from "svelte";
  import { OSDetector } from "../../utils";
  import WindowAction from "../header/window-action/WindowAction.svelte";
  import { Platform } from "../../enums";

  let isWindows = false;
  let os = "";
  const osDetector = new OSDetector();
  onMount(() => {
    os = osDetector.getOS();
    if (os === Platform.WINDOWS) {
      isWindows = true;
    }
  });

  const appWindow = getCurrentWindow();

  let titlebar;

  function handleMouseDown(e: MouseEvent) {
    if (e.buttons === 1 && !e.target.closest(".no-drag")) {
      if (e.detail === 2) {
        appWindow.toggleMaximize();
      } else {
        appWindow.startDragging();
      }
    }
  }
</script>

<header
  data-tauri-drag-region
  bind:this={titlebar}
  id="titlebar"
  class="titlebar app-header ps-1 d-flex align-items-center justify-content-between gap-5"
  on:mousedown={handleMouseDown}
>
  <div class="d-flex ms-3 justify-content-cdenter align-items-center no-drag">
    {#if os === "macos"}
      <WindowAction platform={Platform.MACOS} />
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
    {#if os === "linux" || os === "windows"}
      <div class="d-flex gap-3 ms-4 no-drag">
        <WindowAction platform={Platform.WINDOWS} />
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
