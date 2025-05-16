<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Button } from "@sparrow/library/ui";

  export let targetIds: string[] = [];
  export let title = "";
  export let description = "";
  export let additionLeftValue = 0;
  export let additionTopValue = 0;
  export let additionWidthValue = 0;
  export let additionHeightValue = 0;
  export let onNext: () => void;
  export let onClose: () => void;
  export let rightButtonName = "Close";
  export let CardNumber = 0;
  export let totalCards = 7;
  export let isLastStep = false;
  export let shouldDelay = false;

  let top = 0;
  let left = 0;

  let containerTopX = 0;
  let containerLeftX = 0;
  let containerWidth = 0;
  let containerHeight = 0;

  function handleClose(): void {
    onClose?.();
  }

  function handleNext(event: MouseEvent): void {
    event.stopPropagation();
    onNext?.();
  }

  function updatePosition(): void {
    if (!targetIds.length) return;

    const rects = targetIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((el) => el!.getBoundingClientRect());

    if (!rects.length) return;

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const topValues = rects.map((r) => r.top + scrollY);
    const leftValues = rects.map((r) => r.left + scrollX);
    const rightValues = rects.map((r) => r.right + scrollX);
    const bottomValues = rects.map((r) => r.bottom + scrollY);

    const minTop = Math.min(...topValues);
    const minLeft = Math.min(...leftValues);
    const maxRight = Math.max(...rightValues);
    const maxBottom = Math.max(...bottomValues);

    containerTopX = minTop;
    containerLeftX = minLeft;
    containerWidth = maxRight - minLeft;
    containerHeight = maxBottom - minTop;

    document.documentElement.style.setProperty(
      "--containerTopX",
      `${containerTopX + additionTopValue}px`,
    );
    document.documentElement.style.setProperty(
      "--containerLeftX",
      `${containerLeftX + additionLeftValue}px`,
    );
    document.documentElement.style.setProperty(
      "--containerWidth",
      `${containerWidth + additionWidthValue}px`,
    );
    document.documentElement.style.setProperty(
      "--containerHeight",
      `${containerHeight + additionHeightValue}px`,
    );

    top = containerTopX + additionTopValue;
    left = containerLeftX + additionLeftValue;
  }

  onMount(() => {
    shouldDelay ? setTimeout(updatePosition, 100) : updatePosition();
    window.addEventListener("resize", updatePosition);
  });

  onDestroy(() => {
    window.removeEventListener("resize", updatePosition);
  });
</script>

<!-- Overlay elements -->
<div class="overlay"></div>
<div class="overlay-top"></div>
<div class="overlay-left"></div>
<div class="overlay-right"></div>
<div class="overlay-bottom"></div>

<!-- Main tour container -->
<div class="tour-container">
  <div class="py-1 px-2">
    <div class="title-name-text">{title}</div>
    <div class="description-content-text">{description}</div>
  </div>

  <div
    class={`d-flex ${
      rightButtonName === "" || CardNumber > 0
        ? "justify-content-between"
        : "justify-content-end"
    } px-2`}
    style="margin-top: 8px;"
  >
    <div class="d-flex justify-content-center align-items-center">
      {#if rightButtonName === "" || CardNumber > 0}
        <p class="guide-card-text" style="margin: 0;">
          {CardNumber}/{totalCards}
        </p>
      {/if}
    </div>

    <div class="d-flex justify-content-center align-items-center gap-1">
      {#if !isLastStep}
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
        title={isLastStep ? rightButtonName : "Next"}
        onClick={handleNext}
      />
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100000;
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
