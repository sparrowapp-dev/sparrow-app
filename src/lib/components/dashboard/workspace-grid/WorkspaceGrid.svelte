<script lang="ts">
  import { ThreeDotIcon } from "$lib/assets/app.asset";
  import type { CurrentTeam } from "$lib/utils/interfaces";
  import { formatDateInString } from "$lib/utils/workspacetimeUtils";
  import { onDestroy } from "svelte";
  import { navigate } from "svelte-navigator";
  import Card from "../card/Card.svelte";
  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";

  export let workspace: any;
  export let handleWorkspaceSwitch: any;
  export let handleWorkspaceTab: any;
  export let currActiveTeam: CurrentTeam;
  export let openedTeam: CurrentTeam;
  export let activeSideBarTabMethods: any;
  export let isAdminOrOwner: boolean;
  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;

  let menuItems = [];
  const handleOpenWorkspace = () => {
    handleWorkspaceSwitch(
      workspace._id,
      workspace.name,
      openedTeam.id,
      openedTeam.name,
    );
    handleWorkspaceTab(workspace._id, workspace.name, workspace.description);
    navigate("/dashboard/collections");
    activeSideBarTabMethods.updateActiveTab("collections");
  };
  const handleWindowClick = (event) => {};

  window.addEventListener("click", handleWindowClick);

  onDestroy(() => {
    window.removeEventListener("click", handleWindowClick);
  });
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
    if (isAdminOrOwner) {
      menuItems = [
        {
          onClick: () => {
            handleOpenWorkspace();
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
            handleOpenWorkspace();
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

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>
{#if showMenu}
  <RightOption
    xAxis={pos.x}
    yAxis={pos.y}
    {noOfRows}
    {noOfColumns}
    {menuItems}
  />
{/if}

<div class="workspace-card-outer w-100">
  <Card
    cardClassProp={"flex-grow-1 col-lg-5 col-md-10 mb-4 position-relative"}
    cardStyleProp={"max-width: 47.5%; max-height: 32%;"}
  >
    <button
      class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center position-absolute {showMenu
        ? 'threedot-active'
        : ''}"
      style="top:15px;
      right:15px;"
      on:click={(e) => rightClickContextMenu(e)}
    >
      <ThreeDotIcon />
    </button>
    <div
      class="bg-black workspace-card rounded p-4"
      on:click={() => {
        handleOpenWorkspace();
      }}
      style={`${
        showMenu ? "background-color: var(--border-color) !important;" : null
      }`}
      on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    >
      <div class="d-flex overflow-hidden justify-content-between">
        <h4 class="ellipsis overflow-hidden me-4">{workspace.name}</h4>
      </div>
      <p
        class="teams-workspace__para mb-1"
        style={`${
          showMenu ? "color: var(--sparrow-text-color) !important;" : null
        }`}
      >
        <span>{workspace?.collections?.length ?? 0}</span> COLLECTIONS
      </p>
      <p
        class="teams-workspace__date mb-0"
        style={`${
          showMenu ? "color: var(--sparrow-text-color) !important;" : null
        }`}
      >
        Last updated on <span>{formatDateInString(workspace?.createdAt)}</span>
      </p>
    </div>
  </Card>
</div>

<style>
  .workspace-card-outer {
    display: contents;
  }
  .workspace-card-outer:hover .workspace-card {
    background-color: var(--border-color) !important;
  }
  .workspace-card {
    z-index: 0 !important;
  }
  .workspace-card-outer:hover .workspace-card .teams-workspace__para,
  .workspace-card-outer:hover .workspace-card .teams-workspace__date {
    color: var(--sparrow-text-color) !important;
  }
  .teams-workspace__para {
    font-size: 12px;
    color: #45494d;
  }
  .teams-workspace__para span {
    color: #85c2ff;
    font-size: 16px;
  }
  .teams-workspace__date {
    color: #45494d;
    font-size: 16px;
  }
  .teams-workspace__date span {
    font-size: 14px;
    color: white;
  }
  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }
  .workspace-card-outer:hover .threedot-icon-container {
    visibility: visible;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--workspace-hover-color);
  }
</style>
