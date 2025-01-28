<script lang="ts">
  export let title = "Tooltip";
  export let subtext = "";
  export let styleProp = "";
  export let show = true;
  export let placement:
    | "left-center"
    | "right-center"
    | "top-center"
    | "bottom-center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "left-top"
    | "left-bottom"
    | "right-top"
    | "right-bottom" = "bottom-center";
  export let zIndex = 1;
  export let transitionTime = "0.3s";
  export let spacing = "4px 10px";
  export let distance = 10;
  export let delay = 50;
  export let size: "small" | "medium" = "small";

  let top = "unset";
  let left = "unset";
  let right = "unset";
  let bottom = "unset";
  let tooltipWrapper: HTMLElement;
  let isHover = false;
  let isDelayed = false;

  /**
   * Return the style for small or medium type of tooltip
   */
  const getTypeStyles = () => {
    if (size === "small") {
      return {
        borderRadius: "4px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        maxWidth: "220px",
        titleClass: "small-txt",
      };
    }
    return {
      borderRadius: "6px",
      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.24)",
      maxWidth: "300px",
      titleClass: "font-bold",
    };
  };

  const toggleTooltip = () => {
    if (placement === "right-center") {
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
    } else if (placement === "left-center") {
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
    } else if (placement === "top-center") {
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
    } else if (placement === "bottom-center") {
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
    } else if (placement === "bottom-right") {
      left = tooltipWrapper.getBoundingClientRect().right.toString() + "px";
      top =
        (tooltipWrapper.getBoundingClientRect().bottom + distance).toString() +
        "px";
      bottom = "unset";
      right = "unset";
    } else if (placement === "bottom-left") {
      left = tooltipWrapper.getBoundingClientRect().left.toString() + "px";
      top =
        (tooltipWrapper.getBoundingClientRect().bottom + distance).toString() +
        "px";
      bottom = "unset";
      right = "unset";
    } else if (placement === "top-left") {
      left = tooltipWrapper.getBoundingClientRect().left.toString() + "px";
      bottom =
        (
          window.innerHeight -
          tooltipWrapper.getBoundingClientRect().top +
          distance
        ).toString() + "px";
      right = "unset";
      top = "unset";
    } else if (placement === "top-right") {
      left = tooltipWrapper.getBoundingClientRect().right.toString() + "px";
      bottom =
        (
          window.innerHeight -
          tooltipWrapper.getBoundingClientRect().top +
          distance
        ).toString() + "px";
      right = "unset";
      top = "unset";
    } else if (placement === "right-bottom") {
      // Position at the right side, aligned to bottom
      bottom =
        (
          window.innerHeight - tooltipWrapper.getBoundingClientRect().bottom
        ).toString() + "px";
      left =
        (tooltipWrapper.getBoundingClientRect().right + distance).toString() +
        "px";
      top = "unset";
      right = "unset";
    } else if (placement === "right-top") {
      // Position at the right side, aligned to top
      top = tooltipWrapper.getBoundingClientRect().top.toString() + "px";
      left =
        (tooltipWrapper.getBoundingClientRect().right + distance).toString() +
        "px";
      right = "unset";
      bottom = "unset";
    } else if (placement === "left-top") {
      top = tooltipWrapper.getBoundingClientRect().top.toString() + "px";
      right =
        (
          window.innerWidth -
          tooltipWrapper.getBoundingClientRect().left +
          distance
        ).toString() + "px";
      left = "unset";
      bottom = "unset";
    } else if (placement === "left-bottom") {
      bottom =
        (
          window.innerHeight - tooltipWrapper.getBoundingClientRect().bottom
        ).toString() + "px";
      right =
        (
          window.innerWidth -
          tooltipWrapper.getBoundingClientRect().left +
          distance
        ).toString() + "px";
      top = "unset";
      left = "unset";
    }
  };
  $: styles = getTypeStyles();
</script>

{#if show}
  <span
    class="{isHover
      ? `tooltip-text-hover ${'tooltip-text-hover-' + placement.toString()}`
      : ''} tooltip-text invisible m-auto text-center position-fixed justify-content-center align-items-center opacity-0
 {placement.toString()} "
    style="top: {top}; left: {left}; right: {right}; bottom: {bottom}; transition: {transitionTime} ; padding:{spacing}; font-size:12px; z-index : {zIndex} ; 
           border-radius: {styles.borderRadius}; 
           box-shadow: {styles.boxShadow}; {styleProp}
           max-width: {styles.maxWidth}; white-space: normal; word-wrap: break-word; background-color:var(--bg-ds-surface-100)"
  >
    <div class="{styles.titleClass} title-txt">{@html title}</div>
    {#if size === "medium" && subtext}
      <div class="subtext">{@html subtext}</div>
    {/if}
    {#if placement === "left-center"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:50%; right:5px; transform: translateX(100%) translateY(-50%) rotate(45deg);"
      >
      </span>
    {:else if placement === "top-center"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="bottom:5px; left:50%; transform: translateX(-50%) translateY(100%) rotate(45deg);"
      >
      </span>
    {:else if placement === "right-center"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:50%; left:5px; transform: translateX(-100%) translateY(-50%) rotate(45deg);"
      >
      </span>
    {:else if placement === "bottom-center"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:5px; left:50%; transform: translateX(-50%) translateY(-100%) rotate(45deg); "
      >
      </span>
    {:else if placement === "bottom-right"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:5px; right:10px; transform: translateY(-100%) rotate(45deg);"
      >
      </span>
    {:else if placement === "bottom-left"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="top:5px; left:10px; transform: translateY(-100%) rotate(45deg);"
      >
      </span>
    {:else if placement === "top-right"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="bottom:-15px; right:10px; transform: translateY(-100%) rotate(45deg);"
      >
      </span>
    {:else if placement === "top-left"}
      <span
        class="position-absolute tooltip-square border-radius-2"
        style="bottom:-15px; left:10px; transform: translateY(-100%) rotate(45deg);"
      >
      </span>
    {:else if placement === "right-bottom"}
      <span
        class="position-absolute tooltip-square"
        style="top:{size === 'medium'
          ? '80%'
          : '30%'}; left:5px; transform: translateX(-100%) rotate(45deg);"
      ></span>
    {:else if placement === "right-top"}
      <span
        class="position-absolute tooltip-square"
        style="top:{size === 'medium'
          ? '15%'
          : '30%'}; left:5px; transform: translateX(-100%) rotate(45deg);"
      ></span>
    {:else if placement === "left-bottom"}
      <span
        class="position-absolute tooltip-square"
        style="top:{size === 'medium'
          ? '80%'
          : '50%'}; right:5px; transform: translateX(100%) translateY(-50%) rotate(45deg);"
      ></span>
    {:else if placement === "left-top"}
      <span
        class="position-absolute tooltip-square"
        style="top:{size === 'medium'
          ? '15%'
          : '50%'}; right:5px; transform: translateX(100%) translateY(-50%) rotate(45deg);"
      ></span>
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
  .top-center,
  .top-right,
  .top-left {
    transform: translateX(-50%) scale(0.5);
  }
  .left-center {
    transform: translateY(-50%) scale(0.5);
  }
  .right-center {
    transform: translateY(-50%) scale(0.5);
  }
  .bottom-center {
    transform: translateX(-50%) scale(0.5);
  }
  .bottom-right {
    transform: translateX(-100%) scale(0.5);
  }

  .tooltip-text-hover-bottom-right {
    transform: translateX(-100%) scale(1);
  }

  .bottom-left {
    transform: translateX(0) scale(0.5);
  }

  .tooltip-text-hover-bottom-left {
    transform: translateX(0) scale(1);
  }
  .tooltip-text-hover-top-right {
    transform: translateX(-100%) scale(1);
  }
  .tooltip-text-hover-top-left {
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
  .tooltip-text-hover-top-center {
    transform: translateX(-50%) scale(1);
  }
  .tooltip-text-hover-left-center {
    transform: translateY(-50%) scale(1);
  }
  .tooltip-text-hover-right-center {
    transform: translateY(-50%) scale(1);
  }
  .tooltip-text-hover-bottom-center {
    transform: translateX(-50%) scale(1);
  }
  .tooltip-text-hover-right-top,
  .tooltip-text-hover-right-bottom {
    transform: translateX(0) scale(1);
  }
  .tooltip-square {
    height: 10px;
    width: 10px;
    background-color: var(--bg-ds-surface-100);
  }
  .subtext {
    margin-top: 4px;
    color: var(--text-ds-neutral-200);
    font-weight: 400;
    text-align: left;
    padding-bottom: 8px;
  }
  .font-bold {
    font-weight: 600;
    text-align: left;
    padding-top: 6px;
  }
  .title-txt {
    color: var(--text-ds-neutral-50);
  }
  .small-txt {
    font-weight: 400;
  }
</style>
