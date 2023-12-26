<script lang="ts">
  import { onMount } from "svelte";

  export let text = "Coming Soon!";
  let mouseX = 0,
    mouseY = 0,
    displayLeft = true,
    displayBottom = true;
  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  });

  function handleMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (window.innerWidth / 2 < mouseX) displayLeft = false;
    else displayLeft = true;
    if (window.innerHeight / 2 < mouseY) displayBottom = true;
    else displayBottom = false;
  }
</script>

<div class="tooltip m-auto opacity-100">
  <span
    class="tooltip-text invisible text-center rounded px-2 py-1 bg-black text-lightGray position-absolute justify-content-center align-items-center gap-2 z-1 opacity-0"
    style={`${
      displayLeft
        ? `left: ${mouseX}px; `
        : `right: ${window.innerWidth - mouseX}px; `
    }` +
      `${
        displayBottom
          ? `bottom: ${window.innerHeight - mouseY}px; `
          : `top: ${mouseY}px; `
      }`}
    >{text}
  </span>
  <slot />
</div>

<style>
  .tooltip {
    z-index: 2 !important;
  }
  .tooltip-text {
    width: 120px;
    font-family: Roboto;
    transition: opacity 0.3s;
  }

  .tooltip:hover .tooltip-text {
    visibility: visible !important;
    opacity: 1 !important;
  }
</style>
