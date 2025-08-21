<script lang="ts">
  import { ComboText } from "@sparrow/workspaces/components";
  import { onMount } from "svelte";
  import { SparrowLogo } from "@sparrow/common/images";
  import { OSDetector } from "@sparrow/common/utils";
  import { Button } from "@sparrow/library/ui";
  import { fly } from "svelte/transition";

  export let isMainScreen = false;
  export let isWebApp;
  let platformName = "";

  let ctrlCommands: { [key: string]: string } = {};
  let altCommands: { [key: string]: string } = {};

  const osDetector = new OSDetector();

  const slowCurve = (t: number) => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Animation state management
  let animatingElements = new Set();

  const animateExistingShortcuts = (expanding) => {
    const existingShortcuts = document.querySelectorAll(".existing-shortcut");
    existingShortcuts.forEach((element, index) => {
      const delay = expanding
        ? index * 30
        : (existingShortcuts.length - 1 - index) * 30;
      const targetX = expanding ? -25 : 0;

      setTimeout(() => {
        element.style.transform = `translateX(${targetX}px)`;
      }, delay);
    });
  };

  $: if (typeof window !== "undefined") {
    setTimeout(() => animateExistingShortcuts(isExpandShortcuts), 0);
  }

  onMount(async () => {
    platformName = osDetector.getOS();

    const controlKey = platformName === "macos" ? "cmd" : "Ctrl";
    const altKey = platformName === "macos" ? "option" : "Alt";

    ctrlCommands = {
      "Save Request": [`${controlKey}`, "S"],
      ...(!isWebApp ? { "New Request": [`${controlKey}`, "N"] } : {}),
      "Send Request": [`${controlKey}`, "Enter"],
    };

    altCommands = {
      "Add Parameter": [`${altKey}`, "P"],
      "Edit link": [`${altKey}`, "L"],
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
    <div
      class="shortcuts-container d-flex flex-wrap justify-content-center mt-auto"
    >
      {#each Object.entries(ctrlCommands) as [key, value], index}
        {#if key === "Save Request" || key === "New Request" || key === "Send Request"}
          <div
            class="px-3 flex items-center shortcut-item existing-shortcut"
            data-index={index}
          >
            <ComboText {key} {value} type="combo" bind:isExpandShortcuts />
          </div>
        {/if}
      {/each}

      <div class="px-3 shortcut-item existing-shortcut" data-index="3">
        <ComboText
          key="Add Parameter"
          value={altCommands["Add Parameter"]}
          type="combo"
          bind:isExpandShortcuts
        />
      </div>

      {#each Object.entries(altCommands) as [key, value], index}
        {#if key !== "Add Parameter"}
          {#if isExpandShortcuts}
            <div
              class="px-3 shortcut-item new-shortcut"
              in:fly={{
                x: 80,
                duration: 500,
                delay: 150 + index * 100,
                easing: slowCurve,
              }}
              out:fly={{
                x: 80,
                duration: 400,
                delay: (2 - index) * 60,
                easing: slowCurve,
              }}
            >
              <ComboText {key} {value} type="combo" bind:isExpandShortcuts />
            </div>
          {/if}
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

  .shortcuts-container {
    position: relative;
    overflow: visible;
  }

  .existing-shortcut {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(0);
    will-change: transform;
  }

  .new-shortcut {
    will-change: transform;
  }

  /* Ensure smooth transitions without conflicts */
  .shortcut-item {
    position: relative;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
  }
</style>
