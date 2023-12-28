<script lang="ts">
  import { PlusIcon, SelectIcon } from "$lib/assets/app.asset";
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
  let environment: any[] = [];
  let environmentUnderCreation: boolean = false;
  let activeEnvironmentRxDoc: EnvironmentDocument;
  const _environmentListViewModel = new EnvironmentListViewModel();
  const _workspaceViewModel = new HeaderDashboardViewModel();
  export let environmentRepositoryMethods: EnvironmentRepositoryMethods;
  export let environmentServiceMethods: EnvironmentServiceMethods;
  export let currentEnvironment: any;
  const activeWorkspace: Observable<WorkspaceDocument> =
    environmentRepositoryMethods.getActiveWorkspace();

  let activeWorkspaceRxDoc: WorkspaceDocument;
  let currWorkspaceName: string;
  let currentWorkspaceId: string = "";
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

  const environments: Observable<EnvironmentDocument[]> =
    _environmentListViewModel.environment;

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
        environment = environmentArr;
        if (!activeEnvironmentRxDoc) {
          _environmentListViewModel.activateEnvironment(value[0].get("id"));
        }
      }
    },
  );

  const handleCreateEnvironmentClick = async () => {
    environmentUnderCreation = true;
    isEnvironmentCreatedFirstTime.set(true);
    const newEnvironment = {
      _id: UntrackedItems.UNTRACKED + uuidv4(),
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

      environmentRepositoryMethods.updateEnvironment(newEnvironment._id, res);
      _workspaceViewModel.updateEnvironmentInWorkspace(currentWorkspaceId, {
        _id: response.data.data._id,
        name: newEnvironment.name,
      });
      notifications.success("New Environment Created!");
      return;
    }
    return;
  };
  const handleActivateEnvironment = (id: string) => {
    
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
    activeWorkspaceSubscribe.unsubscribe();
    environmentSubscribe.unsubscribe();
  });
</script>

<div class={`env-sidebar`} style={``}>
  <div
    class={`d-flex justify-content-between curr-workspace-heading-container mb-2`}
  >
    <h1
      class={`fw-medium lh-1 curr-workspace`}
      style={`font-size: 18px; text-color: #FFF;`}
    >
      {currWorkspaceName || ""}
    </h1>
    <Tooltip text={`Add Environment`}>
      <button
        class={`border-0 bg-transparent`}
        on:click={handleCreateEnvironmentClick}
      >
        {#if environmentUnderCreation}
          <Spinner size={"15px"} />
        {:else}
          <PlusIcon width={15} height={15} color={`#8A9299`} />
        {/if}
      </button>
    </Tooltip>
  </div>
  <p class={`fw-normal env-item rounded active`}>Global Variables</p>
  <hr />

  {#if environment && environment.length == 0}
    <div class={`add-env-container `}>
      <p class={`add-env-desc-text fw-light text-center mb-5`}>
        Add Environments to your Workspace to test your APIs with the relevant
        set of resources and constraints.
      </p>
      <button
        class={`add-env-btn d-flex rounded py-1 px-3 border-0 mx-auto w-fit`}
        on:click={handleCreateEnvironmentClick}
      >
        <PlusIcon classProp={`my-auto me-2`} />
        <span class={`my-auto`}>Environment</span>
      </button>
    </div>
  {/if}
  <ul class={`env-side-tab-list overflow-y-scroll`}>
    {#if environment && environment.length > 0}
      {#each environment as env}
        <div class={`d-flex rounded`} on:click={handleActivateEnvironment(env)}>
          <SelectIcon classProp={`my-auto`} width={14} height={14} />
          <p class={`env-item my-auto fw-normal`}>{env?.name}</p>
        </div>
      {/each}
    {/if}
  </ul>
</div>

<style lang="scss">
  .env-sidebar {
    background-color: var(--background-color);
    height: 100vh;
    border-right: 1px solid var(--border-color);
    padding: 0px 24px 8px 12px;
    width: 20vw;
  }
  .curr-workspace-heading-container {
    padding: 18px 4px 6px 0px;
  }
  .add-env-container {
    padding: 32px 0px;
    gap: 24px;
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
  }
  .env-item.active {
    background: var(--selected-active-sidebar);
  }
  .env-side-tab-list {
    list-style: none;
    overflow-y: scroll;
    height: 100%;
  }
  .env-side-tab-list::-webkit-scrollbar {
    width: 2px;
  }
  .env-side-tab-list::-webkit-scrollbar-thumb {
    background: #888;
  }
</style>
