<script lang="ts" context="module">
  import type { Observable } from "rxjs";
  import { Avatar } from "@sparrow/library/ui";

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
  import { SignOutIconRegular } from "@sparrow/library/icons";
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
    placement="bottom-right"
    distance={10}
    zIndex={205}
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
          <Avatar type="letter" size="small" letter={user?.name[0]} bgColor="var(--icon-ds-secondary-400)" />
        {:else if isRouteActive && item.selectedLogo}
          <Avatar type="letter" size="small" letter={user?.name[0]} bgColor="var(--icon-ds-secondary-400)" />
        {:else}
          <Avatar type="letter" size="small" letter={user?.name[0]} bgColor="var(--icon-ds-secondary-400)" />
        {/if}
      </div>
    </button>

    <div
      bind:this={modalElement}
      class=" position-fixed d-flex flex-column modal-background p-1 {showProfileModal
        ? ''
        : 'd-none'}"
      style="right:10px; top:47px; font-size: 12px; font-weight: 400; min-width: 200px; z-index: 500; display:flex; flex-direction:column;gap:4px; background-color:var(--bg-ds-surface-600);"
    >
      <div class="align-items-center py-1 px-2 profile-item" style="display: flex; gap:8px">
        <Avatar type="letter" size="small" letter={user?.name[0]} bgColor="var(--icon-ds-secondary-400)" />
        <div class="d-flex flex-column ms-1">
          <div class="ellipsis" style="max-width: 200px; font-weight: 500;">
            {user?.name}
          </div>
          <div style="max-width: 200px;color:var(--text-ds-neutral-300)" class="ellipsis">
            {user?.email}
          </div>
        </div>
      </div>

      <button
        class="border-0 bg-transparent d-flex align-items-center sign-out-button"
        style="border-radius: 3px;padding: 7px 12px;"
        on:click={onLogout}
        >
        <SignOutIconRegular size={"16px"} color="var(--icon-ds-nuetral-50)" />
         <span class="ms-3">Sign Out</span></button
      >
    </div>
  </Tooltip>
{/if}

<style>
  .sidebar-item img {
    height: 20px;
    width: 20px;
  }
  .modal-background {
    backdrop-filter: blur(75px);
    border-radius: 5px;
    background-color: var(--bg-ds-surface-600);
  }

  .sign-out-button:hover {
    background-color: var(--bg-ds-surface-400) !important;
  } /* CardBody+BlurEffects */
  .profile-item:hover{
     background-color: var(--bg-ds-surface-400) !important;
  }
</style>
