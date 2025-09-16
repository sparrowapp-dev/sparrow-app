<script lang="ts">
  import { ComboText } from "@sparrow/workspaces/components";
  import { onDestroy, onMount } from "svelte";
  import { SparrowLogo } from "@sparrow/common/images";
  import { OSDetector } from "@sparrow/common/utils";
  import { Button } from "@sparrow/library/ui";
  import { fly } from "svelte/transition";
  import { requestTabTestDemo } from "../../../../stores";
  import { requestTabTestScriptDemo } from "../../../../stores";
  import ResponseNavigator from "../response-navigator/ResponseNavigator.svelte";

  export let isMainScreen = false;
  export let isWebApp;
  let platformName = "";

  let ctrlCommands: { [key: string]: string } = {};
  let altCommands: { [key: string]: string } = {};
  let shortcutEl: HTMLDivElement | null = null;
  let originalWidth = 0;
  const osDetector = new OSDetector();

  const slowCurve = (t: number) => {
    return 1 - Math.pow(1 - t, 3);
  };

  const animateExistingShortcuts = (expanding) => {
    const existingShortcuts = document.querySelectorAll(".existing-shortcut");
    existingShortcuts.forEach((element, index) => {
      const delay = expanding
        ? 0
        : isUpAnimation
          ? 100
          : (existingShortcuts.length - 1 - index) * 100;

      // Use y animation when isUpAnimation is true, x animation otherwise
      const targetX = expanding ? (isUpAnimation ? 0 : -20) : 0;
      const targetY = expanding ? (isUpAnimation ? -20 : 0) : 0;

      setTimeout(() => {
        if (isUpAnimation) {
          element.style.transform = `translateY(${targetY}px)`;
        } else {
          element.style.transform = `translateX(${targetX}px)`;
        }
      }, delay);
    });
  };

  $: if (typeof window !== "undefined") {
    setTimeout(() => animateExistingShortcuts(isExpandShortcuts), 0);
  }
  let width = 0;
  let isUpAnimation = false;
  let observer: ResizeObserver;
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
    if (shortcutEl) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          width = entry.contentRect.width;
        }
      });
      observer.observe(shortcutEl);
    }
  });
  onDestroy(() => {
    observer?.disconnect();
  });
  let isExpandShortcuts = false;
  $: isUpAnimation = width < 932;
</script>

<div
  bind:this={shortcutEl}
  class="{isMainScreen
    ? 'pt-5 pb-3'
    : ''} response-default h-100 d-flex flex-column"
>
  <!-- ResponseNavigator positioned at top-left when requestTabTestDemo is true -->
  {#if $requestTabTestDemo || $requestTabTestScriptDemo}
    <div class="d-flex justify-content-start">
      <ResponseNavigator
        requestStateSection={"TESTRESULT"}
        onUpdateResponseState={() => {}}
        responseHeadersLength={2}
      />
    </div>
  {/if}

  <!-- Main content area - centered vertically and horizontally -->
  <div
    class="flex-grow-1 d-flex flex-column justify-content-center align-items-center"
  >
    <div class="d-flex align-items-center flex-column justify-content-center">
      <div class="my-4">
        <SparrowLogo />
      </div>
      <div class="d-flex flex-column align-items-center">
        <p class="text-fs-12 mb-5" style="color: var(--text-ds-neutral-400);">
          {#if !$requestTabTestDemo}
            Click Send To Get A Response
          {:else}
            No test cases available. Start by adding your own test cases, select
            from smart suggestions or generate them with AI.
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Shortcuts section at bottom -->
  <div class="mt-auto">
    <div
      class="shortcuts-container d-flex flex-wrap justify-content-center"
      style={isUpAnimation ? "max-width: 600px;" : ""}
      bind:this={shortcutEl}
    >
      {#each Object.entries(ctrlCommands) as [key, value], index}
        {#if key === "Save Request" || key === "New Request" || key === "Send Request"}
          <div
            class="px-3 flex items-center shortcut-item existing-shortcut {isUpAnimation
              ? 'up-animation'
              : ''}"
            data-index={index}
          >
            <ComboText {key} {value} type="combo" bind:isExpandShortcuts />
          </div>
        {/if}
      {/each}

      <div
        class="px-3 shortcut-item existing-shortcut {isUpAnimation
          ? 'up-animation'
          : ''}"
        data-index="3"
      >
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
                ...(isUpAnimation ? { y: 80 } : { x: 80 }),
                duration: 500,
                easing: slowCurve,
              }}
              out:fly={{
                ...(isUpAnimation ? { y: 80 } : { x: 80 }),
                duration: 400,
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

  .existing-shortcut.up-animation {
    transform: translateY(0);
  }

  .new-shortcut {
    will-change: transform;
  }

  .shortcut-item {
    position: relative;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
  }
</style>
