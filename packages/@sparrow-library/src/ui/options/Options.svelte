<script lang="ts">
  import { scale } from "svelte/transition";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { cubicIn, cubicOut } from "svelte/easing";

  export let isTabMenu = false;
  export let xAxis = 0;
  export let yAxis = [0, 0]; // [top, bottom]
  export let menuItems: Array<{
    onClick: () => void;
    displayText: string;
    disabled?: boolean;
    hidden?: boolean;
    icon?: any;
    iconColor?: string;
  }> = [];
  export let width = "180px";
  export let zIndex = 4;

  let mouseX = 0;
  let mouseY = 0;
  let dropdownEl: HTMLElement;

  onMount(() => {
    mouseX = xAxis;

    // Wait one tick for the menu to render and measure
    requestAnimationFrame(() => {
      const dropdownHeight = dropdownEl?.offsetHeight || 0;
      const spaceBelow = window.innerHeight - yAxis[1];

      if (spaceBelow < dropdownHeight) {
        // Not enough space below, open upward from yAxis[0]
        mouseY = yAxis[0] - dropdownHeight;
      } else {
        // Enough space, open downward from yAxis[1]
        mouseY = yAxis[1];
      }
    });
  });
</script>

<nav
  bind:this={dropdownEl}
  style="position: fixed; top:{mouseY}px; left:{mouseX}px; z-index:{zIndex};"
  in:fade={{ duration: 200, easing: cubicOut }}
  out:fade={{ duration: 200, easing: cubicIn }}
>
  <div
    style={`width: ${width}; background-color: var(--bg-ds-surface-600);`}
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
    box-shadow: 0 16px 32px 0 rgba(0, 0, 0, 0.3);
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
