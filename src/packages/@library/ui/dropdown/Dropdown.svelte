<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

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
    onclick: () => void;
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
            isMenuOpen = false;
          }
        },
        100,
      );
    });
  });

  afterUpdate(() => {
    /**
     * calculate the position of the menu container
     */
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
  <div
    class="bg-dropdownContainer p-1 rounded-1 {isMenuOpen
      ? 'position-fixed'
      : 'd-none'}"
    style="min-width: {minWidth}px; top: {menuPosition.top}px; left: {menuPosition.left}px; z-index: 1000000;"
  >
    <!-- 
      Menu item
    -->
    {#each options as item}
      <button
        class="border-0 d-flex p-2 rounded-1 w-100 option-button"
        on:click={() => item.onclick()}
      >
        {#if item.icon}
          <img
            src={item.icon}
            alt=""
            style="width: 15px; height: 15px; margin: auto 10px auto 5px;"
          />
        {/if}
        <p style="margin-bottom: 0;">{item.name}</p>
      </button>
    {/each}
  </div>
</div>

<style>
  .option-button {
    background-color: transparent;
  }
  .option-button:hover {
    background-color: var(--dropdown-option-hover);
  }
  .option-button:active {
    background-color: var(--dropdown-option-active);
  }
</style>
