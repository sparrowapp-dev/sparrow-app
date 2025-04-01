<script lang="ts">
  import { dot3Icon as threedotIcon } from "@sparrow/library/assets";
  import { SelectIcon } from "@sparrow/library/assets";
  import { UntrackedItems } from "@sparrow/common/enums/item-type.enum";
  import { RadioButton, Spinner } from "@sparrow/library/ui";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { Options } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { MoreHorizontalRegular } from "@sparrow/library/icons";

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
  <div class="text-lightGray mb-1">
    <p class="text-ds-font-size-14 text-ds-font-weight-Regular">
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
      type={"secondary"}
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

<div
  style="margin-bottom:2px;"
  class="environment-tab"
  bind:this={environmentTabWrapper}
  on:click|preventDefault={() => {
    if (!isRenaming) {
      if (!env.id.includes(UntrackedItems.UNTRACKED)) {
        openEnvironment();
      }
    }
  }}
>
  <button
    tabindex="0"
    style="height:32px;gap:4px; padding-left:7px;  border-color: {showMenu
      ? '#ff7878'
      : ''}"
    class="btn-primary border-radius-2 d-flex w-100 align-items-center justify-content-between border-0 my-button {env?.id ===
    activeTabId
      ? 'active-collection-tab'
      : ''}"
  >
    <div class="box" style="height: 24px; width:30px; margin-right:4px;"></div>
    <div
      class="d-flex main-collection align-items-center"
      on:contextmenu|preventDefault={(e) => {
        rightClickContextMenu(e);
      }}
    >
      <button
        tabindex="-1"
        class="border-0 bg-transparent"
        style="width: 30px !important; height:24px; display:flex; align-items:center; justify-content:end; "
        on:click|stopPropagation={() => {
          handleSelectEnvironment();
        }}
      >
        <RadioButton
          name={"radio"}
          buttonSize="small"
          group={currentWorkspace?.environmentId}
          value={env.id}
          id={env.id}
          handleChange={() => handleSelectEnvironment()}
          singleSelect={true}
        />
      </button>
      <!-- <RadioButton
        class="p-0 m-0  ps-4 me-2"
        buttonSize="medium"
        selected={currentWorkspace?.environmentId === env.id}
        handleChange={() => handleSelectEnvironment()}
        singleSelect={true}
        /> -->
      {#if isRenaming}
        <input
          class="py-0 renameInputFieldCollection w-100 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-Medium"
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
          style="height: 32px; font-size:12px; font-weight:400; line-height:18px; padding:2px 4px; "
        >
          <p
            class="ellipsis w-100 me-4 mb-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-Medium"
          >
            {env.name}
          </p>
        </div>
      {/if}
    </div>
    {#if env.id.includes(UntrackedItems.UNTRACKED)}
      <Spinner size={"15px"} />
    {:else if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER}
      <Tooltip
        placement="bottom-center"
        title="More"
        distance={17}
        show={!showMenu}
      >
        <span class="threedot-icon-container d-flex">
          <Button
            id={`show-more-environment-${env?.id}`}
            size="small"
            type="teritiary-regular"
            disable={loggedUserRoleInWorkspace ===
              WorkspaceRole.WORKSPACE_VIEWER}
            startIcon={MoreHorizontalRegular}
            onClick={(e) => {
              rightClickContextMenu(e);
            }}
          />
        </span>
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

    .btn-primary {
      background-color: transparent;
      color: var(--text-ds-neutral-50);
      padding-right: 5px;
    }

    .btn-primary:hover {
      background-color: var(--bg-ds-surface-400);
      border-radius: 4px;
      color: var(--text-ds-neutral-50);
    }

    .btn-primary:hover .threedot-icon-container {
      visibility: visible;
    }
    .btn-primary:focus-visible {
      background-color: var(--bg-ds-surface-400);
      border: 2px solid var(--bg-ds-primary-300) !important;
      outline: none;
      border-radius: 4px;
    }
    .btn-primary:focus-visible .threedot-icon-container {
      visibility: visible;
    }
    .btn-primary:active {
      background-color: var(--bg-ds-surface-500);
      border-radius: 4px;
    }
    .btn-primary:active .threedot-icon-container {
      visibility: visible;
    }
    .renameInputFieldCollection {
      height: 24px;
      border: none;
      color: var(--text-ds-neutral-50);
      background-color: transparent;
      padding: 4px 2px;
      border-radius: 4px !important;
      outline: none !important;
      caret-color: var(--bg-ds-primary-300);
    }
    .renameInputFieldCollection:focus {
      border: 1px solid var(--border-ds-primary-300);
    }
    .sub-folders {
      border-left: 1px solid var(--border-color);
    }
    .main-collection {
      width: calc(100% - 71px);
    }
    .active-collection-tab {
      background-color: var(--bg-ds-surface-500) !important;
      border-radius: 4px;
    }
    .collection-title {
      color: var(--bg-ds-neutral-200);
      width: calc(100% - 30px);
      text-align: left;
      display: flex;
      align-items: center;
      position: relative;
    }
    .ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .threedot-icon {
      transform: rotate(90deg);
    }
  }
</style>
