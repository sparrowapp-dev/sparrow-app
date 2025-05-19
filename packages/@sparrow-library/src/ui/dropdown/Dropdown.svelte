<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { quintOut, backInOut } from "svelte/easing";

  export let isBackgroundClickable = true;

  /**
   * Button ID
   */
  export let buttonId: string;
  /**
   * If the menu is open
   */
  export let isMenuOpen: boolean = false;

  export let disable: Boolean = false;
  /**
   * Options of the menu
   */
  export let options: {
    name: String;
    icon?: any;
    color: String;
    iconColor?: string;
    iconSize?: string;
    onclick: () => void;
    isHoverConstant?: boolean;
    subTitle?: string;
    startIcon?: any;
    endIcon?: any;
  }[];

  export let horizontalPosition: "left" | "right" = "right";

  export let minWidth: number = 200;

  export let zIndex = 1;
  /**
   * Menu's position according to the id "addButton"
   */
  let menuPosition: {
    top: number;
    left: number;
  } = {
    top: 0,
    left: 0,
  };

  onMount(() => {
    /**
     * click event to close the dropdown menu if click anywhere if menu is open
     */
    const dropdownElement = document.getElementById(buttonId);
    setTimeout(() => {
      window.addEventListener(
        "click",
        (event) => {
          if (
            dropdownElement &&
            !dropdownElement.contains(event.target as Node)
          ) {
            if (isBackgroundClickable) {
              isMenuOpen = false;
            }
          }
        },
        100,
      );
    });
  });

  afterUpdate(() => {
    const dropdownElement = document.getElementById(buttonId);
    if (dropdownElement) {
      let position = dropdownElement.getBoundingClientRect();
      menuPosition.top = position.bottom + 10;

      if (horizontalPosition === "right") {
        menuPosition.left = position.left;
      } else {
        menuPosition.left = position.left - minWidth + position.width;
      }
    }
  });
</script>

<div class="position-relative" style="font-size: 12px;">
  <!--
    the button to open the menu container
  -->
  <slot />

  <!--
    the menu container
  -->
  {#if isMenuOpen}
    <div
      in:scale={{ start: 0.8, duration: 400 }}
      out:scale={{ start: 0.8, duration: 400 }}
      id="dropdown-items"
      class="dropdown-container p-1 rounded-1 position-fixed
      "
      style="min-width: {minWidth}px; top: {menuPosition.top}px; left: {menuPosition.left}px; z-index: 9999;"
    >
      <!--
      Menu item
    -->
      {#each options as item}
        <button
          class="d-flex align-items-center p-2 rounded-1 gap-2 w-100 option-button {item?.isHoverConstant
            ? 'hover-effect'
            : ''} {disable ? 'option-button-disable' : ''} "
          style="color: {item.color};"
          on:click={() => item.onclick()}
          tabindex={0}
        >
          {#if item.icon}
            <span class="me-2 d-flex align-items-center">
              <svelte:component
                this={item.icon}
                height={item.iconSize}
                width={item.iconSize}
                size={item.iconSize}
                color={item.iconColor}
              />
            </span>
          {/if}
          {#if item.startIcon}
            <svelte:component
              this={item.startIcon}
              size={item.iconSize}
              color={item.iconColor}
            />
          {/if}
          <div>
            <p
              class="option-header-text"
              style="margin-bottom: 0;max-width:{minWidth}; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"
            >
              {item.name}
            </p>
            {#if item.subTitle}
              <p class="option-subtitle" style="margin: 0px;">
                {item.subTitle}
              </p>
            {/if}
          </div>
          {#if item.endIcon}
            <span class="ms-auto">
              <svelte:component
                this={item.endIcon}
                size={item.iconSize}
                color={item.iconColor}
              />
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dropdown-container {
    /* -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5); */
    background-color: var(--bg-ds-surface-600);
  }
  .option-button {
    background-color: var(--bg-ds-surface-600);
    border-radius: 4px;
    transition: 0.2s ease;
    border: none;
    min-height: 28px;
  }
  .option-button:hover {
    background-color: var(--bg-ds-surface-400);
  }
  .option-button:active {
    background-color: var(--bg-ds-surface-700);
  }
  .option-button:focus-visible {
    background-color: var(--bg-ds-surface-600);
    outline: 2px solid var(--bg-ds-primary-300);
  }
  .hover-effect {
    background-color: var(--bg-ds-surface-400);
  }
  .option-header-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    /* color: var(--text-ds-neutral-50); */
  }
  .option-subtitle {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    color: var(--text-ds-neutral-300);
  }
  .option-button-disable {
    background-color: var(--bg-ds-surface-600);
    opacity: 0.6;
  }
</style>
