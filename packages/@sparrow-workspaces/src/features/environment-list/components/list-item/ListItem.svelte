<script lang="ts">
  import { dot3Icon as threedotIcon } from "@sparrow/library/assets";
  import { SelectIcon } from "@sparrow/library/assets";
  import { UntrackedItems } from "@sparrow/common/enums/item-type.enum";
  import { Spinner } from "@sparrow/library/ui";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { Options } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";
  import { WorkspaceRole } from "@sparrow/common/enums";

  /**
   * current workspace to identify the selected environment
   */
  export let currentWorkspace;

  /**
   * individual environment
   */
  export let env;

  /**
   * deletes the environment
   */
  export let onDeleteEnvironment;
  /**
   * updates the environment
   */
  export let onUpdateEnvironment;
  /**
   * opens the environment
   */
  export let onOpenEnvironment;
  /**
   * selects the environment
   */
  export let onSelectEnvironment;

  export let activeTabId;

  /**
   * Role of user in workspace
   */
  export let loggedUserRoleInWorkspace;

  let showMenu: boolean = false;
  let isEnvironmentPopup: boolean = false;
  let newEnvironmentName: string = "";
  let isRenaming = false;

  let noOfColumns = 180;
  let noOfRows = 4;
  function rightClickContextMenu(e) {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(
      `show-more-environment-${env?.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  const handleEnvironmentPopUpCancel = (flag) => {
    isEnvironmentPopup = flag;
  };

  const handleEnvironmentPopUpSuccess = async () => {
    const response = await onDeleteEnvironment(env);
    if (response.isSuccessful) {
      handleEnvironmentPopUpCancel(false);
    }
  };

  //open environment
  function openEnvironment() {
    onOpenEnvironment(env);
    showMenu = false;
  }

  const handleRenameInput = (event) => {
    newEnvironmentName = event.target.value;
  };

  const onRenameBlur = async () => {
    if (newEnvironmentName.trim()) {
      const response = await onUpdateEnvironment(env, newEnvironmentName);
    }
    isRenaming = false;
    newEnvironmentName = "";
  };

  const handleSelectEnvironment = async () => {
    onSelectEnvironment(env);
  };

  //rename environment name
  const renameEnvironment = () => {
    isRenaming = true;
    showMenu = false;
  };

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldEnvironment",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  let menuItems = [];
  let environmentTabWrapper: HTMLElement;

  $: {
    if (currentWorkspace) {
      menuItems = [
        {
          onClick: openEnvironment,
          displayText: "Open Environment",
          disabled: false,
        },
        {
          onClick: renameEnvironment,
          displayText: "Rename Environment",
          disabled: false,
        },
        {
          onClick: handleSelectEnvironment,
          displayText:
            currentWorkspace?.environmentId === env.id
              ? "Unselect Environment"
              : "Select Environment",
          disabled: false,
        },
        {
          onClick: () => {
            handleEnvironmentPopUpCancel(true);
          },
          displayText: "Delete",
          disabled: false,
        },
      ];
    }
  }
  let deleteEnvironmentLoader: boolean = false;
</script>

<Modal
  title={"Delete Environment?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isEnvironmentPopup}
  handleModalState={handleEnvironmentPopUpCancel}
>
  <div class="text-lightGray mb-1 sparrow-fs-14">
    <p style="font-weight: 400;" class="text-fs-14">
      Are you sure you want to delete this Environment? <span
        style="font-weight:700;"
        class="">"{env.name}"</span
      >
      and all its variables will be removed and cannot be restored. It will also
      impact all the API requests that use the variables in this environment.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    style="font-size: 16px;"
  >
    <Button
      disable={deleteEnvironmentLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"dark"}
      loader={false}
      onClick={() => {
        handleEnvironmentPopUpCancel(false);
      }}
    />

    <Button
      disable={deleteEnvironmentLoader}
      title={"Delete"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"danger"}
      loader={deleteEnvironmentLoader}
      onClick={async () => {
        deleteEnvironmentLoader = true;
        await handleEnvironmentPopUpSuccess();
        deleteEnvironmentLoader = false;
      }}
    />
  </div></Modal
>

{#if showMenu}
  <Options
    xAxis={environmentTabWrapper.getBoundingClientRect().right - 30}
    yAxis={[
      environmentTabWrapper.getBoundingClientRect().top + 20,
      environmentTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={500}
    {menuItems}
    {noOfColumns}
  />
{/if}

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

<div style="" class="environment-tab mb-1" bind:this={environmentTabWrapper}>
  <button
    style="height:32px; border-color: {showMenu ? '#ff7878' : ''}"
    class="btn-primary border-radius-2 d-flex w-100 align-items-center justify-content-between border-0 my-button {env?.id ===
    activeTabId
      ? 'active-collection-tab'
      : ''}"
  >
    <div
      class="d-flex main-collection align-items-center ps-3"
      on:contextmenu|preventDefault={(e) => {
        rightClickContextMenu(e);
      }}
      on:click|preventDefault={() => {
        if (!isRenaming) {
          if (!env.id.includes(UntrackedItems.UNTRACKED)) {
            openEnvironment();
          }
        }
      }}
    >
      <button
        class="p-0 m-0 ms-1 ps-4 me-2 border-0 bg-transparent"
        on:click|stopPropagation={() => {
          handleSelectEnvironment();
        }}
      >
        <SelectIcon
          classProp={`my-auto`}
          width={20}
          height={20}
          selected={currentWorkspace?.environmentId === env.id}
        />
      </button>
      {#if isRenaming}
        <input
          class="py-0 renameInputFieldCollection text-fs-12 w-100"
          id="renameInputFieldEnvironment"
          type="text"
          value={env.name}
          autofocus
          maxlength={100}
          on:click|stopPropagation={() => {}}
          on:input={handleRenameInput}
          on:blur={onRenameBlur}
          on:keydown={onRenameInputKeyPress}
        />
      {:else}
        <div
          class="collection-title d-flex align-items-center py-1 mb-0"
          style="height: 36px;"
        >
          <p class="ellipsis w-100 me-4 mb-0 text-fs-12">
            {env.name}
          </p>
        </div>
      {/if}
    </div>
    {#if env.id.includes(UntrackedItems.UNTRACKED)}
      <Spinner size={"15px"} />
    {:else if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER}
      <Tooltip placement="bottom" title="More" distance={17} show={!showMenu}>
        <button
          id={`show-more-environment-${env?.id}`}
          class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center {showMenu
            ? 'threedot-active'
            : ''}"
          style=""
          on:click={(e) => {
            rightClickContextMenu(e);
          }}
          disabled={loggedUserRoleInWorkspace ===
            WorkspaceRole.WORKSPACE_VIEWER}
        >
          <img class="threedot-icon" src={threedotIcon} alt="threedotIcon" />
        </button>
      </Tooltip>
    {/if}
  </button>
</div>

<style lang="scss">
  .environment-tab {
    .my-button:hover .threedot-icon-container {
      visibility: visible;
    }
    .list-icons {
      width: 16px;
      height: 16px;
      margin-right: 10px;
    }
    .list-icons:hover {
      filter: invert(78%) sepia(86%) saturate(3113%) hue-rotate(177deg)
        brightness(100%) contrast(100%);
    }
    .threedot-icon-container {
      visibility: hidden;
      background-color: transparent;
    }

    .threedot-active {
      visibility: visible;
      background-color: var(--bg-secondary-400);
    }
    .threedot-icon-container:hover {
      background-color: var(--bg-tertiary-500);
    }

    .btn-primary {
      background-color: transparent;
      color: var(--white-color);
      padding-right: 5px;
    }

    .btn-primary:hover {
      background-color: var(--bg-tertiary-300);
    }

    .renameInputFieldCollection {
      border: none;
      color: var(--white-color);
      background-color: transparent;
      padding-left: 0;
      border-radius: 0 !important;
      outline: none !important;
    }
    .renameInputFieldCollection:focus {
      border: 1px solid var(--border-primary-300);
    }
    .sub-folders {
      border-left: 1px solid var(--border-color);
    }
    .main-collection {
      width: calc(100% - 24px);
    }
    .active-collection-tab {
      background-color: var(--bg-tertiary-600) !important;
    }
    .collection-title {
      width: calc(100% - 30px);
      text-align: left;
    }
  }

  .threedot-icon {
    transform: rotate(90deg);
  }
</style>
