<script lang="ts">
  import threedotIcon from "$lib/assets/3dot.svg";
  import { SelectIcon } from "$lib/assets/app.asset";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import Button from "$lib/components/buttons/Button.svelte";
  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";

  export let currentWorkspace;
  export let env;
  export let currentEnvironment;

  export let onDeleteEnvironment;
  export let onUpdateEnvironment;
  export let onOpenEnvironment;
  export let onSelectEnvironment;

  let showMenu: boolean = false;
  let isEnvironmentPopup: boolean = false;
  let newEnvironmentName: string = "";
  let isRenaming = false;

  let noOfColumns = 180;
  let noOfRows = 4;
  function rightClickContextMenu(e) {
    e.preventDefault();
    setTimeout(() => {
      showMenu = true;
    }, 100);
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

  function closeRightClickContextMenu() {
    showMenu = false;
  }

  //open environment
  function openEnvironment() {
    onOpenEnvironment(env);
    showMenu = false;
  }

  const handleRenameInput = (event) => {
    newEnvironmentName = event.target.value;
  };

  const onRenameBlur = async () => {
    if (newEnvironmentName) {
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
  let environmentTabWrapper;

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
          displayText: "Rename",
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

<ModalWrapperV1
  title={"Delete Environment?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isEnvironmentPopup}
  handleModalState={handleEnvironmentPopUpCancel}
>
  <div class="text-lightGray mb-1 sparrow-fs-14">
    <p>
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
  </div></ModalWrapperV1
>

{#if showMenu}
  <RightOption
    xAxis={environmentTabWrapper.getBoundingClientRect().right - 180}
    yAxis={environmentTabWrapper.getBoundingClientRect().bottom + 5}
    {menuItems}
    {noOfRows}
    {noOfColumns}
  />
{/if}

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>

<div class="environment-tab mb-1" bind:this={environmentTabWrapper}>
  <button
    style="height:36px; border-color: {showMenu ? '#ff7878' : ''}"
    class="btn-primary border-radius-2 d-flex w-100 align-items-center justify-content-between border-0 ps-3 my-button {env?.id ===
    currentEnvironment?.id
      ? 'active-collection-tab'
      : ''}"
  >
    <div class="d-flex main-collection align-items-center">
      <button
        class="p-0 m-0 me-2 border-0 bg-transparent"
        on:click={() => {
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
          class="py-0 renameInputFieldCollection text-fs-14 w-100"
          id="renameInputFieldEnvironment"
          type="text"
          value={env.name}
          autofocus
          maxlength={100}
          on:input={handleRenameInput}
          on:blur={onRenameBlur}
          on:keydown={onRenameInputKeyPress}
        />
      {:else}
        <div
          class="collection-title d-flex align-items-center py-1 mb-0"
          style="height: 36px;"
          on:click={() => {
            if (!env.id.includes(UntrackedItems.UNTRACKED)) {
              openEnvironment();
            }
          }}
        >
          <p class="ellipsis w-100 mb-0 text-fs-14">
            {env.name}
          </p>
        </div>
      {/if}
    </div>
    {#if env.id.includes(UntrackedItems.UNTRACKED)}
      <Spinner size={"15px"} />
    {:else}
      <button
        class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center {showMenu
          ? 'threedot-active'
          : ''}"
        style="transform: rotate(90deg);"
        on:click={(e) => {
          rightClickContextMenu(e);
        }}
      >
        <img src={threedotIcon} alt="threedotIcon" />
      </button>
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
      // background-color: var(--workspace-hover-color);
    }
    .threedot-icon-container:hover {
      background-color: var(--bg-secondary-400);
    }

    .btn-primary {
      background-color: transparent;
      color: var(--white-color);
      padding-right: 5px;
    }

    .btn-primary:hover {
      background-color: var(--bg-secondary-800);
    }

    .navbar {
      width: 180px;
      height: auto;
      overflow: hidden;
    }

    ul li {
      display: block;
    }

    ul li button {
      font-size: 12px;
      display: flex;
      width: 100%;
      border: 0px;
      background-color: var(--blackColor);
    }

    ul li button:hover {
      width: 100%;
      color: var(--white-color);
      border-radius: 8px;
      background-color: #232527;
    }

    .renameInputFieldCollection {
      border: none;
      color: var(--white-color);
      background-color: transparent;
      padding-left: 0;
      border-radius: 0 !important;
    }
    .renameInputFieldCollection:focus {
      // background-color: #313233;
      outline: none !important;
      border-bottom: 1px solid #85c2ff;
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
