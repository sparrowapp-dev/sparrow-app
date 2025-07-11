<script lang="ts">
  import { ComboText } from "@sparrow/workspaces/components";
  import { onMount } from "svelte";
  import { SparrowLogo } from "@sparrow/common/images";
  import { OSDetector } from "@sparrow/common/utils";
  import { Button } from "@sparrow/library/ui";

  export let isMainScreen = false;
  export let isWebApp;
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
      ...(!isWebApp ? { "New Request": [`${controlKey}`, "N"] } : {}),
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
        <p class="text-fs-12 mb-5" style="color: var(--text-ds-neutral-400);">
          Click Send To Get A Response
        </p>
      </div>
    </div>
  </div>
  <div>
    <div class={"d-flex flex-wrap justify-content-center mt-auto"}>
      {#each Object.entries(ctrlCommands) as [key, value]}
        {#if key === "Save Request" || key === "New Request" || isExpandShortcuts}
          <!-- <span class="me-3"></span> -->
          <div class="px-3 flex items-center">
            <ComboText {key} {value} type="combo" bind:isExpandShortcuts />
          </div>
        {/if}
      {/each}
      {#each Object.entries(altCommands) as [key, value]}
        {#if key === "Edit link" || key === "Add Parameter" || isExpandShortcuts}
          <!-- <span class="me-3"></span> -->
          <div class="px-3">
            <ComboText {key} {value} type="combo" bind:isExpandShortcuts />
          </div>
          <!-- <span class="me-3"></span> -->
        {/if}
      {/each}
    </div>
    {#if !isExpandShortcuts}
      <div class="d-flex justify-content-center mt-2">
        <Button
          type="outline-secondary"
          title="See All Shortcuts"
          onClick={() => {
            isExpandShortcuts = true;
          }}
          size="medium"
        />
      </div>
    {:else}
      <div class="d-flex justify-content-center mt-2">
        <Button
          type="outline-secondary"
          title="Hide All Shortcuts"
          onClick={() => {
            isExpandShortcuts = false;
          }}
          size="medium"
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .cursor-pointer {
    cursor: pointer;
  }
</style>
