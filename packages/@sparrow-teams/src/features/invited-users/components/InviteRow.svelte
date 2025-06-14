<script lang="ts">
  import { MoreVerticalRegular } from "@sparrow/library/icons";
  import { Avatar, Button } from "@sparrow/library/ui";
  import { MenuView } from "@sparrow/common/components";

  export let user: string;
  export let role: string;
  export let index: number;
  export let onWithDrawInvite;
  export let onResendInvite;
  export let openTeam;

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
  const rowId = `invite-row-${index}`;

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
      x: buttonRect.left - 142 + (buttonRect.width / 2),
      y:
        buttonRect.top +
        2*buttonRect.height + -buttonRect.height,
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

<tr
  id={rowId}
  tabindex="0"
  class="position-relative invite-row-item cursor-pointer ellipsis"
  style="width:100%"
>
  <td
    class="tab-data text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-regular rounded-start py-2 overflow-hidden ellipsis"
    style="color:var(--bg-ds-neutral-300);"
  >
    <div class="flex flex-row align-items-center gap-2" style="display: flex;">
      <Avatar size="medium" />
      {user}
    </div>
  </td>

  <td> </td>
  <td> </td>
  <td> </td>

  <td
    class="tab-data text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-semi-bold py-2 pr-4"
    style="color:var(--bg-ds-neutral-100); "
  >
    {role.charAt(0).toUpperCase() + role.slice(1)}
  </td>

  <td class="position-relative">
    <div bind:this={menuWrapper} class="button-container">
      <Button
        type="teritiary-regular"
        startIcon={MoreVerticalRegular}
        onClick={openMenu}
      />
    </div>
  </td>
</tr>

<style>
  tr:hover {
    background-color: var(--bg-ds-surface-600);
    cursor: pointer;
    border-bottom-color: transparent;
  }

  tr {
    border-bottom-style: solid;
    border-bottom-color: var(--bg-ds-surface-600);
    border-bottom-width: 1px;
    border-radius: 8px;
    position: relative;
  }

  tr:active {
    background-color: var(--bg-ds-surface-700);
    cursor: pointer;
  }

  tr[tabindex="0"]:focus-visible {
    outline: solid 2px var(--bg-ds-primary-300) !important;
    outline-offset: -2px;
    background-color: var(--bg-ds-surface-700);
    border-radius: 8px;
  }

  .invite-row-item td {
    background-color: transparent;
  }

  .button-container {
    position: relative;
  }

  tr:hover .button-container {
    visibility: visible;
  }

  .tab-data {
    vertical-align: middle;
    padding-top: 10px;
    position: relative;
  }
</style>
