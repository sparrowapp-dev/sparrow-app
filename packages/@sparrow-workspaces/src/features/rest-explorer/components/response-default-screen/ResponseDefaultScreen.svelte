<script lang="ts">
  import { ComboText } from "@sparrow/workspaces/components";
  import { onMount } from "svelte";
  import { SparrowLogo } from "@sparrow/common/images";
  import { OSDetector } from "@sparrow/common/utils";
  import { KeyboardShortcuts } from "@sparrow/library/ui";

  export let isMainScreen = false;
  let platformName = "";

  let ctrlCommands: { [key: string]: string } = {};
  let altCommands: { [key: string]: string } = {};

  const osDetector = new OSDetector();

  onMount(async () => {
    platformName = osDetector.getOS();

    const controlKey = platformName === "macos" ? "cmd" : "Ctrl";
    const altKey = platformName === "macos" ? "option" : "Alt";

 ctrlCommands = {
  "Send Request": [`${controlKey}`, "Enter"],
  "New Request": [`${controlKey}`, "N"],
  "Save Request": [`${controlKey}`, "S"],
};

altCommands = {
  "Edit link": [`${altKey}`, "L"],
  "Add Parameter": [`${altKey}`, "P"],
  "Add Header": [`${altKey}`, "H"],
  "Edit Body": [`${altKey}`, "B"],
};

  });
  let isExpandShortcuts = false;
</script>

<div
  class="{isMainScreen
    ? 'pt-5 pb-3'
    : ''} response-default h-100 d-flex flex-column justify-content-between align-items-center"
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
        <div class="px-4">
          <ComboText
            comboContainerClassProp={"d-flex align-items-center justify-content-between gap-2 mb-3"}
            {key}
            {value}
            keyClassProp={"text-secondary-200"}
            keyStyleProp={"width: 100px;"}
            type="combo"
          />
        </div>
      {/if}
    {/each}
    {#each Object.entries(altCommands) as [key, value]}
      {#if key === "Edit link" || key === "Add Parameter" || isExpandShortcuts}
        <!-- <span class="me-3"></span> -->
        <div class="px-4">
          <ComboText
            comboContainerClassProp={"d-flex align-items-center justify-content-between gap-1 mb-3"}
            {key}
            {value}
            keyClassProp={"text-secondary-200"}
            keyStyleProp={"width: 100px;"}
            type="combo"
          />
        </div>
        <!-- <span class="me-3"></span> -->
      {/if}
    {/each}
  </div>
  {#if !isExpandShortcuts}
    <div class="d-flex justify-content-center pt-3">
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
    <div class="d-flex justify-content-center pt-3">
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
</style>
