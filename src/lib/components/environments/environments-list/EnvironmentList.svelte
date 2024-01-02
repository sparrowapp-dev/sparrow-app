<script lang="ts">
  import { PlusIcon, SelectIcon, ShowMoreIcon } from "$lib/assets/app.asset";
  import { Tooltip } from "$lib/components";

  import { v4 as uuidv4 } from "uuid";
  import type {
    EnvironmentDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import type { Observable } from "rxjs";
  import { onDestroy } from "svelte";
  import { EnvironmentListViewModel } from "./EnvironmentList.ViewModel";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import { notifications } from "$lib/utils/notifications";
  import { isEnvironmentCreatedFirstTime } from "$lib/store/environment";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { isActiveTab } from "$lib/store/collection";
  import { isWorkspaceLoaded } from "$lib/store/workspace.store";
  let environment: any[] = [];
  let globalEnvrionment: any;
  let currentSelectedId: string;
  let environmentUnderCreation: boolean = false;
  let activeEnvironmentRxDoc: EnvironmentDocument;
  let environmentUnderRename: string | undefined = undefined;
  const _environmentListViewModel = new EnvironmentListViewModel();
  const _workspaceViewModel = new HeaderDashboardViewModel();
  export let environmentRepositoryMethods: EnvironmentRepositoryMethods;
  export let environmentServiceMethods: EnvironmentServiceMethods;
  export let currentEnvironment: any;
  const environments: Observable<EnvironmentDocument[]> =
    _environmentListViewModel.environment;

  const activeWorkspace: Observable<WorkspaceDocument> =
    environmentRepositoryMethods.getActiveWorkspace();
  let activeWorkspaceRxDoc: WorkspaceDocument;
  let pos = { x: 0, y: 0 };

  let showMenu: boolean = false;
  let currWorkspaceName: string;
  let currentWorkspaceId: string = "";
  let isLoading: boolean = false;

  const environmentSubscribe = environments.subscribe(
    (value: EnvironmentDocument[]) => {
      if (value) {
        const environmentArr = value.map(
          (environmentDocument: EnvironmentDocument) => {
            const environmentObj =
              environmentRepositoryMethods.getEnvironmentDocument(
                environmentDocument,
              );
            return environmentObj;
          },
        );
        const filteredEnvironments = environmentArr.filter((env) => {
          if (env.type == "LOCAL" || env.type == undefined) {
            return true;
          } else {
            globalEnvrionment = env;
          }
        });
        const isPresent = environmentArr.find((env) => {
          if (env.id == currentEnvironment.id) return true;
        });
        if (!isPresent) {
          handleActivateEnvironment(globalEnvrionment?.id);
        }
        environment = filteredEnvironments;
        return;
      }
    },
  );
  const workspaceLoadingSubscribe = isWorkspaceLoaded.subscribe((value) => {
    isLoading = !value;
  });
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currWorkspaceName = activeWorkspaceRxDoc.get("name");
        currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
        const workspaceId = activeWorkspaceRxDoc.get("_id");
        const response =
          await environmentServiceMethods.getAllEnvironments(workspaceId);
        if (response.isSuccessful && response.data.data) {
          const environments = response.data.data;
          environmentRepositoryMethods.bulkInsert(environments);
          return;
        }
      }
    },
  );

  const handleCreateEnvironmentClick = async () => {
    environmentUnderCreation = true;
    isEnvironmentCreatedFirstTime.set(true);
    const newEnvironment = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: getNextEnvironment(environment, "New Environment"),
      variable: [],
      createdAt: new Date().toISOString(),
    };

    environmentRepositoryMethods.addEnvironment(newEnvironment);
    const response = await _environmentListViewModel.addEnvironment({
      name: newEnvironment.name,
      workspaceId: currentWorkspaceId,
      variable: newEnvironment.variable,
    });

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      environmentUnderCreation = false;
      environmentRepositoryMethods.updateEnvironment(newEnvironment.id, res);
      _workspaceViewModel.updateEnvironmentInWorkspace(currentWorkspaceId, {
        _id: response.data.data._id,
        name: newEnvironment.name,
      });
      _environmentListViewModel.activateEnvironment(newEnvironment.id);
      notifications.success("New Environment Created!");
      return;
    }
    return;
  };

  const handleActivateEnvironment = (id: string) => {
    if (id) _environmentListViewModel.activateEnvironment(id);
  };
  const getNextEnvironment: (list: any[], name: string) => any = (
    list,
    name,
  ) => {
    const isNameAvailable: (proposedName: string) => boolean = (
      proposedName,
    ) => {
      return list.some((element) => {
        return element.name === proposedName;
      });
    };

    if (!isNameAvailable(name)) return name;

    for (let i = 2; i < list.length + 10; i++) {
      const proposedName: string = `${name} ${i}`;
      if (!isNameAvailable(proposedName)) return proposedName;
    }
    return null;
  };

  const deleteEnvironment = (id: string) => {
    environmentServiceMethods.deleteEnvironment(currentWorkspaceId, id);
    environmentRepositoryMethods.removeEnvironment(id);
  };
  onDestroy(() => {
    environmentSubscribe.unsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
    workspaceLoadingSubscribe();
  });
  let isCollectionPopup: boolean = false;
  let containerRef;
  function rightClickContextMenu(e, id) {
    e.preventDefault();
    document.querySelectorAll('.show-more-icon').forEach(item => item.classList.remove('active'));
    currentSelectedId = id;
    e.target.classList.toggle("active");
    setTimeout(() => {
      const containerRect = containerRef?.getBoundingClientRect();
      const mouseX = e.clientX - (containerRect?.left || 0);
      const mouseY = e.clientY - (containerRect?.top || 0);
      pos = { x: mouseX, y: mouseY + 20 };
      showMenu = true;
    }, 100);
  }
  const renameEnvironment = (id: string) => {
    environmentUnderRename = id;
    setTimeout(() => {
      document.getElementById(`rename-input-${id}`).focus();
    }, 100);
  };
  const handleRenameEnvironment = async (
    e,
    oldName: string,
    variable: any,
    id: string,
  ) => {
    environmentUnderRename = undefined;
    document.getElementById(`rename-input-${id}`).blur();
    if (e.target.value !== oldName) {
      await environmentServiceMethods.updateEnvironment(
        currentWorkspaceId,
        id,
        {
          name: e.target.value,
          variable: variable,
        },
      );
      await environmentRepositoryMethods.updateEnvironment(id, {
        name: e.target.value,
        isActive: currentEnvironment.id == id,
        variable: variable,
      });
    }
  };
  const handleEnterRenameEnvironment = async (e, oldName, variable, id) => {
    if (e.key == "Enter") {
      handleRenameEnvironment(e, oldName, variable, id);
    }
  };
  const handleCollectionPopUp = (flag) => {
    isCollectionPopup = flag;
  };
  let menuItems = [
    {
      onClick: (id) => {
        handleActivateEnvironment(id);
      },
      displayText: "Open Environment",
      disabled: false,
    },
    {
      onClick: (id) => {
        renameEnvironment(id);
      },
      displayText: "Rename",
      disabled: false,
    },
    {
      onClick: (id) => {
        handleActivateEnvironment(globalEnvrionment?.id);
      },
      displayText: "Unselect Environment",
      disabled: false,
    },
    {
      onClick: (id) => {
        deleteEnvironment(id);
      },
      displayText: "Delete",
      disabled: false,
    },
  ];
  function closeRightClickContextMenu() {
    showMenu = false;
    document.querySelectorAll('.show-more-icon').forEach(item => item.classList.remove('active'));
  }
</script>

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>
{#if showMenu}
  <nav style="position: fixed; top:{pos.y}px; left:{pos.x}px; z-index:4;">
    <div
      class="navbar pb-0 d-flex flex-column rounded align-items-start justify-content-start text-whiteColor bg-blackColor"
      id="navbar"
    >
      <ul class="ps-1 pt-1 pe-1 pb-0 w-100">
        {#each menuItems as item}
          <li class="align-items-center">
            <button
              disabled={item.disabled}
              class={` lign-items-center mb-0 px-2 py-2 ${
                item.disabled && "text-requestBodyColor"
              }`}
              on:click={() => item.onClick(currentSelectedId)}
              style={item.displayText === "Delete" ? "color: #ff7878" : ""}
              >{item.displayText}</button
            >
          </li>
        {/each}
      </ul>
    </div>
  </nav>
{/if}
<div
  class={`env-sidebar`}
  style={``}
  on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
>
  <div
    class={`d-flex justify-content-between curr-workspace-heading-container my-2 `}
  >
    <h1
      class={`fw-medium lh-1 curr-workspace ps-3 my-auto ellipsis`}
      style={`font-size: 18px; text-color: #FFF;`}
    >
      {currWorkspaceName || ""}
    </h1>
    <Tooltip text={`Add Environment`}>
      <button
        class={`border-0 mx-3 rounded add-env-mini-btn  ${
          !environmentUnderCreation ? "pb-2 py-1" : "py-2"
        } px-2`}
        on:click={handleCreateEnvironmentClick}
      >
        {#if environmentUnderCreation}
          <Spinner size={"18px"} />
        {:else}
          <PlusIcon width={15} height={15} color={`#8A9299`} />
        {/if}
      </button>
    </Tooltip>
  </div>
  {#if globalEnvrionment}
    <p
      class={`fw-normal env-item rounded m-2 ps-3 ${
        globalEnvrionment?.isActive && "active"
      }`}
      on:click={() => {
        handleActivateEnvironment(globalEnvrionment?.id);
      }}
    >
      {globalEnvrionment?.name}
    </p>
  {/if}
  <hr />
  {#if isLoading}
    <Spinner size={"30px"} />
  {/if}
  {#if environment && environment.length == 0}
    <div class={`add-env-container `}>
      <p class={`add-env-desc-text fw-light text-center mb-5 p-2 pe-4`}>
        Add Environments to your Workspace to test your APIs with the relevant
        set of resources and constraints.
      </p>
      <button
        class={`add-env-btn d-flex rounded py-1 px-4 border-0 mx-auto w-fit`}
        on:click={handleCreateEnvironmentClick}
      >
        <PlusIcon classProp={`my-auto me-2`} />
        <span class={`my-auto ps-2`}>Environment</span>
      </button>
    </div>
  {/if}
  <ul class={`env-side-tab-list overflow-y-scroll ps-0`}>
    {#if environment && environment.length > 0}
      {#each environment as env}
        <div
          class={`d-flex rounded env-tab align-items-center justify-content-between env-item ps-3 ${
            env.isActive && "active"
          }`}
          style="cursor: pointer; "
          on:click={() => handleActivateEnvironment(env.id)}
        >
          <div class="show-more-in d-flex ellipsis">
            <Tooltip text={`${env?.isActive ? "Unselect" : "Select"}`}>
              <SelectIcon
                classProp={`my-auto`}
                width={20}
                height={20}
                selected={env.isActive}
              />
            </Tooltip>
            {#if env.id && env.id == environmentUnderRename}
              <input
                type="text"
                class="ms-3 my-auto fw-normal border-0 rename-input"
                value={env?.name}
                id={`rename-input-${env.id}`}
                on:blur={(e) =>
                  handleRenameEnvironment(e, env.name, env.variable, env.id)}
                on:keydown={(e) =>
                  handleEnterRenameEnvironment(
                    e,
                    env.name,
                    env.variable,
                    env.id,
                  )}
              />
            {:else}
              <p class={`ps-3 my-auto fw-normal ellipsis`}>{env?.name}</p>
            {/if}
          </div>
          <Tooltip text={`More options`}>
            <button
              class={`${showMenu && ""} show-more-btn rounded border-0`}
              on:click={(e) => {
                e.stopPropagation();
                rightClickContextMenu(e, env.id);
              }}
            >
              {#if env.type == undefined && environmentUnderCreation}
                <Spinner size={"15px"} />
              {:else}
                <ShowMoreIcon />
              {/if}
            </button>
          </Tooltip>
        </div>
      {/each}
    {/if}
  </ul>
</div>

<style lang="scss">
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
  .env-sidebar {
    background-color: var(--background-color);
    height: 95vh;
    border-right: 1px solid var(--border-color);
    padding: 0px 0px 8px 2px;
    width: 20vw;
  }
  .curr-workspace {
    max-height: 20vw;
  }
  .curr-workspace-heading-container {
    padding: 18px 4px 6px 0px;
  }
  .add-env-container {
    padding: 32px 0px;
    gap: 4px;
  }
  .add-env-mini-btn {
    background-color: transparent;
  }
  .add-env-mini-btn:hover {
    background-color: var(--border-color);
  }
  .add-env-mini-btn:active {
    background: var(--workspace-hover-color);
  }
  .add-env-desc-text {
    color: #999;
    font-size: 14px;
  }
  .add-env-btn {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }
  .env-item {
    padding: 6px 6px 6px 12px;
    font-size: 14px;
    cursor: pointer;
  }
  .env-item:hover {
    background: var(--border-color);
  }
  .env-item.active {
    background: var(--selected-active-sidebar);
  }
  .env-side-tab-list {
    list-style: none;
    overflow-x: hidden;
    overflow-y: scroll;
    height: 78vh;
  }
  .env-side-tab-list::-webkit-scrollbar {
    width: 2px;
  }
  .env-side-tab-list::-webkit-scrollbar-thumb {
    background: #888;
  }
  .show-more-btn {
    margin-right: 0;
    background-color: transparent;
    visibility: hidden;
  }

  .env-item:hover .show-more-btn {
    visibility: visible;
  }
  .show-more-btn.active {
    visibility: visible;
  }
  .rename-input {
    background-color: transparent;
  }
  .rename-input:focus {
    outline: none;
    background-color: var(--border-color);
    border-bottom: 1px solid #85c2ff !important;
  }
</style>
