<script lang="ts">
  import ComboText from "$lib/components/text/ComboText.svelte";
  import { isHorizontal } from "$lib/store/request-response-section";
  import { platform } from "@tauri-apps/plugin-os";
  import { onMount } from "svelte";
  import { SparrowLogo } from "@common/images";
  export let isMainScreen = false;
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
      "New Request": controlKey + " + N",
      "Save Request": controlKey + " + S",
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
          Make a connection to send and get messages.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .cursor-pointer {
    cursor: pointer;
  }
</style>
