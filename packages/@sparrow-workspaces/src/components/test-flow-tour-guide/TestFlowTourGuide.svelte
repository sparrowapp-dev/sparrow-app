<script>
  import { CrossIcon } from "@sparrow/library/assets";
  import { onMount, onDestroy } from "svelte";
  import PulseCircle from "../../../../@sparrow-common/src/components/pulse-circle/PulseCircle.svelte";
  
  export let pulsePosition = { top: "0px", left: "0px" };
  export let targetId; // The ID of the target element
  export let title = ""; // Title for the popup
  export let description = ""; // Description for the popup
  export let tipPosition = "top-left"; // Position of the tip (triangle)
  export let onNext; // Function for the Next button
  export let onClose; // Function for the Close button
  export let isPuleCircleRequired=true;

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
      height={"12px"}
      width={"12px"}
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
  <p class="text-fs-13" style="line-height: 19.5px; font-weight:400;">
    {description}
  </p>

  <!-- Next/Done button -->
  <button
    class=" mt-2 px-2 py-1 rounded-1 text-fs-12"
    style="font-weight:400; border: none; background-color:#2A2C3C;"
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
  }

  .popup {
    position: absolute;
    background-color: #1c1d2b;
    border-radius: 8px;
    padding: 16px;
    color: white;
    max-width: 300px;
    width: 300px;
    font-family: Arial, sans-serif;
    z-index: 10000000000; /* Ensure it's above the overlay */
  }

  .popup h2 {
    margin: 0;
    font-size: 18px;
    color: #3f7ee6;
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

  .popup .next-button {
    background-color: #3f7ee6;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px;
    margin-top: 10px;
    cursor: pointer;
  }

  .popup .tip {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  /* Tip positions */
  .tip.top-left {
    top: -10px;
    left: 20px;
    border-width: 0 10px 10px 10px;
    border-color: transparent transparent #1c1d2b transparent;
  }

  .tip.top-right {
    top: -10px;
    right: 20px;
    border-width: 0 10px 10px 10px;
    border-color: transparent transparent #1c1d2b transparent;
  }

  .tip.bottom-left {
    bottom: -10px;
    left: 20px;
    border-width: 10px 10px 0 10px;
    border-color: #1c1d2b transparent transparent transparent;
  }

  .tip.bottom-right {
    bottom: -10px;
    right: 20px;
    border-width: 10px 10px 0 10px;
    border-color: #1c1d2b transparent transparent transparent;
  }

  /* New Tip Positions */
  .tip.left-top {
    top: 20px;
    left: -8px;
    border-width: 20px 20px 0 0;
    border-color: #1c1d2b transparent transparent transparent;
    transform: rotate(312deg);
  }

  .tip.left-bottom {
    bottom: 20px;
    left: -8px;
    border-width: 0 20px 20px 0;
    border-color: transparent #1c1d2b transparent transparent;
    transform: rotate(225deg);
  }

  .tip.right-top {
    top: 20px;
    right: -10px;
    border-width: 20px 0 0 20px;
    border-color: #1c1d2b transparent transparent transparent;
    transform: rotate(45deg);
  }

  .tip.right-bottom {
    bottom: 20px;
    right: -8px;
    border-width: 0 0 20px 20px;
    border-color: transparent transparent #1c1d2b transparent;
    transform: rotate(315deg);
  }
</style>
