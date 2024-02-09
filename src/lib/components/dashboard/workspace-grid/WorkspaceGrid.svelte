<script lang="ts">
  import { ThreeDotIcon } from "$lib/assets/app.asset";
  import { ShowMoreOptions } from "$lib/components";
  import type { CurrentTeam } from "$lib/utils/interfaces";
  import { formatDateInString } from "$lib/utils/workspacetimeUtils";
  import { onDestroy } from "svelte";
  import { navigate } from "svelte-navigator";
  import Card from "../card/Card.svelte";

  export let workspace: any;
  export let handleWorkspaceSwitch: any;
  export let handleWorkspaceTab: any;
  export let currActiveTeam: CurrentTeam;
  export let openedTeam: CurrentTeam;
  export let activeSideBarTabMethods: any;
  export let isAdminOrOwner: boolean;
  let isShowMoreVisible = false;
  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;
  let containerRef;
  const handleShowMore = () => {
    isShowMoreVisible = !isShowMoreVisible;
  };
  const closeShowMore = () => {
    isShowMoreVisible = false;
  };

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
  const rightClickContextMenu = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const containerRect = containerRef?.getBoundingClientRect();
      const mouseX = e.clientX - (containerRect?.left || 0);
      const mouseY = e.clientY - (containerRect?.top || 0);
      pos = { x: mouseX, y: mouseY + 20 };
      showMenu = true;
      isShowMoreVisible = true;
    }, 100);
  };
  let menuItems = [
    {
      onClick: () => {
        handleOpenWorkspace();
        handleShowMore();
      },
      displayText: "Open Workspace",
      disabled: false,
      visible: true,
    },
    {
      onClick: (e) => {
        e.stopPropagation();
      },
      displayText: "Add Members",
      disabled: false,
      visible: isAdminOrOwner,
    },
    {
      onClick: (e) => {
        e.stopPropagation();
      },
      displayText: "Delete",
      disabled: false,
      visible: isAdminOrOwner,
    },
  ];
</script>

<svelte:window
  on:click={closeShowMore}
  on:contextmenu|preventDefault={closeShowMore}
/>
<Card
  cardClassProp={"flex-grow-1 col-lg-5 col-md-10 pb-4"}
  cardStyleProp={"max-width: 47.5%; max-height: 32%;"}
  onContextMenu={(e) => rightClickContextMenu(e)}
>
  <div
    class="bg-black workspace-card rounded p-4 {isShowMoreVisible &&
      'position-relative '}"
    on:mouseleave={() => isShowMoreVisible && handleShowMore()}
    on:click={() => {
      !isShowMoreVisible
        ? handleOpenWorkspace()
        : isShowMoreVisible && handleShowMore();
    }}
  >
    <div class="d-flex overflow-hidden justify-content-between">
      <h4 class="ellipsis overflow-hidden">{workspace.name}</h4>
      <button
        class="border-0 my-auto show-more-btn {isShowMoreVisible &&
          'bg-plusButton'} rounded"
        on:click={(e) => {
          e.stopPropagation();
          handleShowMore();
        }}
      >
        <ThreeDotIcon />
      </button>
    </div>

    <ShowMoreOptions
      showMenu={isShowMoreVisible}
      {menuItems}
      topDistance={pos.y}
      leftDistance={pos.x}
    />
    <p class="teams-workspace__para mb-1">
      <!-- <span>{workspace}</span> APIs <span class="px-1"></span> -->
      <span>{workspace?.collections?.length ?? 0}</span> COLLECTIONS
    </p>
    <p class="teams-workspace__date mb-0">
      Last updated on <span>{formatDateInString(workspace?.createdAt)}</span>
    </p>
  </div>
</Card>

<style>
  @media only screen and (max-width: 1000px) {
    .workspace-card-container {
      max-width: 100% !important;
    }
  }
  .workspace-card {
    z-index: 0 !important;
  }
  .workspace-card:hover {
    background-color: #313233 !important;
  }
  .workspace-card:hover .teams-workspace__para,
  .workspace-card:hover .teams-workspace__date {
    color: #999 !important;
  }
  .show-more-btn {
    visibility: hidden;
    background-color: transparent;
  }
  .show-more-btn:hover {
    background-color: var(--blackColor);
  }
  .show-more-btn:active {
    background-color: var(--workspace-hover-color);
  }
  .remove-workspace-btn {
    padding: 4px 8px;
    background-color: var(--blackColor);
    color: var(--dangerColor);
  }

  .workspace-card:hover .show-more-btn {
    visibility: visible;
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
</style>
