<script lang="ts">
  import { ThreeDotIcon } from "@sparrow/library/assets";
  import { formatDateInString } from "../../utils/workspacetimeUtils";
  import { onDestroy } from "svelte";
  import Card from "../card/Card.svelte";
  import MenuView from "../menu-view/MenuView.svelte";
  import { ArrowForward } from "@sparrow/library/icons";

  export let workspace: any;
  export let isAdminOrOwner: boolean;
  export let onSwitchWorkspace: (id: string) => void;
  export let onDeleteWorkspace;
  export let onAddMember;
  export let openInDesktop: (workspaceID: string) => void;
  export let isWebEnvironment: boolean;

  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;
  let workspaceTabWrapper: HTMLElement;
  let menuItems = [];
  let noOfColumns = 180;
  let noOfRows = 3;

  const handleOpenWorkspace = async () => {
    onSwitchWorkspace(workspace._id);
  };

  const handleWindowClick = (event) => {};

  window.addEventListener("click", handleWindowClick);

  onDestroy(() => {
    window.removeEventListener("click", handleWindowClick);
  });

  const rightClickContextMenu = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = workspaceTabWrapper.getBoundingClientRect().right - 180;
      const mouseY = workspaceTabWrapper.getBoundingClientRect().top + 30;
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
          onClick: () => {
            onAddMember({
              workspaceID: workspace._id,
              workspaceName: workspace.name,
              users: workspace.users,
            });
          },
          displayText: "Add Members",
          disabled: false,
        },
        {
          onClick: () => {
            onDeleteWorkspace(workspace);
          },
          displayText: "Delete Workspace",
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
  <MenuView xAxis={pos.x} yAxis={pos.y} {noOfRows} {noOfColumns} {menuItems} />
{/if}

<div class="workspace-card-outer w-100">
  <Card
    cardClassProp={"flex-grow-1 col-lg-5 col-md-10 mb-4 position-relative"}
    cardStyleProp={"max-width: 47.5%; max-height: 32%;"}
  >
    <button
      bind:this={workspaceTabWrapper}
      class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center position-absolute {showMenu
        ? 'threedot-active'
        : ''}"
      style="top:26px; right:15px;"
      on:click={(e) => rightClickContextMenu(e)}
    >
      <ThreeDotIcon />
    </button>

    <div
      class="bg-tertiary-750 workspace-card p-4"
      on:click={() => {
        handleOpenWorkspace();
      }}
      style={`${
        showMenu ? "background-color: var(--bg-tertiary-600) !important;" : null
      }`}
      on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    >
      <div
        class="d-flex overflow-hidden justify-content-between"
        style={isWebEnvironment ? "width:calc(100% - 130px);" : ""}
      >
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
        Last updated on <span>{formatDateInString(workspace?.updatedAt)}</span>
      </p>

      {#if isWebEnvironment}
        <button
          class="me-2 open-desktop-btn border-0 rounded d-flex justify-content-center align-items-center text-decoration-underline"
          on:click|stopPropagation={() => {
            openInDesktop(workspace._id);
          }}
        >
          Open in Desktop
          <div class="arrow-up">
            <ArrowForward
              width={"19px"}
              height={"19px"}
              color={"var(--icon-primary-300)"}
            />
          </div>
        </button>
      {/if}
    </div>
  </Card>
</div>

<style lang="scss">
  .workspace-card-outer {
    display: contents;
  }

  .arrow-up {
    position: relative;
    top: -5px;
  }

  .workspace-card-outer:hover .workspace-card {
    background-color: var(--bg-tertiary-600) !important;
  }
  .workspace-card {
    z-index: 0 !important;
    border-radius: 8px;
  }
  .workspace-card-outer:hover .workspace-card .teams-workspace__para,
  .workspace-card-outer:hover .workspace-card .teams-workspace__date {
    color: var(--sparrow-text-color) !important;
  }
  .teams-workspace__para {
    font-size: 12px;
    color: var(--text-secondary-200);
  }
  .teams-workspace__para span {
    color: var(--text-primary-300);
    font-size: 16px;
  }
  .teams-workspace__date {
    color: var(--text-secondary-200);
    font-size: 16px;
  }
  .teams-workspace__date span {
    font-size: 14px;
    color: var(--text-secondary-110);
  }
  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }
  .workspace-card-outer:hover .threedot-icon-container {
    visibility: visible;
  }
  .threedot-icon-container:hover {
    background-color: var(--bg-tertiary-500) !important;
  }
  .threedot-icon-container:active {
    background-color: var(--bg-tertiary-800) !important;
  }
  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-800) !important;
  }

  .open-desktop-btn {
    position: absolute;
    top: 24px;
    right: 40px;
    font-size: 12px;
    font-weight: 500;
    background-color: var(--color-primary);
    color: #3670f7;
    padding: 5px 10px;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.3s ease,
      visibility 0.3s;
  }
  .workspace-card-outer:hover .open-desktop-btn {
    visibility: visible;
    opacity: 1;
  }
  .open-desktop-btn:hover {
    background-color: var(--color-primary-dark);
  }

  .workspace-delete-confirmation {
    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
    .btn-primary {
      background-color: var(--border-color);
    }

    .btn-primary:hover {
      color: var(--blackColor);
      background-color: var(--workspace-hover-color);
    }

    .btn-primary:active {
      color: var(--blackColor);
      background-color: var(--button-pressed);
    }

    .btn-secondary {
      background-color: var(--dangerColor);
    }

    .btn-secondary:hover {
      background-color: var(--delete-hover);
    }
    .team-icon {
      height: 24px;
      width: 24px;
    }
    .asterik {
      color: var(--dangerColor);
      margin-left: 4px;
    }
    .input-container {
      background-color: var(--background-dropdown);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color) !important;
      width: 100%;
    }
    .error-text {
      margin-top: 2px;
      margin-bottom: 0 !important;
      color: var(--error--color);
    }
    .error-border {
      border: 1px solid var(--error--color) !important;
    }
  }
</style>
