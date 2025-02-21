<script lang="ts">
  import { ThreeDotIcon } from "@sparrow/library/assets";
  import { UserProfileList } from "@sparrow/teams/compopnents";
  import { MenuView } from "@sparrow/teams/compopnents";
  import { TeamRole, WorkspaceMemberRole } from "@sparrow/common/enums";
  import { Button } from "@sparrow/library/ui";
  import { Dropdown } from "@sparrow/library/ui";

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
      const mouseY = workspaceTabWrapper.getBoundingClientRect().top + 30;
      pos = { x: mouseX, y: mouseY };
      showMenu = true;
    }, 100);
  };

  let isDropdownVisible = false;
  let isDropdownHovered = false;
  
  let dropdownOptions = [];
  
  $: {
    if (isAdminOrOwner) {
      dropdownOptions = [
        {
          name: "Open Workspace",
          color: "var(--text-secondary-100)",
          onclick: () => onOpenCollection(list._id),
        },
        {
          name: "Add Members",
          color: "var(--text-secondary-100)",
          onclick: () => onAddMember({
            workspaceID: list._id,
            workspaceName: list.name,
            users: list.users,
          }),
        },
        {
          name: "Delete Workspace",
          color: "var(--text-secondary-100)",
          onclick: () => onDeleteWorkspace(list),
        },
      ];
    } else {
      dropdownOptions = [
        {
          name: "Open Workspace",
          color: "var(--text-secondary-100)",
          onclick: () => onOpenCollection(list._id),
        },
      ];
    }
  }

  function getDropdownPosition(buttonElement: HTMLElement) {
    if (!buttonElement) return { top: 0, left: 0 };
    
    const rect = buttonElement.getBoundingClientRect();
    const top = rect.bottom + 5; // 5px offset from button
    const left = rect.left;      // Align with button's left edge
    
    return { top, left };
  }

  function closeRightClickContextMenu() {
    showMenu = false;
  }
</script>

{#if showMenu}
  <!-- <MenuView xAxis={pos.x} yAxis={pos.y} {noOfRows} {noOfColumns} {menuItems} /> -->
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
    class="tab-data rounded-start py-3  overflow-hidden ellipsis"
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
    class="tab-data py-3 px-4"
  >
    {list?.collections?.length ? list.collections.length : 0}
  </td>

  {#if activeTeam?.users?.length > 1}
    <td
      on:click={(e) => {
        e.stopPropagation();
        onOpenCollection(list._id);
      }}
      class="tab-data py-3"
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
    class="tab-data py-3 px-4"
  >
    {calculateTimeDifferenceInDays(new Date(), new Date(list?.updatedAt))}
  </td>

  <td class="tab-data py-3 position-relative">
    {#if isWebEnvironment}
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

  <td class="tab-data rounded-end py-3"
  >
  <div class="threedot-icon-container" style="display: flex; justify-content: center; align-items: center;">
      <Dropdown
        buttonId="workspace-dropdown-{list._id}"
        bind:isMenuOpen={isDropdownVisible}
        horizontalPosition="right"
        minWidth={175}
        options={dropdownOptions}
        menuPosition={getDropdownPosition(document.getElementById(`workspace-dropdown-{list._id}`))}
      >
        <div style="transform: rotate(90deg);">
          <button
            on:mouseenter={() => {
              isDropdownHovered = true;
            }}
            on:mouseleave={() => {
              isDropdownHovered = false;
            }}
            id="workspace-dropdown-{list._id}"
            class="border-0 pt-0 border-radius-4"
            style="background-color: transparent; height:24px; width:24px;"
            on:click={() => {
              isDropdownVisible = !isDropdownVisible;
            }}
          >
            <ThreeDotIcon
              color={isDropdownVisible || isDropdownHovered
                ? "var(--icon-ds-primary-300)"
                : "var(--icon-secondary-100)"}
              width="16px"
              height="16px"
            />
          </button>
        </div>
      </Dropdown>
    </div>

  </td>
</tr>

<style>

  tr:hover {
    background-color: var(--bg-ds-surface-600);
    cursor: pointer;
    border-bottom-color: transparent;
  }
  tr{
    border-bottom-style: solid;
    border-bottom-color:var(--bg-ds-surface-600);
    border-bottom-width: 1px;
  }
  tr:active {
    background-color: var(--bg-ds-surface-600);
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
    background-color: transparent;
    z-index: 2;
    transform: rotate(90deg);
    outline: none;
  }
  tr:hover .threedot-icon-container {
    visibility: visible;
  }

  .tab-data {
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    vertical-align: middle;
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
  tr{
    border-radius: 8px;
  }
</style>
