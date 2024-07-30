<script lang="ts">
  import { ThreeDotIcon } from "$lib/assets/app.asset";
  import { UserProfileList } from "@teams/common/compopnents";
  import { MenuView } from "@teams/common/compopnents";
  import { TeamRole, WorkspaceMemberRole } from "$lib/utils/enums";

  export let list;
  export let activeTeam;
  export let onOpenCollection: (id: string) => void;
  export let calculateTimeDifferenceInDays;
  /**
   * Checks if the current user has admin or owner privileges.
   */
  export let isAdminOrOwner: boolean;
  export let onDeleteWorkspace;

  let pos = { x: 0, y: 0 };
  let showMenu = false;
  let workspaceTabWrapper: HTMLElement;


  let menuItems = [];
  let noOfColumns = 180;
  let noOfRows = 3;
  const rightClickContextMenu = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = workspaceTabWrapper.getBoundingClientRect().right - 15;
      const mouseY = workspaceTabWrapper.getBoundingClientRect().top + 28;
      pos = { x: mouseX, y: mouseY };
      showMenu = true;
    }, 100);
  };
  $: {
    if (isAdminOrOwner) {
      menuItems = [
        {
          onClick: () => {
            onOpenCollection(list._id);
          },
          displayText: "Open Workspace",
          disabled: false,
        },
        {
          onClick: () => {
            onDeleteWorkspace(list);
          },
          displayText: "Delete Workspace",
          disabled: false,
        },
      ];
    } else {
      menuItems = [
        {
          onClick: () => {
            onOpenCollection(list._id);
          },
          displayText: "Open Workspace",
          disabled: false,
        },
      ];
    }
  }

  function closeRightClickContextMenu() {
    showMenu = false;
  }
</script>

{#if showMenu}
  <MenuView xAxis={pos.x} yAxis={pos.y} {noOfRows} {noOfColumns} {menuItems} />
{/if}

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>

<tr
  class="position-relative workspace-list-item cursor-pointer ellipsis"
  on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
>
  <td
    on:click={(e) => {
      e.stopPropagation();
      onOpenCollection(list._id);
    }}
    style="max-width: 15vw; padding-right: 10px;"
    class="tab-data rounded-start py-3 overflow-hidden ellipsis"
    >{list?.name}</td
  >

  <td
    on:click={(e) => {
      e.stopPropagation();
      onOpenCollection(list._id);
    }}
    class="tab-data py-3"
    >{list?.collections?.length ? list.collections.length : 0}</td
  >
  {#if activeTeam?.users?.length > 1}
    <td
      on:click={(e) => {
        e.stopPropagation();
        onOpenCollection(list._id);
      }}
      class="tab-data py-3"
    >
      <div class="d-flex">
        <UserProfileList
          width={24}
          height={25}
          borderRadius={24}
          users={list?.users?.filter(
            (user) =>
              user.role === WorkspaceMemberRole.ADMIN ||
              user.role === WorkspaceMemberRole.EDITOR,
          )}
          maxProfiles={3}
          classProp="position-absolute"
        />
      </div>
    </td>
  {/if}
  <td
    on:click={(e) => {
      e.stopPropagation();
      onOpenCollection(list._id);
    }}
    class="tab-data py-3"
    >{calculateTimeDifferenceInDays(new Date(), new Date(list?.updatedAt))}</td
  >
  <td class="tab-data rounded-end py-3">
    <button
    bind:this={workspaceTabWrapper}
      class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center position-relative {showMenu
        ? 'threedot-active'
        : ''}"
      on:click={(e) => {
        rightClickContextMenu(e);
      }}
    >
      <ThreeDotIcon />
    </button>
  </td>
</tr>

<style>
  tr:hover {
    background-color: var(--bg-tertiary-600);
  }
  .workspace-list-item td {
    background-color: transparent;
  }
  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }
  tr:hover .threedot-icon-container {
    visibility: visible;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-190);
  }
  .tab-data {
    font-size: 12px;
    font-weight: 700;
    line-height: 18px;
  }
</style>
