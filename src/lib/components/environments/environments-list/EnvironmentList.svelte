<script lang="ts">
  import { PlusIcon } from "$lib/assets/app.asset";
  import { Tooltip } from "$lib/components";
  import { v4 as uuidv4 } from "uuid";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import { onDestroy } from "svelte";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { notifications } from "$lib/utils/notifications";
  import { isEnvironmentCreatedFirstTime } from "$lib/store/environment";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { isWorkspaceLoaded } from "$lib/store/workspace.store";
  import EnvironmentTab from "./sub-components/environment-tab/EnvironmentTab.svelte";
  import { generateSampleEnvironment } from "$lib/utils/sample/environment.sample";
  import { environmentType } from "$lib/utils/enums/environment.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";

  export let environmentRepositoryMethods: EnvironmentRepositoryMethods;
  export let environmentServiceMethods: EnvironmentServiceMethods;
  export let currentWorkspace;
  export let environments;
  export let currentEnvironment;

  let localEnvironment;
  let globalEnvironment;
  let isLoading: boolean = false;
  let environmentUnderCreation: boolean = false;

  $: {
    if (environments) {
      localEnvironment = [];
      globalEnvironment = [];
      environments.forEach((element) => {
        const _element = element.toMutableJSON();
        if (_element.type === "GLOBAL") {
          globalEnvironment.push(_element);
        } else if (_element.type === "LOCAL") {
          localEnvironment.push(_element);
        }
      });
    }
  }

  const handleOpenEnvironment = (id: string) => {
    let sampleEnvironment = generateSampleEnvironment(
      globalEnvironment[0]?.id,
      currentWorkspace._id,
      new Date().toString(),
    );
    sampleEnvironment.name = globalEnvironment[0]?.name;
    sampleEnvironment.isActive = true;
    sampleEnvironment.type = environmentType.GLOBAL;
    sampleEnvironment.variable = globalEnvironment[0]?.variable;
    environmentRepositoryMethods.createEnvironmentTab(
      sampleEnvironment,
      currentWorkspace._id,
    );
  };

  const workspaceLoadingSubscribe = isWorkspaceLoaded.subscribe((value) => {
    isLoading = !value;
  });

  const handleCreateEnvironment = async () => {
    environmentUnderCreation = true;
    isEnvironmentCreatedFirstTime.set(true);
    const newEnvironment = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: getNextEnvironment(localEnvironment, "New Environment"),
      variable: [
        {
          key: "",
          value: "",
          checked: true,
        },
      ],
      isActive: false,
      type: "LOCAL",
      workspaceId: currentWorkspace._id,
      createdAt: new Date().toISOString(),
    };

    environmentRepositoryMethods.createEnvironment(newEnvironment);
    const response = await environmentServiceMethods.createEnvironment({
      name: newEnvironment.name,
      workspaceId: currentWorkspace._id,
      variable: newEnvironment.variable,
    });
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      let sampleEnvironment = generateSampleEnvironment(
        res._id,
        currentWorkspace._id,
        new Date().toString(),
      );
      sampleEnvironment.name = res.name;
      sampleEnvironment.isActive = true;
      environmentRepositoryMethods.createEnvironmentTab(
        sampleEnvironment,
        currentWorkspace._id,
      );
      environmentUnderCreation = false;
      environmentRepositoryMethods.updateEnvironment(newEnvironment.id, {
        ...res,
        workspaceId: currentWorkspace._id,
      });
      notifications.success("New Environment Created!");
      return;
    } else {
      notifications.error("Failed to create environment. Please try again.");
    }
    MixpanelEvent(Events.CREATE_LOCAL_ENVIRONMENT);
    return;
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

  onDestroy(() => {
    workspaceLoadingSubscribe();
  });
</script>

<div class={`env-sidebar`} style={``}>
  <div
    class={`d-flex justify-content-between curr-workspace-heading-container my-2 `}
  >
    <h1
      class={`fw-medium lh-1 curr-workspace ps-3 my-auto ellipsis`}
      style={`font-size: 18px; text-color: #FFF;`}
    >
      {currentWorkspace?.name || ""}
    </h1>
    <Tooltip text={`Add Environment`}>
      <button
        class={`border-0 mx-3 rounded add-env-mini-btn  ${
          !environmentUnderCreation ? "pb-2 py-1" : "py-2"
        } px-2`}
        on:click={handleCreateEnvironment}
      >
        {#if environmentUnderCreation}
          <Spinner size={"18px"} />
        {:else}
          <PlusIcon width={15} height={15} color={`#8A9299`} />
        {/if}
      </button>
    </Tooltip>
  </div>

  {#if globalEnvironment && globalEnvironment.length > 0}
    <p
      class={`fw-normal env-item rounded m-2 px-2 ${
        globalEnvironment[0]?.id === currentEnvironment?.id && "active"
      }`}
      on:click={() => {
        handleOpenEnvironment(globalEnvironment[0]?.id);
      }}
    >
      {globalEnvironment[0]?.name}
    </p>
  {/if}
  <hr />

  {#if localEnvironment && localEnvironment.length === 0}
    <div class={`add-env-container `}>
      <p class={`add-env-desc-text fw-light text-center mb-5 p-2 pe-4`}>
        Add Environments to your Workspace to test your APIs with the relevant
        set of resources and constraints.
      </p>
      <button
        class={`add-env-btn d-flex rounded py-1 px-4 border-0 mx-auto w-fit`}
        on:click={handleCreateEnvironment}
      >
        <PlusIcon classProp={`my-auto me-2`} />
        <span class={`my-auto ps-2`}>Environment</span>
      </button>
    </div>
  {/if}
  <ul class={`env-side-tab-list sparrow-thin-scrollbar overflow-y-scroll px-2`}>
    {#if localEnvironment && localEnvironment.length > 0}
      {#each localEnvironment as env}
        <EnvironmentTab
          {env}
          {environmentServiceMethods}
          {environmentRepositoryMethods}
          {currentWorkspace}
          {currentEnvironment}
        />
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
