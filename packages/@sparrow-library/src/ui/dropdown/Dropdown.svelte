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
  /**
   * Options of the menu
   */
  export let options: {
    name: String;
    icon: any;
    color: String;
    iconColor: string;
    iconSize: string;
    onclick: () => void;
    isHoverConstant: boolean;
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
    let position = dropdownElement.getBoundingClientRect();
    menuPosition.top = position.bottom + 10;

    if (horizontalPosition === "right") {
      menuPosition.left = position.left;
    } else {
      menuPosition.left = position.left - minWidth + position.width;
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
      class="bg-dropdownContainer dropdown-container p-1 rounded-1 position-fixed
      "
      style="min-width: {minWidth}px; top: {menuPosition.top}px; left: {menuPosition.left}px; z-index: 9999;"
    >
      <!--
      Menu item
    -->
      {#each options as item}
        <button
          class="border-0 d-flex p-2 rounded-1 w-100 option-button {item?.isHoverConstant
            ? 'hover-effect'
            : ''} "
          style="color: {item.color};"
          on:click={() => item.onclick()}
        >
          {#if item.icon}
            <!-- <img
              src={item.icon}
              alt=""
              style="width: 15px; height: 15px; margin: auto 10px auto 5px;"
            /> -->
            <span class="me-2">
              <svelte:component
                this={item.icon}
                height={item.iconSize}
                width={item.iconSize}
                color={item.iconColor}
              />
            </span>
          {/if}
          <p style="margin-bottom: 0;">{item.name}</p>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dropdown-container {
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  }
  .option-button {
    background-color: transparent;
    transition: 0.2s ease;
  }
  .option-button:hover {
    background-color: var(--dropdown-option-hover);
  }
  .option-button:active {
    background-color: var(--dropdown-option-active);
  }
  .hover-effect {
    background-color: var(--dropdown-option-hover);
  }
</style>
