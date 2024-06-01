<script lang="ts">
  export let title = "Tooltip";
  export let styleProp = "";
  export let show = true;
  export let placement: "left" | "right" | "top" | "bottom" = "bottom";
  export let zIndex = 1;
  export let transitionTime = "0.5s";
  export let spacing = "4px 10px";
  export let borderRadius = "2px";
  export let distance = 20;
  export let fontSize = "12px";

  let top = "unset";
  let left = "unset";
  let right = "unset";
  let bottom = "unset";
  let tooltipWrapper: HTMLElement;
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
    }
  };
</script>

<div
  on:mouseenter={() => {
    toggleTooltip();
  }}
  bind:this={tooltipWrapper}
  class={"tooltip position-relative opacity-100"}
  style=""
>
  {#if show}
    <span
      class={`tooltip-text invisible m-auto text-center bg-tertiary-700 text-lightGray position-fixed justify-content-center align-items-center gap-2 opacity-0
     ${placement.toString()} `}
      style="top: {top}; left: {left}; right: {right}; bottom: {bottom}; z-index : {zIndex} ; transition:  {transitionTime}; padding:{spacing}; font-size:{fontSize}; border-radius: {borderRadius}; {styleProp}"
      >{title}
      {#if placement === "left"}
        <span
          class="position-absolute tooltip-square"
          style="top:50%; right:5px; transform: translateX(100%) translateY(-50%) rotate(45deg);"
        >
        </span>
      {:else if placement === "top"}
        <span
          class="position-absolute tooltip-square"
          style="bottom:5px; left:50%; transform: translateX(-50%) translateY(100%) rotate(45deg);"
        >
        </span>
      {:else if placement === "right"}
        <span
          class="position-absolute tooltip-square"
          style="top:50%; left:5px; transform: translateX(-100%) translateY(-50%) rotate(45deg);"
        >
        </span>
      {:else if placement === "bottom"}
        <span
          class="position-absolute tooltip-square"
          style="top:5px; left:50%; transform: translateX(-50%) translateY(-100%) rotate(45deg); "
        >
        </span>
      {/if}
    </span>
  {/if}

  <slot />
</div>

<style>
  .top {
    transform: translateX(-50%);
  }
  .left {
    transform: translateY(-50%);
  }
  .right {
    transform: translateY(-50%);
  }
  .bottom {
    transform: translateX(-50%);
  }
  .tooltip:hover .tooltip-text {
    visibility: visible !important;
    opacity: 1 !important;
    transition-delay: 0.3s !important;
  }
  .tooltip-square {
    height: 10px;
    width: 10px;
    background-color: var(--bg-tertiary-700);
  }
</style>
