<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let targetId: string = "";

  let targetElement: HTMLElement | null = null;
  let containerTopX = 0;
  let containerLeftX = 0;
  let containerHeight = 0;
  let containerWidth = 0;

  const updatePosition = () => {
    if (targetId) {
      targetElement = document.getElementById(targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        containerTopX = rect.top + window.scrollY;
        containerLeftX = rect.left + window.scrollX;
        containerHeight = rect.height;
        containerWidth = rect.width;

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
      } else {
        console.error(`Element with ID "${targetId}" not found.`);
      }
    }
  };

  onMount(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
  });

  $: if (targetId) {
    updatePosition();
  }

  onDestroy(() => {
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition);
  });
</script>

<div class="mainComponent"></div>
<!-- Overlays for each direction -->
<div class="overlay-top"></div>
<div class="overlay-left"></div>
<div class="overlay-right"></div>
<div class="overlay-bottom"></div>

<style>
  /* Main overlay component */
  .mainComponent {
    position: fixed;
    top: 0;
    left: 0;
    background-color: transparent;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }

  /* Overlay sections */
  .overlay-top {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: var(--containerTopX);
    background: rgba(0, 0, 0, 0.65);
    z-index: 10000;
  }

  .overlay-left {
    position: fixed;
    top: var(--containerTopX);
    left: 0;
    width: var(--containerLeftX);
    height: var(--containerHeight);
    background: rgba(0, 0, 0, 0.65);
    z-index: 10000;
  }

  .overlay-right {
    position: fixed;
    top: var(--containerTopX);
    left: calc(var(--containerLeftX) + var(--containerWidth));
    width: calc(100vw - var(--containerLeftX) - var(--containerWidth));
    height: var(--containerHeight);
    background: rgba(0, 0, 0, 0.65);
    z-index: 10000;
  }

  .overlay-bottom {
    position: fixed;
    top: calc(var(--containerTopX) + var(--containerHeight));
    left: 0;
    width: 100vw;
    height: calc(100vh - var(--containerTopX) - var(--containerHeight));
    background: rgba(0, 0, 0, 0.65);
    z-index: 10000;
  }
</style>
