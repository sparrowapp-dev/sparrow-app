<script lang="ts">
  import threedotIcon from "$lib/assets/3dot.svg";
  import { SelectIcon } from "$lib/assets/app.asset";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import DeleteConfirmationPopup from "$lib/components/Modal/DeleteConfirmationPopup.svelte";
  import { generateSampleEnvironment } from "$lib/utils/sample/environment.sample";
  import { notifications } from "$lib/utils/notifications";

  export let environmentRepositoryMethods: EnvironmentRepositoryMethods;
  export let environmentServiceMethods: EnvironmentServiceMethods;
  export let currentWorkspace;
  export let env;
  export let currentEnvironment;

  let rightClickPanelHeight;

  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;
  let isEnvironmentPopup: boolean = false;
  let newEnvironmentName: string = "";
  let isRenaming = false;

  function rightClickContextMenu(e) {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const windowHeight = window.innerHeight;
      if (windowHeight < mouseY + 180) {
        pos = { x: mouseX, y: mouseY - 170 };
      } else {
        pos = { x: mouseX, y: mouseY };
      }
      showMenu = true;
    }, 100);
  }

  const handleEnvironmentPopUpCancel = (flag) => {
    isEnvironmentPopup = flag;
  };

  const handleEnvironmentPopUpSuccess = async () => {
    const response = await environmentServiceMethods.deleteEnvironment(
      env.id,
      currentWorkspace._id,
    );
    if (response.isSuccessful) {
      environmentRepositoryMethods.removeEnvironment(env.id);
      environmentRepositoryMethods.deleteEnvironmentTab(env.id);
      handleEnvironmentPopUpCancel(false);
      notifications.success(
        `${env.name} environment is removed from ${currentWorkspace.name}.`,
      );
    } else {
      notifications.error(
        `Failed to remove ${env.name} environment from ${currentWorkspace.mame}.`,
      );
    }
  };

  function closeRightClickContextMenu() {
    showMenu = false;
  }

  //open environment
  function openEnvironment() {
    let sampleEnvironment = generateSampleEnvironment(
      env.id,
      currentWorkspace._id,
      new Date().toString(),
    );
    sampleEnvironment.name = env.name;
    sampleEnvironment.isActive = true;
    sampleEnvironment.variable = env.variable;
    environmentRepositoryMethods.createEnvironmentTab(
      sampleEnvironment,
      currentWorkspace._id,
    );
    showMenu = false;
  }

  const handleRenameInput = (event) => {
    newEnvironmentName = event.target.value;
  };

  const onRenameBlur = async () => {
    if (newEnvironmentName) {
      const response = await environmentServiceMethods.updateEnvironment(
        currentWorkspace._id,
        env.id,
        { name: newEnvironmentName },
      );
      if (response.isSuccessful) {
        environmentRepositoryMethods.updateEnvironment(env.id, {
          name: newEnvironmentName,
        });
        environmentRepositoryMethods.setEnvironmentTabProperty(
          newEnvironmentName,
          "name",
          env.id,
        );
      }
    }
    isRenaming = false;
    newEnvironmentName = "";
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

  // select environment
  const selectEnvironment = () => {
    if (currentWorkspace?.environmentId === env.id) {
      environmentRepositoryMethods.initActiveEnvironmentToWorkspace(
        currentWorkspace._id,
        "none",
      );
    } else {
      environmentRepositoryMethods.initActiveEnvironmentToWorkspace(
        currentWorkspace._id,
        env.id,
      );
    }
  };

  let menuItems = [];

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
          onClick: selectEnvironment,
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
</script>

{#if isEnvironmentPopup}
  <DeleteConfirmationPopup
    {env}
    {currentWorkspace}
    title={`Delete Environment?`}
    description={`<p>
      Are you sure you want to delete this Environment? <span
        style="font-weight:700;"
        class="text-whiteColor">"${env.name}"</span
      >
      and all its variables will be removed and cannot be restored. It will also
      impact all the API requests that use the variables in this environment.
    </p>`}
    onSuccess={handleEnvironmentPopUpSuccess}
    onCancel={handleEnvironmentPopUpCancel}
    {environmentRepositoryMethods}
    {environmentServiceMethods}
  />
{/if}

{#if showMenu}
  <div class="environment-tab" bind:offsetHeight={rightClickPanelHeight}>
    <nav style="position: fixed; top:{pos.y}px; left:{pos.x}px; z-index:4;">
      <div
        class="navbar p-0 d-flex flex-column rounded align-items-start justify-content-start text-whiteColor bg-blackColor"
        id="navbar"
      >
        <ul class="p-2 w-100">
          {#each menuItems as item}
            <li class="align-items-center">
              <button
                disabled={item.disabled}
                class={`align-items-center px-3 py-2 ${
                  item.disabled && "text-requestBodyColor"
                }`}
                on:click={item.onClick}
                style={item.displayText === "Delete" ? "color: #ff7878" : ""}
                >{item.displayText}</button
              >
            </li>
          {/each}
        </ul>
      </div>
    </nav>
  </div>
{/if}

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>

<div class="environment-tab">
  <button
    style="height:36px; border-color: {showMenu ? '#ff7878' : ''}"
    class="btn-primary d-flex w-100 align-items-center justify-content-between border-0 ps-2 my-button {env?.id ===
    currentEnvironment?.id
      ? 'active-collection-tab'
      : ''}"
  >
    <div
      on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
      class="d-flex main-collection align-items-center"
    >
      <button
        class="p-0 m-0 me-2 border-0 bg-transparent"
        on:click={() => {
          selectEnvironment();
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
          class="form-control py-0 renameInputFieldCollection"
          id="renameInputFieldEnvironment"
          type="text"
          style="font-size: 12px;"
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
          <p class="ellipsis w-100 mb-0" style="font-size: 12px;">
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
      background-color: var(--workspace-hover-color);
    }
    .threedot-icon-container:hover {
      background-color: var(--workspace-hover-color);
    }

    .btn-primary {
      background-color: var(--background-color);
      color: var(--white-color);
      padding-right: 5px;
      border-radius: 8px;
    }

    .btn-primary:hover {
      background-color: var(--border-color);
      color: var(--white-color);
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
      background-color: #313233;
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
      background-color: var(--selected-active-sidebar) !important;
    }
    .collection-title {
      width: calc(100% - 30px);
      text-align: left;
    }
  }
</style>
