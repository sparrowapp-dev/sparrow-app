<script lang="ts" context="module">
  import type { Observable } from "rxjs";

  export type UserProfileObj = {
    heading: string;
    defaultLogo: any;
    hoveredLogo?: any;
    selectedLogo?: any;
    disabled: boolean;
    user: Observable<{ name: string; email: string }>;
  };
  export let isGuestUser = false;
</script>

<script lang="ts">
  import { SignOutIcon } from "@sparrow/library/icons";
  import { afterUpdate, onMount } from "svelte";
  import { Tooltip } from "@sparrow/library/ui";
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
  export let showProfileModal = false;
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
        showProfileModal = false;
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

{#if !isGuestUser}
  <Tooltip
    title="Profile"
    placement="bottom"
    distance={20}
    zIndex={5}
    show={!showProfileModal}
  >
    <button
      bind:this={buttonElement}
      class="sidebar-item d-flex align-items-center justify-content-center border-radius-4 bg-transparent border-0"
      class:disabled={item.disabled}
      class:hover={!item.disabled && isHovered}
      on:mouseenter={() => (isHovered = true)}
      on:mouseleave={() => (isHovered = false)}
      on:click={(e) => {
        showProfileModal = !showProfileModal;
      }}
    >
      <div class="d-flex align-iems-center justify-content-center">
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
      class=" position-fixed d-flex flex-column modal-background ps-2 pe-2 pt-3 pb-2 {showProfileModal
        ? ''
        : 'd-none'}"
      style="right:10px; top:47px; font-size: 12px; font-weight: 400; min-width: 200px; z-index: 500;"
    >
      <div class="d-flex align-items-center mb-2 px-1">
        <div
          class="rounded-5 me-2 border border-defaultColor d-flex justify-content-center align-items-center"
          style="height: 32px; width: 32px;"
        >
          {user?.name[0]}
        </div>
        <div class="d-flex flex-column ms-1">
          <div class="ellipsis" style="max-width: 200px; ">
            {user?.name}
          </div>
          <div style="max-width: 200px; " class="text-secondary-200 ellipsis">
            {user?.email}
          </div>
        </div>
      </div>

      <button
        class="border-0 bg-transparent d-flex align-items-center px-2 py-1 sign-out-button"
        style="border-radius: 3px;"
        on:click={onLogout}
        ><SignOutIcon size={16} /> <span class="ms-2">Sign Out</span></button
      >
    </div>
  </Tooltip>
{/if}

<style>
  .sidebar-item img {
    height: 20px;
    width: 20px;
  }

  .sidebar-item {
    position: relative;
    height: 41px;
    width: 41px;
  }

  .sidebar-item:hover {
    background-color: var(--nav-bar-hover-background) !important;
    opacity: 0.9;
  }

  .modal-background {
    backdrop-filter: blur(75px);
    border-radius: 5px;
    background-color: var(--bg-tertiary-700);
  }

  .sign-out-button:hover {
    background-color: var(--bg-tertiary-500) !important;
  } /* CardBody+BlurEffects */
</style>
