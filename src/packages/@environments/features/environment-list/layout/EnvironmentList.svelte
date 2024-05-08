<script lang="ts">
  import { PlusIcon } from "$lib/assets/app.asset";
  import { Tooltip } from "$lib/components";
  import { v4 as uuidv4 } from "uuid";
  import { onDestroy } from "svelte";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import { isEnvironmentCreatedFirstTime } from "$lib/store/environment";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { isWorkspaceLoaded } from "$lib/store/workspace.store";
  import { generateSampleEnvironment } from "$lib/utils/sample/environment.sample";
  import { environmentType } from "$lib/utils/enums/environment.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import List from "$lib/components/list/List.svelte";
  import type { WorkspaceRole } from "$lib/utils/enums";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import { ListItem } from "../components";

  export let currentWorkspace;
  export let environments;
  export let currentEnvironment;
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  export let isEnvLoading = false;

  export let onCreateEnvironment;
  export let onOpenGlobalEnvironment;
  export let onDeleteEnvironment;
  export let onUpdateEnvironment;
  export let onOpenEnvironment;
  export let onSelectEnvironment;

  let localEnvironment;
  let globalEnvironment;
  let isLoading: boolean = false;
  let environmentUnderCreation: boolean = false;
  let addEnvDisabled = false;

  const mapEnvironmentToWorkspace = (_env, _workspaceId) => {
    if (_env && _workspaceId) {
      localEnvironment = [];
      globalEnvironment = [];
      environments
        .filter((element) => {
          return element.workspaceId === _workspaceId;
        })
        .forEach((element) => {
          const _element = element.toMutableJSON();
          if (_element.type === "GLOBAL") {
            globalEnvironment.push(_element);
          } else if (_element.type === "LOCAL") {
            localEnvironment.push(_element);
          }
        });
    }
  };
  $: {
    if (environments || currentWorkspace?._id) {
      mapEnvironmentToWorkspace(environments, currentWorkspace?._id);
    }
    addEnvDisabled = !hasWorkpaceLevelPermission(
      loggedUserRoleInWorkspace,
      workspaceLevelPermissions.ADD_ENVIRONMENT,
    );
  }

  const workspaceLoadingSubscribe = isWorkspaceLoaded.subscribe((value) => {
    isLoading = !value;
  });

  onDestroy(() => {
    workspaceLoadingSubscribe();
  });
</script>

<div class={`env-sidebar p-3`} style={``}>
  <div
    class={`d-flex justify-content-between curr-workspace-heading-container mb-2 `}
  >
    <h1
      class={`fw-normal lh-1 curr-workspace my-auto ellipsis`}
      style={`font-size: 18px; text-color: #FFF;`}
    >
      {currentWorkspace?.name || ""}
    </h1>
    <Tooltip
      title={!addEnvDisabled ? `Add Environment` : PERMISSION_NOT_FOUND_TEXT}
      placement={"left"}
    >
      <button
        disabled={!hasWorkpaceLevelPermission(
          loggedUserRoleInWorkspace,
          workspaceLevelPermissions.ADD_ENVIRONMENT,
        )}
        class={`border-0 rounded add-env-mini-btn  ${
          !environmentUnderCreation ? "pb-2 py-1" : "py-2"
        } px-2`}
        on:click={onCreateEnvironment(localEnvironment)}
      >
        {#if environmentUnderCreation}
          <Spinner size={"18px"} />
        {:else}
          <PlusIcon width={15} height={15} color={`#8A9299`} />
        {/if}
      </button>
    </Tooltip>
  </div>

  {#if false}
    <div class="spinner">
      <Spinner size={`32px`} />
    </div>
  {:else}
    {#if globalEnvironment && globalEnvironment.length > 0}
      <p
        class={`fw-normal env-item rounded my-2 ${
          globalEnvironment[0]?.id === currentEnvironment?.id && "active"
        }`}
        on:click={() => {
          onOpenGlobalEnvironment(globalEnvironment[0]);
        }}
      >
        {globalEnvironment[0]?.name}
      </p>
    {/if}
    <hr class="mb-0" />

    {#if localEnvironment && localEnvironment.length === 0}
      <div class={`add-env-container py-3`}>
        <p class={`add-env-desc-text fw-light text-center mb-3`}>
          Add Environments to your Workspace to test your APIs with the relevant
          set of resources and constraints.
        </p>
        <Tooltip
          title={PERMISSION_NOT_FOUND_TEXT}
          show={!hasWorkpaceLevelPermission(
            loggedUserRoleInWorkspace,
            workspaceLevelPermissions.ADD_COLLECTIONS,
          )}
        >
          <button
            disabled={!hasWorkpaceLevelPermission(
              loggedUserRoleInWorkspace,
              workspaceLevelPermissions.ADD_COLLECTIONS,
            )}
            class={`add-env-btn w-100 d-flex rounded justify-content-center py-1 px-4 border-0 mx-auto w-fit`}
            on:click={handleCreateEnvironment}
          >
            <PlusIcon classProp={`my-auto`} />
            <span class={`my-auto ps-2`}>Environment</span>
          </button>
        </Tooltip>
      </div>
    {/if}
    <ul class={`env-side-tab-list p-0`}>
      {#if localEnvironment && localEnvironment.length > 0}
        <List height={"calc(100vh - 180px)"} classProps={"py-2"}>
          {#each localEnvironment as env}
            <ListItem
              {env}
              {currentWorkspace}
              {currentEnvironment}
              {onDeleteEnvironment}
              {onUpdateEnvironment}
              {onOpenEnvironment}
              {onSelectEnvironment}
            />
          {/each}
        </List>
      {/if}
    </ul>
  {/if}
</div>

<style lang="scss">
  .navbar {
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
    height: calc(100vh - 44px);
  }
  .curr-workspace {
    max-height: 20vw;
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
    overflow: none;
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
  .spinner {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
</style>
