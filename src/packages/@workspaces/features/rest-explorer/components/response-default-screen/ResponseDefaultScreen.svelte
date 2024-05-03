<script lang="ts">
  import ComboText from "$lib/components/text/ComboText.svelte";
  import { isHorizontal } from "$lib/store/request-response-section";
  import { restSplitterDirection } from "@workspaces/features/rest-explorer/store";
  import { platform } from "@tauri-apps/plugin-os";
  import { onMount } from "svelte";
  import { SparrowLogo } from "../../assets/images";
  let isHorizontalMode: boolean;
  isHorizontal.subscribe((value) => (isHorizontalMode = value));
  let ctrlCommands: { [key: string]: string } = {};
  let altCommands: { [key: string]: string } = {};
  onMount(async () => {
    const platformName = await platform();
    let controlKey = platformName === "macos" ? "cmd" : "ctrl";
    let altKey = platformName === "macos" ? "option" : "alt";
    ctrlCommands = {
      "Send Request": controlKey + " + Enter",
      "Save Request": controlKey + " + S",
      "New Request": controlKey + " + N",
    };
    altCommands = {
      "Edit link": altKey + " + L",
      "Add Parameter": altKey + " + P",
      "Add Header": altKey + " + H",
      "Edit Body": altKey + " + B",
    };
  });
  let isExpandShortcuts = false;
</script>

<div class="response-default h-100 d-flex flex-column justify-between">
  <div class="">
    <div class="d-flex align-items-center flex-column justify-content-center">
      <div class="my-4">
        <SparrowLogo />
      </div>
      <div class="d-flex flex-column align-items-center">
        <p class="text-secondary-200 text-fs-14">
          Click Send to get a Response
        </p>
      </div>
    </div>
  </div>
  <div class={"d-flex flex-wrap justify-content-center px-5 mt-auto"}>
    {#each Object.entries(ctrlCommands) as [key, value]}
      {#if key === "Save Request" || key === "New Request" || isExpandShortcuts}
        <span class="me-3"></span>
        <ComboText
          comboContainerClassProp={"d-flex align-items-center justify-content-between gap-3 mb-3"}
          {key}
          {value}
          keyClassProp={"text-secondary-200"}
          valueClassProp={"bg-primary-400 text-secondary-100"}
          valueStyleProp="font-family: Roboto Mono; font-weight: 600;"
          type="combo"
        />
        <span class="me-3"></span>
      {/if}
    {/each}
    {#each Object.entries(altCommands) as [key, value]}
      {#if key === "Edit link" || key === "Add Parameter" || isExpandShortcuts}
        <span class="me-3"></span>
        <ComboText
          comboContainerClassProp={"d-flex align-items-center justify-content-between gap-3 mb-3"}
          {key}
          {value}
          keyClassProp={"text-secondary-200"}
          valueClassProp={"bg-primary-400 text-secondary-100 px-2"}
          valueStyleProp="font-family: Roboto Mono; font-weight: 600;"
          type="combo"
        />
        <span class="me-3"></span>
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
  {/if}
</div>

<style>
  .response-default {
    overflow-y: auto;
    overflow-x: hidden;
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>
