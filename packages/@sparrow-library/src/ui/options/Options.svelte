<script lang="ts">
  import { scale } from "svelte/transition";
  export let isTabMenu = false;
  export let xAxis = 0;
  export let yAxis = [0, 0];
  export let menuItems: Array<{
    onClick: () => void;
    displayText: string;
    disabled?: boolean;
    hidden?: boolean;
    icon?: any;
    iconColor?: string;
  }> = [];
  export let noOfColumns = 0;
  export let zIndex = 4;
  let mouseX = 0;
  let mouseY = 0;

  const calculateRightOptionWidth = () => {
    const firstOptionWidth = noOfColumns + 20;
    const secondOptionWidth = noOfColumns;
    return [firstOptionWidth, secondOptionWidth];
  };

  /**
   * @description - recalculates positions for element that overflows window
   */
  const calculateAdjustedAxis = () => {
    const itemHeight = 20;
    const containerPadding = 16;
    const dialogHeight =
      menuItems.filter((elem) => {
        if (elem?.hide) {
          return false;
        }
        return true;
      }).length *
        itemHeight +
      containerPadding;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    mouseX = xAxis;
    mouseY = yAxis[1];
    const [xWidth, xTranslate] = calculateRightOptionWidth();
    if (windowHeight < yAxis[1] + dialogHeight) {
      mouseY = yAxis[0] - dialogHeight;
    }
    if (windowWidth < xAxis + xWidth) {
      mouseX = xAxis - xTranslate;
    }
  };

  $: {
    if (xAxis) {
      calculateAdjustedAxis();
    }
    if (yAxis) {
      calculateAdjustedAxis();
    }
  }
</script>

<nav
  style="position: fixed; top:{mouseY}px; left:{mouseX}px; z-index:{zIndex};"
  in:scale={{ start: 0.8, duration: 400 }}
  out:scale={{ start: 0.8, duration: 400 }}
>
  <div
    style={`width: ${noOfColumns}px; background-color: var(--bg-ds-surface-600);`}
    class="overflow-hidden navbar pb-0 pt-0 d-flex flex-column border-radius-4 align-items-start justify-content-start text-whiteColor"
  >
    <ul class="p-1 w-100 mb-0">
      {#each menuItems as item}
        <li class="align-items-center {item.hidden ? 'd-none' : 'd-block'}">
          <button
            disabled={item.disabled}
            class={`w-100 d-flex align-items-center sparrow-fs-12 border-0 align-items-center px-2 py-2 ${
              item.disabled && "text-requestBodyColor"
            }`}
            on:click={item.onClick}
            style={item.displayText === "Delete"
              ? "color: var(--request-delete)"
              : ""}
            tabindex={0}
          >
            <span class="me-2">
              <svelte:component
                this={item.icon}
                height={"12px"}
                width={"12px"}
                size={"14px"}
                color={item?.iconColor || "#A5B5CA"}
              />
            </span>
            <span
              style="padding-left: {isTabMenu
                ? item.icon
                  ? ''
                  : '14px'
                : ''};"
            >
              {item.displayText}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style>
  .navbar {
    height: auto;
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  }

  ul li button {
    background-color: var(--bg-ds-surface-600);
    transition: 0.2s ease;
    border: none;
  }

  ul li button:hover {
    color: var(--white-color);
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
  }
  ul li button:focus-visible {
    background-color: var(--bg-ds-surface-600);
    outline: 2px solid var(--border-ds-primary-300) !important;
  }
</style>
