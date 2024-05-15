<script lang="ts">
  import { PlusIcon } from "@library/icons";
  import { Tooltip } from "$lib/components";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import List from "$lib/components/list/List.svelte";
  import type { WorkspaceRole } from "$lib/utils/enums";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import { ListItem } from "../components";
  import { WithButtonV2 } from "@environments/common/hoc";

  /**
   * current workspace
   */
  export let currentWorkspace;
  /**
   * environment list
   */
  export let environments;
  /**
   * opened environment
   */
  export let currentEnvironment;
  /**
   * workspace access permission
   */
  export let loggedUserRoleInWorkspace: WorkspaceRole;

  /**
   * creates the environment
   */
  export let onCreateEnvironment;
  /**
   * opens the global environment
   */
  export let onOpenGlobalEnvironment;
  /**
   * deletes the environment
   */
  export let onDeleteEnvironment;
  /**
   * updates the environment
   */
  export let onUpdateEnvironment;
  /**
   * opens the local environment
   */
  export let onOpenEnvironment;
  /**
   * selects the environment
   */
  export let onSelectEnvironment;

  let localEnvironment;
  let globalEnvironment;
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
</script>

<div class={`env-sidebar bg-secondary-900 px-3 py-3`} style={``}>
  <div
    class={`d-flex justify-content-between curr-workspace-heading-container mb-2 `}
  >
    <p
      class={`mb-0 text-whiteColor ellipsis text-fs-16`}
      style={`text-color: #FFF;`}
    >
      {currentWorkspace?.name || ""}
    </p>
    <Tooltip
      title={!addEnvDisabled ? `Add Environment` : PERMISSION_NOT_FOUND_TEXT}
      placement={"left"}
    >
      <WithButtonV2
        icon={PlusIcon}
        disable={!hasWorkpaceLevelPermission(
          loggedUserRoleInWorkspace,
          workspaceLevelPermissions.ADD_ENVIRONMENT,
        )}
        onClick={() => {
          onCreateEnvironment(localEnvironment);
        }}
        loader={false}
      />
    </Tooltip>
  </div>

  {#if false}
    <div>
      <Spinner size={`32px`} />
    </div>
  {:else}
    {#if globalEnvironment && globalEnvironment.length > 0}
      <p
        role="button"
        class={`fw-normal env-item text-fs-14 border-radius-2 my-2 ${
          globalEnvironment[0]?.id === currentEnvironment?.id && "active"
        }`}
        on:click={() => {
          onOpenGlobalEnvironment(globalEnvironment[0]);
        }}
      >
        {globalEnvironment[0]?.name}
      </p>
    {/if}
    <hr class="mb-0 mt-1" />

    <p class="fw-normal text-fs-14 rounded my-2" style="padding-left: 12px;">
      Environment Variables
    </p>
    {#if localEnvironment && localEnvironment.length === 0}
      <div class={`pt-3 pb-2`}>
        <p class={`add-env-desc-text text-fs-12 mb-0 fw-normal text-center`}>
          Add Environments to your Workspace to test your APIs with the relevant
          set of resources and constraints.
        </p>
      </div>
    {/if}
    <ul class={`env-side-tab-list p-0`}>
      <List height={"calc(100vh - 180px)"} classProps={"pb-2 pe-2"}>
        {#if localEnvironment && localEnvironment.length > 0}
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
        {/if}
        <p
          class="fw-normal d-flex align-items-center text-fs-14 m-2 ms-3"
          role="button"
          on:click={() => {
            onCreateEnvironment(localEnvironment);
          }}
        >
          <PlusIcon />
          <span>Add Environment</span>
        </p>
      </List>
    </ul>
  {/if}
</div>

<style lang="scss">
  .env-sidebar {
    height: calc(100vh - 44px);
  }
  .curr-workspace {
    max-height: 20vw;
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
  }
  .env-item {
    padding: 6px 6px 6px 12px;
  }
  .env-item:hover {
    background-color: var(--bg-secondary-800);
  }
  .env-item.active {
    background-color: var(--bg-tertiary-600);
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
</style>
