<script lang="ts">
  import { ThreeDotIcon } from "$lib/assets/app.asset";
  import { ShowMoreOptions } from "$lib/components";
  import type { CurrentTeam } from "$lib/utils/interfaces";
  import { formatDateInString } from "$lib/utils/workspacetimeUtils";
  import { onDestroy } from "svelte";
  import { navigate } from "svelte-navigator";

  export let workspace: any,
    handleWorkspaceSwitch: any,
    handleWorkspaceTab: any,
    currActiveTeam: CurrentTeam,
    openedTeam: CurrentTeam,
    activeSideBarTabMethods: any;
  let isShowMoreVisible = false;

  const handleShowMore = () => {
    isShowMoreVisible = !isShowMoreVisible;
  };
  const closeShowMore = () => {
    isShowMoreVisible = false;
  };

  const handleOpenCollection = () => {
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
      isShowMoreVisible = true;
    }, 100);
  };
  let menuItems = [
    {
      onClick: () => {
        handleOpenCollection();
        handleShowMore();
      },
      displayText: "Open Workspace",
      disabled: false,
    },
    {
      onClick: (e) => {
        e.stopPropagation();
      },
      displayText: "Rename Request",
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
</script>

<svelte:window
  on:click={closeShowMore}
  on:contextmenu|preventDefault={closeShowMore}
/>
<div
  class="flex-grow-1 col-5 pb-4"
  on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
>
  <div
    class="bg-black workspace-card rounded position-relative p-4 position-relative"
    on:mouseleave={() => isShowMoreVisible && handleShowMore()}
    on:click={() => {
      !isShowMoreVisible
        ? handleOpenCollection()
        : isShowMoreVisible && handleShowMore();
    }}
  >
    <div class="d-flex justify-content-between">
      <h4>{workspace.name}</h4>
      <button
        class="border-0 my-auto show-more-btn rounded"
        on:click={(e) => {
          e.stopPropagation();
          handleShowMore();
        }}
      >
        <ThreeDotIcon />
      </button>
    </div>

    <ShowMoreOptions showMenu={isShowMoreVisible} {menuItems} />
    <p class="teams-workspace__para mb-1">
      <!-- <span>{workspace}</span> APIs <span class="px-1"></span> -->
      <span>{workspace?.collections?.length ?? 0}</span> COLLECTIONS
    </p>
    <p class="teams-workspace__date mb-0">
      Last updated on <span>{formatDateInString(workspace?.createdAt)}</span>
    </p>
  </div>
</div>

<style>
  .workspace-card {
    z-index: 1 !important;
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
