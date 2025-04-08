<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Button } from "@sparrow/library/ui";

  export let TitleName: string = "";
  export let DescriptionContent: string = "";
  export let CardNumber: number = 0;
  export let TotalsCards: number = 0;
  export let tipPosition: string = "right-center";
  export let additionLeftValue: number = 0;
  export let additionTopValue: number = 0;
  export let targetId: string = "";
  export let rightButtonName: string = "";
  export let onNext: () => void = () => {};
  export let onClose: () => void = () => {};

  let targetElement: HTMLElement | null = null;
  let top = 0;
  let left = 0;
  let containerTopX = 0;
  let containerLeftX = 0;
  let containerHeight = 0;
  let containerWidth = 0;

  function handleClose() {
    onClose();
  }

  function handleNext(event: Event) {
    event.stopPropagation();
    onNext();
  }

  function updatePosition() {
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

        switch (tipPosition) {
          case "right-center":
            top = rect.top + rect.height / 3 - 20 + additionTopValue;
            left = rect.left + rect.width + 20 + additionLeftValue;
            break;
          case "left-center":
            top = rect.top + rect.height / 2 - 20 + additionTopValue;
            left = rect.left - additionLeftValue;
            break;
          case "top-center":
            top = rect.top - 50 + additionTopValue;
            left = rect.left + rect.width / 2 - 100 + additionLeftValue;
            break;
          case "bottom-center":
            top = rect.top + rect.height + 10 + additionTopValue;
            left = rect.left + rect.width / 2 - 100 + additionLeftValue;
            break;
          default:
            top = rect.top + rect.height / 2;
            left = rect.right + 10;
        }
      } else {
        console.error(`Element with ID "${targetId}" not found.`);
      }
    }
  }

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

<!-- Tour Tooltip -->
<div class="tour-container" style="top: {top}px; left: {left}px;">
  <div class="py-1 px-2">
    <div class="title-name-text">{TitleName}</div>
    <div class="description-content-text">{DescriptionContent}</div>
  </div>
  <div
    class={`d-flex ${
      rightButtonName === ""
        ? "justify-content-between"
        : CardNumber > 0
          ? "justify-content-between"
          : "justify-content-end"
    } px-2`}
  >
    <div class="d-flex justify-content-center align-items-center">
      <p class="guide-card-text" style="margin: 0px;">
        {#if rightButtonName === "" || CardNumber > 0}
          {CardNumber}/{TotalsCards}
        {/if}
      </p>
    </div>
    <div class="d-flex justify-content-center align-items-center gap-1">
      {#if rightButtonName === ""}
        <Button
          type="outline-secondary"
          size="small"
          title="Dismiss"
          onClick={handleClose}
        />
      {/if}
      <Button
        type="primary"
        size="small"
        title={rightButtonName !== "" ? rightButtonName : "Next"}
        onClick={handleNext}
      />
    </div>
  </div>
</div>

<style>
  /* Overlay */
  .mainComponent {
    position: fixed;
    top: 0;
    left: 0;
    background-color: transparent;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }
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

  /* Tooltip */
  .tour-container {
    position: fixed;
    background-color: var(--bg-ds-surface-500);
    width: 352px;
    border-radius: 8px;
    padding: 12px;
    z-index: 100000;
  }

  .title-name-text {
    color: var(--text-ds-neutral-50);
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    text-align: left;
  }

  .description-content-text {
    color: var(--text-ds-neutral-300);
    font-weight: 400;
    font-size: 12px;
    text-align: left;
  }

  .guide-card-text {
    color: var(--text-ds-neutral-300);
    font-weight: 400;
    font-size: 12px;
  }
</style>
