<script lang="ts">
  import { MoreVerticalRegular } from "@sparrow/library/icons";
  import { Avatar, Button } from "@sparrow/library/ui";
  import { MenuView } from "@sparrow/common/components";

  export let user: string;
  export let role: string;
  export let onWithDrawInvite;
  export let onResendInvite;
  export let openTeam;
  export let id;

  const handleWithDrawInvite = () => {
    onWithDrawInvite(openTeam?.teamId, user);
  };
  const handleResendInvite = () => {
    onResendInvite(openTeam?.teamId, user);
  };

  let pos = { x: 0, y: 0 };
  let showMenu = false;
  let menuWrapper: HTMLElement;

  let menuItems = [
    {
      onClick: () => {
        handleWithDrawInvite();
        closeContextMenu();
      },
      displayText: "Withdraw Invite",
      disabled: false,
    },
    {
      onClick: () => {
        handleResendInvite();
        closeContextMenu();
      },
      displayText: "Resend Invite",
      disabled: false,
    },
  ];

  let noOfColumns = 150;
  let noOfRows = 2;
  let isNearBottom = false;

  // Unique ID for this row based on index
  const rowId = `invite-row-${id}`;

  const openMenu = (e: MouseEvent) => {
    e.stopPropagation();

    // Close other menus
    const customEvent = new CustomEvent("closeAllMenus", {
      detail: { exceptRowId: rowId },
    });
    window.dispatchEvent(customEvent);

    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    const viewportHeight = window.innerHeight;

    isNearBottom = viewportHeight - buttonRect.bottom < 150 ? true : false;

    pos = {
      x: buttonRect.left - 142 + buttonRect.width / 2,
      y: buttonRect.top + 2 * buttonRect.height + -buttonRect.height,
    };

    showMenu = true;
  };

  function closeContextMenu() {
    showMenu = false;
  }

  function handleCloseAllMenus(e: CustomEvent) {
    if (e.detail.exceptRowId !== rowId) {
      showMenu = false;
    }
  }
</script>

<svelte:window
  on:click={closeContextMenu}
  on:contextmenu|preventDefault={closeContextMenu}
  on:closeAllMenus={handleCloseAllMenus}
/>

{#if showMenu}
  <MenuView xAxis={pos.x} yAxis={pos.y} {noOfRows} {noOfColumns} {menuItems} />
{/if}

<div
  id={rowId}
  tabindex="0"
  class="position-relative invite-row-item cursor-pointer ellipsis d-flex"
>
  <div class="user-info ellipsis ps-2" style="width: 70%;">
    <div class="d-flex w-100 align-items-center gap-2 ellipsis">
      <Avatar
        size="medium"
        bgColor={"var(--bg-tertiary-700)"}
        type={"letter"}
        letter={user[0].toUpperCase() || ""}
      />
      <p class="ellipsis mb-0" style="width: calc(100% - 200px);">
        {user}
      </p>
    </div>
  </div>

  <div class="role-info" style="width: 20%;">
    {role.charAt(0).toUpperCase() + role.slice(1)}
  </div>

  <div class="position-relative d-flex justify-content-end" style="width: 10%;">
    <div bind:this={menuWrapper} class="button-container pe-5">
      <Button
        type="teritiary-regular"
        startIcon={MoreVerticalRegular}
        onClick={openMenu}
      />
    </div>
  </div>
</div>

<style>
  .invite-row-item {
    width: 100%;
    height: 50px;
    align-items: center;
    border-bottom: 1px solid var(--bg-ds-surface-600);
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .invite-row-item:hover {
    background-color: var(--bg-ds-surface-600);
    cursor: pointer;
  }

  .invite-row-item:active {
    background-color: var(--bg-ds-surface-700);
  }

  .invite-row-item:focus-visible {
    outline: solid 2px var(--bg-ds-primary-300) !important;
    outline-offset: -2px;
    background-color: var(--bg-ds-surface-700);
  }

  .user-info {
    color: var(--bg-ds-neutral-300);
    display: flex;
    align-items: center;
  }

  .role-info {
    color: var(--bg-ds-neutral-100);
    font-weight: 600;
  }

  .invite-row-item:hover .button-container {
    visibility: visible;
  }
  .button-container {
    position: relative;
  }
</style>
