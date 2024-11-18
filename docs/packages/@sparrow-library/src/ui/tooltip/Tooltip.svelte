<script lang="ts">
  export let title = "Tooltip";
  export let styleProp = "";
  export let show = true;
  export let placement:
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "bottom-right"
    | "bottom-left" = "bottom";
  export let zIndex = 1;
  export let transitionTime = "0.3s";
  export let spacing = "4px 10px";
  export let borderRadius = "2px";
  export let distance = 10;
  export let fontSize = "12px";
  export let delay = 50;

  let top = "unset";
  let left = "unset";
  let right = "unset";
  let bottom = "unset";
  let tooltipWrapper: HTMLElement;
  let isHover = false;
  let isDelayed = false;

  const toggleTooltip = () => {
    if (placement === "right") {
      top =
        (
          (tooltipWrapper.getBoundingClientRect().top +
            tooltipWrapper.getBoundingClientRect().bottom) /
          2
        ).toString() + "px";
      left =
        (tooltipWrapper.getBoundingClientRect().right + distance).toString() +
        "px";
      right = "unset";
      bottom = "unset";
    } else if (placement === "left") {
      top =
        (
          (tooltipWrapper.getBoundingClientRect().top +
            tooltipWrapper.getBoundingClientRect().bottom) /
          2
        ).toString() + "px";
      right =
        (
          tooltipWrapper.getBoundingClientRect().right +
          distance +
          (window.innerWidth -
            tooltipWrapper.getBoundingClientRect().left -
            tooltipWrapper.getBoundingClientRect().right)
        ).toString() + "px";
      left = "unset";
      bottom = "unset";
    } else if (placement === "top") {
      left =
        (
          (tooltipWrapper.getBoundingClientRect().right +
            tooltipWrapper.getBoundingClientRect().left) /
          2
        ).toString() + "px";
      bottom =
        (
          window.innerHeight -
          tooltipWrapper.getBoundingClientRect().top +
          distance
        ).toString() + "px";
      right = "unset";
      top = "unset";
    } else if (placement === "bottom") {
      left =
        (
          (tooltipWrapper.getBoundingClientRect().right +
            tooltipWrapper.getBoundingClientRect().left) /
          2
        ).toString() + "px";
      top =
        (tooltipWrapper.getBoundingClientRect().bottom + distance).toString() +
        "px";
      bottom = "unset";
      right = "unset";
    } else if (placement === "bottom-left") {
      left = tooltipWrapper.getBoundingClientRect().right.toString() + "px";
      top =
        (tooltipWrapper.getBoundingClientRect().bottom + distance).toString() +
        "px";
      bottom = "unset";
      right = "unset";
    } else if (placement === "bottom-right") {
      left = tooltipWrapper.getBoundingClientRect().left.toString() + "px";
      top =
        (tooltipWrapper.getBoundingClientRect().bottom + distance).toString() +
        "px";
      bottom = "unset";
      right = "unset";
    }
  };
</script>

{#if show}
  <span
    class="{isHover
      ? `tooltip-text-hover ${'tooltip-text-hover-' + placement.toString()}`
      : ''} tooltip-text invisible m-auto text-center bg-tertiary-700 text-lightGray position-fixed justify-content-center align-items-center opacity-0
 {placement.toString()} "
    style="top: {top}; left: {left}; right: {right}; bottom: {bottom}; transition: {transitionTime} ; padding:{spacing}; font-size:{fontSize}; z-index : {zIndex} ; border-radius: {borderRadius}; {styleProp} width: fit-content;"
    >{@html title}
    {#if placement === "left"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:50%; right:5px; transform: translateX(100%) translateY(-50%) rotate(45deg);"
      >
      </span>
    {:else if placement === "top"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="bottom:5px; left:50%; transform: translateX(-50%) translateY(100%) rotate(45deg);"
      >
      </span>
    {:else if placement === "right"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:50%; left:5px; transform: translateX(-100%) translateY(-50%) rotate(45deg);"
      >
      </span>
    {:else if placement === "bottom"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:5px; left:50%; transform: translateX(-50%) translateY(-100%) rotate(45deg); "
      >
      </span>
    {:else if placement === "bottom-left"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:5px; right:10px; transform: translateY(-100%) rotate(45deg);"
      >
      </span>
    {:else if placement === "bottom-right"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:5px; left:10px; transform: translateY(-100%) rotate(45deg);"
      >
      </span>
    {/if}
  </span>
{/if}

<div
  on:mouseenter={() => {
    isDelayed = true;
    setTimeout(() => {
      if (isDelayed) {
        isHover = true;
      }
    }, delay);
    toggleTooltip();
  }}
  on:mouseleave={() => {
    isHover = false;
    isDelayed = false;
  }}
  bind:this={tooltipWrapper}
  class={""}
>
  <slot />
</div>

<style>
  .top {
    transform: translateX(-50%) scale(0.5);
  }
  .left {
    transform: translateY(-50%) scale(0.5);
  }
  .right {
    transform: translateY(-50%) scale(0.5);
  }
  .bottom {
    transform: translateX(-50%) scale(0.5);
  }
  .bottom-left {
    transform: translateX(-100%) scale(0.5);
  }

  .tooltip-text-hover-bottom-left {
    transform: translateX(-100%) scale(1);
  }

  .bottom-right {
    transform: translateX(0) scale(0.5);
  }

  .tooltip-text-hover-bottom-right {
    transform: translateX(0) scale(1);
  }
  .tooltip-text {
    transform-origin: center;
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  }
  .tooltip-text-hover {
    visibility: visible !important;
    opacity: 1 !important;
  }
  .tooltip-text-hover-top {
    transform: translateX(-50%) scale(1);
  }
  .tooltip-text-hover-left {
    transform: translateY(-50%) scale(1);
  }
  .tooltip-text-hover-right {
    transform: translateY(-50%) scale(1);
  }
  .tooltip-text-hover-bottom {
    transform: translateX(-50%) scale(1);
  }
  .tooltip-square {
    height: 10px;
    width: 10px;
    background-color: var(--bg-tertiary-700);
  }
</style>
