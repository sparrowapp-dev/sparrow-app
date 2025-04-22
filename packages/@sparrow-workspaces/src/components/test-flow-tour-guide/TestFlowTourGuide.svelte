<script>
  import { CrossIcon } from "@sparrow/library/assets";
  import { onMount, onDestroy } from "svelte";
  import { PulseCircle } from "@sparrow/common/components";
  import { Button } from "@sparrow/library/ui";

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
  <div class="d-flex justify-content-end gap-2">
    <Button
      type="outline-secondary"
      size="small"
      title="Dismiss"
      onClick={handleClose}
    />

    <Button
      type="primary"
      size="small"
      title={isLastStep ? "Done" : "Next"}
      onClick={handleNext}
    />
  </div>
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
    background-color: #1d212b;
    border-radius: 8px;
    padding: 16px;
    width: 352px;
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
</style>
