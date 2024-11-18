<script lang="ts">
  import { dot3Icon as threedotIcon } from "@sparrow/library/assets";
  import { UntrackedItems } from "@sparrow/common/enums/item-type.enum";
  import {
    Button,
    Tooltip,
    Options,
    Spinner,
    Modal as Modal,
  } from "@sparrow/library/ui";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { TreeIcon } from "@sparrow/library/icons";
  import {
    TFDefaultEnum,
    type TFDocumentType,
  } from "@sparrow/common/types/workspace/testflow";

  /**
   * current workspace to identify the selected testflow
   */
  export let currentWorkspace;

  /**
   * individual testflow
   */
  export let flow: TFDocumentType;

  /**
   * deletes the testflow
   */
  export let onDeleteTestflow;
  /**
   * updates the testflow
   */
  export let onUpdateTestflow;
  /**
   * opens the testflow
   */
  export let onOpenTestflow;

  export let activeTabId;

  /**
   * Role of user in workspace
   */
  export let loggedUserRoleInWorkspace;

  let showMenu: boolean = false;
  let isTestflowPopup: boolean = false;
  let newTestflowName: string = "";
  let isRenaming = false;

  let noOfColumns = 180;

  const rightClickContextMenu = () => {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  };

  const handleSelectClick = (event: MouseEvent) => {
    const selectElement = document.getElementById(
      `show-more-testflow-${flow?._id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  };

  const handleTestflowPopUpCancel = (flag: boolean) => {
    isTestflowPopup = flag;
  };

  const handleTestflowPopUpSuccess = async () => {
    const response = await onDeleteTestflow(flow);
    if (response.isSuccessful) {
      handleTestflowPopUpCancel(false);
    }
  };

  //open testflow
  const openTestflow = () => {
    onOpenTestflow(flow);
    showMenu = false;
  };

  const handleRenameInput = (event: Event) => {
    const inputElement = event.target as HTMLInputElement;
    newTestflowName = inputElement.value;
  };

  const onRenameBlur = async () => {
    if (newTestflowName.trim()) {
      const response = await onUpdateTestflow(flow, newTestflowName);
    }
    isRenaming = false;
    newTestflowName = "";
  };

  //rename testflow name
  const renameTestflow = () => {
    isRenaming = true;
    showMenu = false;
  };

  const onRenameInputKeyPress = (event: KeyboardEvent) => {
    if (event?.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldTestflow",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  let menuItems: {
    onClick: () => void;
    displayText: string;
    disabled: boolean;
  }[] = [];
  let testflowTabWrapper: HTMLElement;

  $: {
    if (currentWorkspace) {
      menuItems = [
        {
          onClick: openTestflow,
          displayText: `Open ${TFDefaultEnum.NAME}`,
          disabled: false,
        },
        {
          onClick: renameTestflow,
          displayText: "Rename Flow",
          disabled: false,
        },
        {
          onClick: () => {
            handleTestflowPopUpCancel(true);
          },
          displayText: "Delete",
          disabled: false,
        },
      ];
    }
  }
  let deleteTestflowLoader: boolean = false;
</script>

<Modal
  title={`Delete Flow?`}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isTestflowPopup}
  handleModalState={handleTestflowPopUpCancel}
>
  <div class="text-lightGray mb-1 sparrow-fs-14">
    <p style="font-weight: 400;" class="text-fs-14">
      Are you sure you want to delete this Flow?
      <span style="font-weight:700;" class="">"{flow.name}"</span>
      and all its blocks will be removed and cannot be restored.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    style="font-size: 16px;"
  >
    <Button
      disable={deleteTestflowLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"dark"}
      loader={false}
      onClick={() => {
        handleTestflowPopUpCancel(false);
      }}
    />

    <Button
      disable={deleteTestflowLoader}
      title={"Delete"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"danger"}
      loader={deleteTestflowLoader}
      onClick={async () => {
        deleteTestflowLoader = true;
        await handleTestflowPopUpSuccess();
        deleteTestflowLoader = false;
      }}
    />
  </div></Modal
>

{#if showMenu}
  <Options
    xAxis={testflowTabWrapper.getBoundingClientRect().right - 30}
    yAxis={[
      testflowTabWrapper.getBoundingClientRect().top + 20,
      testflowTabWrapper.getBoundingClientRect().bottom + 5,
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

<div style="" class="testflow-tab mb-1" bind:this={testflowTabWrapper}>
  <button
    style="height:32px; border-color: {showMenu ? '#ff7878' : ''}"
    class="btn-primary border-radius-2 d-flex w-100 align-items-center justify-content-between border-0 my-button {flow?._id ===
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
          if (!flow._id.includes(UntrackedItems.UNTRACKED)) {
            openTestflow();
          }
        }
      }}
    >
      <button class="p-0 m-0 ms-1 ps-4 me-2 border-0 bg-transparent">
        <TreeIcon
          width={"12px"}
          height={"12px"}
          color={"var(--icon-secondary-130)"}
        />
      </button>
      {#if isRenaming}
        <input
          class="py-0 renameInputFieldCollection text-fs-12 w-100"
          id="renameInputFieldTestflow"
          type="text"
          value={flow.name}
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
            {flow.name}
          </p>
        </div>
      {/if}
    </div>
    {#if flow._id.includes(UntrackedItems.UNTRACKED)}
      <Spinner size={"15px"} />
    {:else if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER}
      <Tooltip placement="bottom" title="More" distance={17} show={!showMenu}>
        <button
          id={`show-more-testflow-${flow?._id}`}
          class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center {showMenu
            ? 'threedot-active'
            : ''}"
          style="transform: rotate(90deg);"
          on:click={(e) => {
            rightClickContextMenu();
          }}
          disabled={loggedUserRoleInWorkspace ===
            WorkspaceRole.WORKSPACE_VIEWER}
        >
          <img src={threedotIcon} alt="threedotIcon" />
        </button>
      </Tooltip>
    {/if}
  </button>
</div>

<style lang="scss">
  .testflow-tab {
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
      background-color: var(--text-tertiary-500);
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
</style>
