<script>
  import { ThreeDotIcon } from "$lib/assets/app.asset";
  import UserProfileList from "$lib/components/profile/UserProfileList.svelte";
  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";

  export let list;
  export let currOpenedTeamRxDoc;
  export let handleOpenCollection;
  export let calculateTimeDifferenceInDays;
  export let WorkspaceMemberRole;
  export let userType = "";

  let pos = { x: 0, y: 0 };
  let showMenu = false;

  let menuItems = [];
  let noOfColumns = 180;
  let noOfRows = 3;
  const rightClickContextMenu = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      pos = { x: mouseX, y: mouseY };
      showMenu = true;
    }, 100);
  };
  $: {
    if (userType === "owner" || userType === "admin") {
      menuItems = [
        {
          onClick: () => {
            handleOpenCollection(list);
          },
          displayText: "Open Workspace",
          disabled: false,
        },
        {
          onClick: (e) => {
            e.stopPropagation();
          },
          displayText: "Add Members",
          disabled: false,
        },
        {
          onClick: (e) => {
            e.stopPropagation();
          },
          displayText: "Delete",
          disabled: false,
        },
      ];
    } else {
      menuItems = [
        {
          onClick: () => {
            handleOpenCollection(list);
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
  <RightOption
    xAxis={pos.x}
    yAxis={pos.y}
    {noOfRows}
    {noOfColumns}
    {menuItems}
  />
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
      handleOpenCollection(list);
    }}
    style="max-width: 15vw; padding-right: 10px;"
    class="tab-data rounded-start py-3 overflow-hidden ellipsis"
    >{list?.name}</td
  >

  <td
    on:click={(e) => {
      e.stopPropagation();
      handleOpenCollection(list);
    }}
    class="tab-data py-3"
    >{list?.collections?.length ? list.collections.length : 0}</td
  >
  {#if $currOpenedTeamRxDoc?._data?.users?.length > 1}
    <td
      on:click={(e) => {
        e.stopPropagation();
        handleOpenCollection(list);
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
      handleOpenCollection(list);
    }}
    class="tab-data py-3"
    >{calculateTimeDifferenceInDays(new Date(), new Date(list?.createdAt))}</td
  >
  <td class="tab-data rounded-end py-3">
    <button
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
    background-color: var(--background-light);
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
    background-color: var(--workspace-hover-color);
  }
</style>
