<script lang="ts" context="module">
  export type SidebarProfileObj = {
    heading: string;
    defaultLogo: any;
    hoveredLogo?: any;
    selectedLogo?: any;
    disabled: boolean;
  };
</script>

<script lang="ts">
  import SignOutIcon from "./SignOutIcon.svelte";
  import { afterUpdate, onMount } from "svelte";

  /**
   * List of side bar Items
   */
  export let item: SidebarProfileObj;
  let isHovered = false;
  let isRouteActive = false;
  let buttonElement: HTMLButtonElement;
  let modalElement: HTMLDivElement;
  let buttonPosition: DOMRect;
  let modalPostion: DOMRect;
  let showModal = false;
  let user: { name: string; email: string };

  const getbuttonPosition = () => {
    if (buttonElement) {
      buttonPosition = buttonElement.getBoundingClientRect();
      modalPostion = modalElement?.getBoundingClientRect();
    }
  };

  onMount(() => {
    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    getbuttonPosition();

    item.user
      .subscribe((value) => {
        user = { name: value.name, email: value.email };
      })
      .unsubscribe();

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  });

  afterUpdate(() => {
    getbuttonPosition();
  });
</script>

<button
  bind:this={buttonElement}
  class="sidebar-item bg-transparent border-0"
  class:disabled={item.disabled}
  class:hover={!item.disabled && isHovered}
  on:mouseenter={() => (isHovered = true)}
  on:mouseleave={() => (isHovered = false)}
  on:click={(e) => {
    showModal = !showModal;
  }}
>
  <div class="d-flex" style="align-items: center;">
    {#if isRouteActive && !isHovered}
      <div
        style="background-color: var(--nav-bar-active-slash); position:fixed; height: 16px; width: 2px; left:10px"
      ></div>
    {/if}
    {#if isHovered && item.hoveredLogo && !item.disabled}
      <img src={item.hoveredLogo} alt={item.heading} />
    {:else if isRouteActive && item.selectedLogo}
      <img src={item.selectedLogo} alt={item.heading} />
    {:else}
      <img src={item.defaultLogo} alt={item.heading} />
    {/if}
  </div>
</button>

{#if showModal}
  <div
    bind:this={modalElement}
    class="position-fixed d-flex flex-column modal-background ps-3 pe-4 pt-3 pb-2"
    style="top: {buttonPosition.top -
      modalPostion?.height +
      25}px; left: {buttonPosition.left +
      buttonPosition.width +
      20}px; font-size: 14px; font-weight: 400;"
  >
    <div class="d-flex align-items-center mb-2">
      <div
        class="bg-white rounded-5 me-2 border-2 border-defaultColor"
        style="height: 36px; width: 36px;"
      ></div>
      <div class="d-flex flex-column">
        <div>{user?.name}</div>
        <div class="text-secondary-200">{user?.email}</div>
      </div>
    </div>
    <button
      class="border-0 bg-transparent d-flex align-items-center px-2 py-1 sign-out-button"
      ><SignOutIcon size={16} /> <span class="ms-2">Sign Out</span></button
    >
  </div>
{/if}

<style>
  .sidebar-item img {
    height: 20px;
    width: 20px;
  }

  .sidebar-item {
    position: relative;
    padding-left: 12px; /* Initial padding */
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    transition:
      background-color 0.55s ease,
      padding 0.55s ease;
  }

  .sidebar-item:hover {
    background-color: var(--nav-bar-hover-background);
    border-radius: 8px;
    opacity: 0.9;
    padding-left: 12px; /* Adds padding on hover */
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .sidebar-item :global(.active-link) {
    filter: brightness(0) saturate(100%) invert(68%) sepia(50%) saturate(1710%)
      hue-rotate(186deg) brightness(108%) contrast(101%);
  }

  .sidebar-item :global(.disabled) {
    pointer-events: none; /* Disable pointer events */
    opacity: 0.3; /* Optionally reduce opacity for visual indication */
  }

  .sidebar-item.disabled:hover {
    /* Prevent hover styles on disabled items */
    background-color: transparent;
    border: none;
  }

  .modal-background {
    background: #0b0b0b;
    backdrop-filter: blur(75px);
    border-radius: 5px;
  }

  .sign-out-button:hover {
    background-color: #22232e !important;
  }
</style>
