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
</script>

<div class="response-default">
  <div class="">
    <div class="d-flex align-items-center flex-column justify-content-center">
      <div class="my-4">
        <SparrowLogo />
      </div>
      <div><p>Click send to get a Response</p></div>
    </div>
  </div>
  <div class={"d-flex flex-wrap justify-content-center"}>
    {#each Object.entries(ctrlCommands) as [key, value]}
      {#if key === "Save Request" || key === "New Request"}
        <span class="me-3"></span>
        <ComboText
          comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
          {key}
          {value}
          type="combo"
        />
        <span class="me-3"></span>
      {/if}
    {/each}
    {#each Object.entries(altCommands) as [key, value]}
      {#if key === "Edit link" || key === "Add Parameter"}
        <span class="me-3"></span>
        <ComboText
          comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
          {key}
          {value}
          type="combo"
        />
        <span class="me-5"></span>
      {/if}
    {/each}
  </div>
</div>

<style>
  .response-default {
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
