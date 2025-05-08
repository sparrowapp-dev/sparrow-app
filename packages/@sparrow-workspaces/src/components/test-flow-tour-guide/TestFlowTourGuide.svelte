<script>
  import { CrossIcon } from "@sparrow/library/assets";
  import { onMount, onDestroy } from "svelte";
  import { PulseCircle } from "@sparrow/common/components";
  import { Button } from "@sparrow/library/ui";

  export let pulsePosition = { top: "0px", left: "0px" };
  export let targetId;
  export let title = "";
  export let stepCount = "";
  export let description = "";
  export let tipPosition = "top-left";
  export let onNext;
  export let onClose;
  export let isPuleCircleRequired = true;
  export let isLastStep = false;

  let containerTopX = 0;
  let containerLeftX = 0;
  let containerHeight = 0;
  let containerWidth = 0;

  let top = 0;
  let left = 0;
  let targetElement;

  function handleClose() {
    if (onClose) onClose();
  }

  function handleNext(event) {
    event.stopPropagation();
    if (onNext) onNext();
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
      }
    }
  }

  onMount(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
  });

  onDestroy(() => {
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition);
  });
</script>

<!-- Overlay to block user interaction -->
<div class="overlay"></div>
<div class="overlay-top"></div>
<div class="overlay-left"></div>
<div class="overlay-right"></div>
<div class="overlay-bottom"></div>
<!-- Popup positioned based on the target element -->
<div class="popup p-4" style="top: {top}px; left: {left}px;">
  {#if isPuleCircleRequired}
    <!-- <PulseCircle {pulsePosition} /> -->
  {/if}

  <div class="tip {tipPosition}"></div>

  <!-- Title and content -->
  <h2 class="text-fs-16" style="font-weight: 500; color:#ffff;">
    {title}
  </h2>
  <p
    class="text-fs-13"
    style="line-height: 19.5px; font-weight: 300; color: var(--text-neutral-300)"
  >
    {@html description}
  </p>

  <!-- Step and Buttons Row -->
  <div class="d-flex justify-content-between align-items-center">
    <!-- Step Count -->
    <p
      class="mb-0 text-fs-13"
      style="line-height: 19.5px; font-weight: 400; color: #9B9DA1;"
    >
      {stepCount}
      <!-- Example: "1/7" -->
    </p>

    <!-- Buttons -->
    <div class="d-flex gap-2">
      {#if !isLastStep}
        <Button
          type="outline-secondary"
          size="small"
          title="Dismiss"
          disable={isLastStep ? true : false}
          onClick={handleClose}
        />
      {/if}
      <Button
        type="primary"
        size="small"
        title={isLastStep ? "Finish" : "Next"}
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

  .popup {
    position: absolute;
    background-color: #1d212b;
    border-radius: 8px;
    padding: 16px;
    width: 360px;
    height: 140px;
    font-family: Arial, sans-serif;
    z-index: 100000;
    box-sizing: border-box;
  }

  .popup h2 {
    margin: 0;
    font-size: 12px;
    color: var(--text-primary-300);
  }

  .popup p {
    font-size: 12;
    margin: 4px 0;
  }

  .popup .close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
  }
</style>
