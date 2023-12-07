<script lang="ts">
  import { onMount } from "svelte";

  export let text = "Coming Soon!";
  let mouseX = 0;
  let mouseY = 0;
  let tooltipWidth = 120;
  let tooltipHeight = 40;
  let displayLeft = true,
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
    // Ensure tooltip stays within the boundaries of the screen
    const maxX = window.innerWidth - tooltipWidth;
    const maxY = window.innerHeight - tooltipHeight;
    console.log(
      "displayLeft: ",
      window.innerWidth / 2,
      " ",
      mouseX,
      " ",
      displayLeft,
    );
    mouseX = Math.min(mouseX, maxX);
    mouseY = Math.min(mouseY, maxY);
  }
</script>

<div class="tooltip">
  <span
    class="tooltip-text"
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
    /* position: relative; */
    margin: auto;
    opacity: 1;
  }

  .tooltip-text {
    visibility: hidden;
    width: 120px;
    text-align: center;
    font-family: Roboto;
    border-radius: 4px;
    padding: 4px 6px;
    background-color: #000;
    color: #ccc;
    position: absolute;
    justify-content: center;
    align-items: center;
    gap: 8px;
    z-index: 1;

    /* margin-left: -60px; */
    opacity: 0;
    /* transition: opacity 0.5s; */
    transition:
      opacity 0.3s,
      top 0.3s,
      left 0.3s;
  }

  .tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
</style>
