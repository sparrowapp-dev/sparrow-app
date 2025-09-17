<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let targetId: string = "";
  export let isVisible: boolean = false;
  export let cardPosition: {
    top: number;
    left?: number;
    right?: number;
    placement?: "left" | "right";
  } = { top: 0, left: 0 };

  let targetElement: HTMLElement | null = null;
  let containerTopX = 0;
  let containerLeftX = 0;
  let containerWidth = 0;
  let containerHeight = 0;
  let mounted = false;

  function updateTargetPosition() {
    if (!targetId || !mounted || !isVisible) return;

    targetElement = document.getElementById(targetId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      containerTopX = rect.top + window.scrollY;
      containerLeftX = rect.left + window.scrollX;
      containerWidth = rect.width;
      containerHeight = rect.height;

      // update CSS variables for overlays
      document.documentElement.style.setProperty(
        "--containerTopX",
        `${containerTopX}px`,
      );
      document.documentElement.style.setProperty(
        "--containerLeftX",
        `${containerLeftX}px`,
      );
      document.documentElement.style.setProperty(
        "--containerWidth",
        `${containerWidth}px`,
      );
      document.documentElement.style.setProperty(
        "--containerHeight",
        `${containerHeight}px`,
      );

      // Ensure target element is above overlay but below blocker
      targetElement.style.position = "relative";
      targetElement.style.zIndex = "10000"; // Changed from 10001
    } else {
      console.warn(`Target element with ID "${targetId}" not found`);
    }
  }

  function handleResize() {
    updateTargetPosition();
  }

  function handleScroll() {
    updateTargetPosition();
  }

  onMount(() => {
    mounted = true;
    if (isVisible) {
      updateTargetPosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll);
    }
  });

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("scroll", handleScroll);

    if (targetElement) {
      targetElement.style.position = "";
      targetElement.style.zIndex = "";
    }
  });

  $: if (mounted && isVisible) {
    updateTargetPosition();
  }

  $: if (!isVisible && targetElement) {
    targetElement.style.position = "";
    targetElement.style.zIndex = "";
  }
</script>

{#if isVisible && mounted}
  <div class="overlay-root"></div>
  <div class="overlay-top"></div>
  <div class="overlay-left"></div>
  <div class="overlay-right"></div>
  <div class="overlay-bottom"></div>

  {#if targetElement}
    <div
      class="overlay-target-blocker"
      style="
        top: {containerTopX}px;
        left: {containerLeftX}px;
        width: {containerWidth}px;
        height: {containerHeight}px;
      "
    ></div>
  {/if}

  <!-- Tour Card Container -->
  <div
    class="tour-card-wrapper"
    style="
      top: {cardPosition.top}px;
      {cardPosition.placement === 'right'
      ? `right: ${cardPosition.right || 0}px; left: auto;`
      : `left: ${cardPosition.left}px; right: auto;`}
    "
  >
    <slot />
  </div>
{/if}

<style>
  .overlay-root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: transparent;
    z-index: 9999;
    pointer-events: none;
  }

  .overlay-top,
  .overlay-left,
  .overlay-right,
  .overlay-bottom {
    position: fixed;
    background: rgba(0, 0, 0, 0.75);
    z-index: 10000;
  }

  .overlay-top {
    top: 0;
    left: 0;
    width: 100vw;
    height: var(--containerTopX);
  }

  .overlay-left {
    top: var(--containerTopX);
    left: 0;
    width: var(--containerLeftX);
    height: var(--containerHeight);
  }

  .overlay-right {
    top: var(--containerTopX);
    left: calc(var(--containerLeftX) + var(--containerWidth));
    width: calc(100vw - var(--containerLeftX) - var(--containerWidth));
    height: var(--containerHeight);
  }

  .overlay-bottom {
    top: calc(var(--containerTopX) + var(--containerHeight));
    left: 0;
    width: 100vw;
    height: calc(100vh - var(--containerTopX) - var(--containerHeight));
  }

  /* Blocker directly over the target element */
  .overlay-target-blocker {
    position: fixed;
    background: transparent;
    z-index: 10001;
    pointer-events: auto;
  }

  .tour-card-wrapper {
    position: absolute;
    z-index: 10002;
    pointer-events: auto;
  }
</style>
