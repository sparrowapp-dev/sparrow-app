<script lang="ts">
  import { ThreeDotIcon } from "@sparrow/library/assets";
  import { UserProfileList } from "@sparrow/teams/compopnents";
  import { MenuView } from "@sparrow/common/components";
  import {
    TeamRole,
    WorkspaceMemberRole,
    WorkspaceType,
  } from "@sparrow/common/enums";
  import { Button, Tag } from "@sparrow/library/ui";
  import {
    GlobeRegular,
    LockClosedRegular,
    MoreVerticalRegular,
  } from "@sparrow/library/icons";

  export let list;
  export let activeTeam;
  export let onOpenCollection: (id: string) => void;
  export let calculateTimeDifferenceInDays: (
    date1: Date,
    date2: Date,
  ) => string;
  export let onAddMember: (params: {
    workspaceID: string;
    workspaceName: string;
    users: any[];
  }) => void;
  export let isAdminOrOwner: boolean;
  export let onDeleteWorkspace: (workspace: any) => void;
  export let openInDesktop: (workspaceID: string) => void;
  export let isWebEnvironment: boolean;
  let pos = { x: 0, y: 0 };
  let showMenu = false;
  let workspaceTabWrapper: HTMLElement;

  let menuItems = [];
  let noOfColumns = 180;
  let noOfRows = 3;

  const rightClickContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = workspaceTabWrapper.getBoundingClientRect().right;
      const mouseY = workspaceTabWrapper.getBoundingClientRect().top + 60;
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
            onAddMember({
              workspaceID: list._id,
              workspaceName: list.name,
              users: list.users,
            });
          },
          displayText: "Add Members",
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
  tabindex="0"
  class="position-relative workspace-list-item cursor-pointer ellipsis"
  on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
>
  <td
    on:click={(e) => {
      e.stopPropagation();
      onOpenCollection(list._id);
    }}
    style="max-width: 15vw; padding-right: 10px;"
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium rounded-start py-2 overflow-hidden ellipsis"
  >
    {list?.name}
    {#if list?.isNewInvite}
      <span
        style="font-size:12px; font-weight:700; color:var(--text-primary-300); margin-left:6px"
        >NEW</span
      >
    {/if}
  </td>

  <td
    on:click={(e) => {
      e.stopPropagation();
      onOpenCollection(list._id);
    }}
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2 px-4"
  >
    {list?.collections?.length ? list.collections.length : 0}
  </td>

  {#if activeTeam?.users?.length > 1}
    <td
      on:click={(e) => {
        e.stopPropagation();
        onOpenCollection(list._id);
      }}
      class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2"
    >
      <div class="d-flex px-3">
        <UserProfileList
          width={24}
          height={25}
          borderRadius={24}
          users={list?.users?.filter(
            (user) =>
              user.role === WorkspaceMemberRole.ADMIN ||
              user.role === WorkspaceMemberRole.EDITOR,
          )}
          maxProfiles={2}
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
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2 px-4"
  >
    {calculateTimeDifferenceInDays(new Date(), new Date(list?.updatedAt))}
  </td>

  <td
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2 position-relative"
  >
    {#if list?.workspaceType === WorkspaceType.PUBLIC}
      <Tag text={WorkspaceType.PUBLIC} type="green" endIcon={GlobeRegular} />
    {:else}
      <Tag
        text={WorkspaceType.PRIVATE}
        type="cyan"
        endIcon={LockClosedRegular}
      />
    {/if}
  </td>

  <td
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium py-2 position-relative"
  >
    {#if isWebEnvironment && !list?.isShared}
      <button
        class="open-desktop-btn border-0 rounded d-flex justify-content-center align-items-center text-decoration-underline"
        on:click|stopPropagation={() => {
          openInDesktop(list._id);
        }}
      >
        Open in Desktop
      </button>
    {/if}
  </td>

  <td
    class="tab-data text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium rounded-end py-2"
  >
    <div
      bind:this={workspaceTabWrapper}
      class="threedot-icon-container"
      style="display: flex; justify-content: center; align-items: center;"
    >
      <Button
        type="teritiary-regular"
        onClick={(e) => {
          rightClickContextMenu(e);
        }}
        startIcon={MoreVerticalRegular}
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

  .workspace-list-item td {
    background-color: transparent;
  }
  .threedot-icon-container {
    visibility: visible;
    pointer-events: none;
    transition:
      visibility 0.3s ease,
      opacity 0.3s ease;
  }

  tr:hover .threedot-icon-container {
    visibility: visible;
    pointer-events: auto;
  }

  .tab-data {
    vertical-align: middle;
    padding-top: 10px;
  }
  .open-desktop-btn {
    /* position: absolute; */
    /* top: 50%; */
    /* right: 30px; */
    /* transform: translateY(-50%); */
    font-size: 12px;
    background-color: var(--color-primary);
    color: #3670f7;
    padding: 5px 10px;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.3s ease,
      visibility 0.3s;
  }
  tr:hover .open-desktop-btn {
    visibility: visible;
    opacity: 1;
  }
  .open-desktop-btn:hover {
    background-color: var(--color-primary-dark);
  }
  tr {
    border-radius: 8px;
  }
</style>
