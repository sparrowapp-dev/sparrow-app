<script lang="ts">
  import { PlusIcon } from "@library/icons";
  import { Tooltip } from "$lib/components";
  import Spinner from "@library/ui/spinner/Spinner.svelte";
  import List from "@library/ui/list/List.svelte";
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

<div
  class={` env-sidebar bg-secondary-900 px-2 py-3`}
  style="font-weight: 500;"
>
  <div
    class={`d-flex justify-content-between curr-workspace-heading-container mb-2 `}
  >
    <p class={`mb-0 text-secondary-170 ellipsis text-fs-16`}>
      {currentWorkspace?.name || ""}
    </p>

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
  </div>

  {#if false}
    <div>
      <Spinner size={`32px`} />
    </div>
  {:else}
    {#if globalEnvironment && globalEnvironment.length > 0}
      <p
        role="button"
        class={`fw-normal env-item text-fs-12 border-radius-2 my-2 ${
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

    <p class="fw-normal text-fs-12 rounded my-3" style="padding-left: 12px;">
      Environment Variables
    </p>
    {#if localEnvironment && localEnvironment.length === 0}
      <div class={`pb-2`}>
        <p
          class={`mx-4 add-env-desc-text mb-3 text-fs-12 mb-0 fw-normal text-center`}
          style="color: var(--text-secondary-50)"
        >
          Add Environments to your Workspace to test your APIs with the relevant
          set of resources and constraints.
        </p>
        <p
          class="mx-4 add-environment d-flex justify-content-center align-items-center border-radius-2"
          style="color: var(--text-secondary-100);"
          role="button"
          on:click={() => {
            onCreateEnvironment(localEnvironment);
          }}
        >
          <PlusIcon
            height={"22px"}
            width={"22px"}
            color={"var(--text-secondary-200)"}
          />
          <span
            style="color: var(--text-secondary-200)"
            class="ps-2 fw-bold text-fs-12">Add Environment</span
          >
        </p>
      </div>
    {/if}
    {#if localEnvironment && localEnvironment.length > 0}
      <ul class={`env-side-tab-list p-0`}>
        <List height={"calc(100vh - 180px)"} classProps={"pb-2 pe-2"}>
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
      </ul>
    {/if}
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
  .add-environment {
    border: 1px solid var(--text-secondary-300);
    height: 32px;
  }
</style>
