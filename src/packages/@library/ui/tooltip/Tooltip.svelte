<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

  export let title = "Tooltip";
  export let classProp = "";
  export let styleProp = "";
  export let show = true;
  export let verticalOffset: string = "";
  export let horizontalOffset: string = "";
  export let verticalArrowOffset: string = "";
  export let horizontalArrowOffset: string = "";

  let tooltipElement: HTMLDivElement;
  let tooltipPosition: DOMRect;
  let windowWidth: number;
  let windowHeight: number;

  const getPosition = () => {
    tooltipPosition = tooltipElement.getBoundingClientRect();
  };

  onMount(() => {
    getPosition();
  });
  afterUpdate(() => {
    getPosition();
  });

  $: {
    if (windowHeight || windowWidth) {
      getPosition();
    }
  }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div bind:this={tooltipElement} class={"tooltip opacity-100"} style="">
  {#if show}
    <span
      class={`tooltip-text invisible m-auto text-center px-2 py-1 bg-tertiary-400 text-lightGray justify-content-center align-items-center gap-2 opacity-0
    ${classProp}`}
      style="{styleProp} position: fixed; top: calc({tooltipPosition?.top}px {verticalOffset}); left: calc({tooltipPosition?.left}px {horizontalOffset});"
      >{title}
    </span>
    <span
      class={`tooltip-arrow invisible bg-tertiary-400 opacity-0
    ${classProp}`}
      style="{styleProp} position: fixed; top: calc({tooltipPosition?.top}px {verticalOffset} {verticalArrowOffset} + {tooltipPosition?.height -
        1}px); left: calc({tooltipPosition?.left}px {horizontalOffset} {horizontalArrowOffset}); z-index: 100000;"
    >
    </span>
  {/if}

  <slot />
</div>

<style>
  /* .tooltip {
    z-index: 1 !important;
  } */
  .top {
    top: -5px;
    left: 50%;
    transform: translateY(-100%) translateX(-50%);
  }
  .left {
    left: -5px;
    top: 50%;
    transform: translateX(-100%) translateY(-50%);
  }
  .right {
    right: -5px;
    top: 50%;
    transform: translateX(100%) translateY(-50%);
  }
  .bottom {
    bottom: -5px;
    left: 50%;
    transform: translateY(100%) translateX(-50%);
  }
  .tooltip-text,
  .tooltip-arrow {
    font-family: Roboto;
    transition: opacity 0.3s;
    width: max-content;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 500;
  }
  .tooltip-arrow {
    width: 10px;
    height: 10px;
    z-index: -1;
    transform: rotate(45deg);
  }
  .tooltip:hover .tooltip-text,
  .tooltip:hover .tooltip-arrow {
    visibility: visible !important;
    opacity: 1 !important;
  }
</style>
