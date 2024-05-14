<script lang="ts" context="module">
  import type { Observable } from "rxjs";

  export type SidebarProfileObj = {
    heading: string;
    defaultLogo: any;
    hoveredLogo?: any;
    selectedLogo?: any;
    disabled: boolean;
    user: Observable<{ name: string; email: string }>;
  };
</script>

<script lang="ts">
  import SignOutIcon from "./SignOutIcon.svelte";
  import { afterUpdate, onMount } from "svelte";
  import ShowMore from "$lib/components/dropdown/ShowMore.svelte";
  import Showmore from "$lib/assets/showmore.svelte";

  /**
   * List of side bar Items
   */
  export let item: SidebarProfileObj;
  export let onLogout: () => void;
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

    item.user.subscribe((value) => {
      if (value) {
        user = { name: value.name, email: value.email };
      }
    });

    document.addEventListener("click", (e) => {
      if (buttonElement && !buttonElement.contains(e.target as Node)) {
        showModal = false;
      }
    });

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

<div
  bind:this={modalElement}
  class="position-fixed d-flex flex-column modal-background ps-2 pe-2 pt-3 pb-2 {showModal
    ? ''
    : 'd-none'}"
  style="top: {buttonPosition?.top -
    modalPostion?.height +
    20}px; left: {buttonPosition?.left +
    buttonPosition?.width +
    10}px; font-size: 12px; font-weight: 400; min-width: 200px; z-index: 10000;"
>
  <div class="d-flex align-items-center mb-2 px-1">
    <div
      class="rounded-5 me-2 border border-defaultColor d-flex justify-content-center align-items-center"
      style="height: 32px; width: 32px;"
    >
      {user?.name[0]}
    </div>
    <div class="d-flex flex-column ms-1">
      <div>{user?.name}</div>
      <div class="text-secondary-200">{user?.email}</div>
    </div>
  </div>
  <button
    class="border-0 bg-transparent d-flex align-items-center px-2 py-1 sign-out-button"
    style="border-radius: 3px;"
    on:click={onLogout}
    ><SignOutIcon size={16} /> <span class="ms-2">Sign Out</span></button
  >
</div>

<style>
  * {
    transition: all 300ms ease;
  }
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
    backdrop-filter: blur(75px);
    border-radius: 5px;
    background: var(--bg-secondary-250);
  }

  .sign-out-button:hover {
    background-color: #22232e !important;
  } /* CardBody+BlurEffects */
</style>
