<script lang="ts">
  import { ComboText } from "@sparrow/workspaces/components";
  import { platform } from "@tauri-apps/plugin-os";
  import { onMount } from "svelte";
  import { SparrowLogo } from "@sparrow/common/images";
  export let isMainScreen = false;
  let ctrlCommands: { [key: string]: string } = {};
  let altCommands: { [key: string]: string } = {};
  onMount(async () => {
    const platformName = await platform();
    let controlKey = platformName === "macos" ? "cmd" : "ctrl";
    let altKey = platformName === "macos" ? "option" : "alt";
    ctrlCommands = {
      "Send Request": [controlKey, "Enter"],
      "New Request": [controlKey, "N"],
      "Save Request": [controlKey, "S"],
    };

    altCommands = {
      "Edit link": [altKey, "L"],
      "Add Parameter": [altKey, "P"],
      "Add Header": [altKey, "H"],
      "Edit Body": [altKey, "B"],
    };
  });
  let isExpandShortcuts = false;
</script>

<div
  class="{isMainScreen
    ? 'pt-5 pb-3'
    : ''} response-default h-100 d-flex flex-column justify-content-between align-items-center default-screen-scroller"
>
  <div class="">
    <div class="d-flex align-items-center flex-column justify-content-center">
      <div class="my-4">
        <SparrowLogo />
      </div>
      <div class="d-flex flex-column align-items-center">
        <p class="text-secondary-200 fw-bold text-fs-14 mb-5">
          Click Send to get a Response
        </p>
      </div>
    </div>
  </div>
  <div class={"d-flex flex-wrap justify-content-center mt-auto"}>
    {#each Object.entries(ctrlCommands) as [key, value]}
      {#if key === "Save Request" || key === "New Request" || isExpandShortcuts}
        <!-- <span class="me-3"></span> -->
        <div class="px-">
          <ComboText {key} {value} type="combo" bind:isExpandShortcuts />
        </div>
        <!-- <span class="me-3"></span> -->
      {/if}
    {/each}
    {#each Object.entries(altCommands) as [key, value]}
      {#if key === "Edit link" || key === "Add Parameter" || isExpandShortcuts}
        <!-- <span class="me-3"></span> -->
        <div class="px-4">
          <ComboText {key} {value} type="combo" bind:isExpandShortcuts />
        </div>
        <!-- <span class="me-3"></span> -->
      {/if}
    {/each}
  </div>
  {#if !isExpandShortcuts}
    <div class="d-flex justify-content-center">
      <p
        class="text-primary-200 text-fs-12 cursor-pointer"
        on:click={() => {
          isExpandShortcuts = true;
        }}
      >
        See All Shortcuts
      </p>
    </div>
  {:else}
    <div class="d-flex justify-content-center">
      <p
        class="text-primary-200 text-fs-12 cursor-pointer"
        on:click={() => {
          isExpandShortcuts = false;
        }}
      >
        Hide All Shortcuts
      </p>
    </div>
  {/if}
</div>

<style>
  .cursor-pointer {
    cursor: pointer;
  }

  .default-screen-scroller {
    overflow-y: hidden;
    transition: overflow 0.3s ease-in-out;
    padding-right: 10px;
  }

  .default-screen-scroller:hover {
    padding-right: 0;
    overflow-y: auto;
  }
</style>
