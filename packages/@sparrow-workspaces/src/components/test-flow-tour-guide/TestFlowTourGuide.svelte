<script>
  import { CrossIcon } from "@sparrow/library/assets";
  import { onMount, onDestroy } from "svelte";
  import { PulseCircle } from "@sparrow/common/components";

  export let pulsePosition = { top: "0px", left: "0px" };
  export let targetId;
  export let title = "";
  export let description = "";
  export let tipPosition = "top-left";
  export let onNext;
  export let onClose;
  export let isPuleCircleRequired = true;

  export let isLastStep = false;

  let top = 0;
  let left = 0;
  let targetElement;

  // Close function handler
  function handleClose() {
    if (onClose) onClose();
  }

  // Next function handler
  function handleNext() {
    event.stopPropagation();
    if (onNext) onNext();
  }

  // Find the target element's position and set the popup accordingly
  function updatePosition() {
    if (targetId) {
      targetElement = document.getElementById(targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        top = rect.top + window.scrollY;
        left = rect.left + window.scrollX;
      }
    }
  }

  // Run the position update logic when the component mounts
  onMount(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
  });

  onDestroy(() => {
    window.removeEventListener("resize", updatePosition);
  });
</script>

<!-- Overlay to block user interaction -->
<div class="overlay"></div>

<!-- Popup positioned based on the target element -->
<div class="popup p-4" style="top: {top}px; left: {left}px;">
  {#if isPuleCircleRequired}
    <PulseCircle {pulsePosition} />
  {/if}

  <div class="tip {tipPosition}"></div>

  <!-- Close button (X) -->
  <div class="close-icon" on:click={handleClose}>
    <CrossIcon
      height={"11px"}
      width={"11px"}
      color={"var(--icon-tertiary-100)"}
    />
  </div>

  <!-- Title and content -->
  <h2
    class="text-fs-16"
    style="font-weight: 500; color:var(--text-primary-300);"
  >
    {title}
  </h2>
  <p
    class="text-fs-13"
    style="line-height: 19.5px; font-weight:400; color:var(--text-secondary-100);"
  >
    {@html description}
  </p>

  <!-- Next/Done button -->
  <button
    class=" mt-2 rounded-1 text-fs-12"
    style="font-weight:500; border: none; background-color:#2A2C3C; padding:7px 10px;"
    on:click={handleNext}
    >{#if isLastStep}
      Done
    {:else}
      Next
    {/if}</button
  >
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5); /* Dim background */
    opacity: 50%;
    z-index: 10000;
  }

  .popup {
    position: absolute;
    background-color: #1c1d2b;
    border-radius: 8px;
    padding: 16px;
    max-width: 300px;
    width: 300px;
    font-family: Arial, sans-serif;
    z-index: 100000;
    border: 0.3px solid var(--border-tertiary-190);
  }

  .popup h2 {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary-300);
  }

  .popup p {
    margin: 8px 0;
  }

  .popup .close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
  }

  .popup .tip {
    position: absolute;
    width: 19px;
    height: 19px;

    background-color: #1c1d2b;
  }

  /* Tip positions */
  .tip.top-left {
    top: -10px;
    left: 25px;
    border-left: 0.3px solid var(--border-tertiary-190);
    border-top: 0.3px solid var(--border-tertiary-190);
    transform: rotate(45deg);
  }

  .tip.top-right {
    top: -10px;
    right: 30px;
    border-left: 0.3px solid var(--border-tertiary-190);
    border-top: 0.3px solid var(--border-tertiary-190);
    transform: rotate(45deg);
  }

  .tip.bottom-left {
    bottom: -10px;
    left: 25px;
    border-left: 0.3px solid var(--border-tertiary-190);
    border-top: 0.3px solid var(--border-tertiary-190);
    transform: rotate(225deg);
  }

  .tip.bottom-right {
    bottom: -10px;
    right: 25px;
    border-left: 0.3px solid var(--border-tertiary-190);
    border-top: 0.3px solid var(--border-tertiary-190);
    transform: rotate(225deg);
  }

  /* New Tip Positions */
  .tip.left-top {
    top: 25px;
    left: -10px;
    border-left: 0.3px solid var(--border-tertiary-190);
    border-top: 0.3px solid var(--border-tertiary-190);
    transform: rotate(314deg);
  }

  .tip.left-bottom {
    bottom: 25px;
    left: -10px;
    border-left: 0.3px solid var(--border-tertiary-190);
    border-top: 0.3px solid var(--border-tertiary-190);
    transform: rotate(314deg);
  }

  .tip.right-top {
    top: 25px;
    right: -10px;
    border-left: 0.3px solid var(--border-tertiary-190);
    border-top: 0.3px solid var(--border-tertiary-190);
    transform: rotate(135deg);
  }

  .tip.right-bottom {
    bottom: 25px;
    right: -10px;
    border-left: 0.3px solid var(--border-tertiary-190);
    border-top: 0.3px solid var(--border-tertiary-190);
    transform: rotate(135deg);
  }
</style>
