<script lang="ts">
  import { PlusIcon, StackIcon, StackFilled } from "@sparrow/library/icons";
  import { List } from "@sparrow/library/ui";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "@sparrow/common/constants/permissions.constant";
  import { hasWorkpaceLevelPermission } from "@sparrow/common/utils";
  import { ListItem } from "../components";
  import { angleRightV2Icon as angleRight } from "@sparrow/library/assets";
  import { Tooltip } from "@sparrow/library/ui";

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

  export let searchData;

  export let isExpandEnvironment = false;

  export let toggleExpandEnvironment;

  export let activeTabId;

  let scrollList;
  let localEnvironment;
  let globalEnvironment;
  let addEnvDisabled = false;
  let isHovered = false;

  const handleMouseOver = () => {
    isHovered = true;
  };

  const handleMouseOut = () => {
    isHovered = false;
  };

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

  async function handleCreateEnvironment() {
    if (!isExpandEnvironment) {
      isExpandEnvironment = !isExpandEnvironment;
    }
    await onCreateEnvironment(localEnvironment);
    setTimeout(() => {
      scrollToBottom();
    }, 1000);
  }

  $: filteredLocalEnvironment = searchData
    ? localEnvironment.filter((env) =>
        env.name.toLowerCase().includes(searchData.toLowerCase()),
      )
    : localEnvironment;

  $: filteredGlobalEnvironment = searchData
    ? globalEnvironment.filter((env) =>
        env.name.toLowerCase().includes(searchData.toLowerCase()),
      )
    : globalEnvironment;

  let scrollDiv;

  function scrollToBottom() {
    if (scrollDiv) {
      scrollDiv.scrollTo({
        top: scrollDiv.scrollHeight,
        behavior: "smooth",
      });
    }
  }
</script>

<div
  class={`d-flex flex-column  h-100 env-sidebar bg-secondary-900   pt-0 px-1`}
  style="font-weight: 500;"
>
  <div
    class="d-flex align-items-center rounded-1 me-0 mb-0 pe-2"
    style="cursor:pointer; justify-content: space-between; height:32px;
      background-color: {isHovered
      ? 'var(--dropdown-option-hover)'
      : 'transparent'}; "
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:click={toggleExpandEnvironment}
  >
    <div
      class="d-flex align-items-center ps-3 pe-1 py-1"
      style="width: calc(100% - 30px);"
    >
      <img
        src={angleRight}
        class="me-3"
        style="height:8px; width:4px; margin-right:8px; {isExpandEnvironment
          ? 'transform:rotate(90deg);'
          : 'transform:rotate(0deg);'}"
        alt="angleRight"
      />

      <StackIcon
        height={"12px"}
        width={"12px"}
        color={"var(--icon-secondary-130)"}
      />

      <p class="ms-2 mb-0 sparrow-fs-13" style="font-weight: 500;">
        Environments
      </p>
    </div>
    {#if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER}
      <Tooltip
        title={"Add Environment"}
        placement={"bottom"}
        distance={13}
        show={isHovered}
        zIndex={701}
      >
        <button
          style="height: 24px; width:24px;"
          disabled={loggedUserRoleInWorkspace ===
            WorkspaceRole.WORKSPACE_VIEWER}
          class="add-icon-container border-0 rounded-1 d-flex justify-content-center align-items-center {isHovered
            ? 'environment-active'
            : 'environment-inactive'}"
          on:click|stopPropagation={handleCreateEnvironment}
        >
          <PlusIcon
            height={"22px"}
            width={"22px"}
            color={"var( --white-color)"}
          />
        </button>
      </Tooltip>
    {/if}
  </div>

  {#if isExpandEnvironment}
    <div style="flex:1;" class="overflow-auto h-100 ps-2" bind:this={scrollDiv}>
      {#if filteredLocalEnvironment && localEnvironment.length === 0}
        {#if filteredGlobalEnvironment && filteredGlobalEnvironment.length > 0}
          <div class="mb-0">
            <p
              role="button"
              class={`fw-normal mb-1  ps-5 env-item text-fs-12 border-radius-2 my-1 ${
                globalEnvironment[0]?.id === activeTabId && "active"
              }`}
              on:click={() => {
                onOpenGlobalEnvironment(globalEnvironment[0]);
              }}
            >
              <span class="icon-default">
                <StackIcon
                  height={"12px"}
                  width={"12px"}
                  color={"var(--icon-secondary-130)"}
                />
              </span>
              <span class="icon-hover">
                <StackFilled
                  height={"12px"}
                  width={"12px"}
                  color={"var(--icon-secondary-130)"}
                />
              </span>
              <span class="ms-1">{globalEnvironment[0]?.name}</span>
            </p>
          </div>
        {/if}
        <div class={`pb-2 px-1`}>
          {#if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER && filteredGlobalEnvironment?.length !== 0}
            <p
              class={`add-env-desc-text mt-2 mb-3 text-fs-12 mb-0 fw-normal text-center`}
              style="color: var(--text-secondary-50)"
            >
              Add Environments in your Workspace for precise API testing with
              relevant resources and constraints.
            </p>
            <button
              disabled={loggedUserRoleInWorkspace ===
                WorkspaceRole.WORKSPACE_VIEWER}
              class="bg-transparent w-100 add-environment d-flex justify-content-center align-items-center border-radius-2"
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
            </button>
          {/if}
        </div>
      {/if}

      {#if filteredGlobalEnvironment && filteredGlobalEnvironment.length > 0 && localEnvironment.length !== 0}
        <div class="mb-0">
          <p
            role="button"
            class={`fw-normal mb-1  ps-5 env-item text-fs-12 border-radius-2 my-1 ${
              globalEnvironment[0]?.id === activeTabId && "active"
            }`}
            on:click={() => {
              onOpenGlobalEnvironment(globalEnvironment[0]);
            }}
          >
            <span class="icon-default">
              <StackIcon
                height={"12px"}
                width={"12px"}
                color={"var(--icon-secondary-130)"}
              />
            </span>
            <span class="icon-hover">
              <StackFilled
                height={"12px"}
                width={"12px"}
                color={"var(--icon-secondary-130)"}
              />
            </span>
            <span class="ms-1">{globalEnvironment[0]?.name}</span>
          </p>
        </div>
        <hr class="mb-1 mt-1 ms-5 me-2" />
      {/if}

      {#if filteredLocalEnvironment && filteredLocalEnvironment.length > 0}
        <!-- <div class="mb-1 mt-0 ms-5 me-2" style="height: 1px; background-color:white"></div> -->

        <List
          bind:scrollList
          height={"auto"}
          overflowY={"auto"}
          classProps={"pe-0"}
          style={"flex:1;"}
        >
          {#each filteredLocalEnvironment as env}
            <ListItem
              bind:loggedUserRoleInWorkspace
              {env}
              {currentWorkspace}
              {onDeleteEnvironment}
              {onUpdateEnvironment}
              {onOpenEnvironment}
              {onSelectEnvironment}
              {activeTabId}
            />
          {/each}
        </List>
      {/if}
      {#if filteredGlobalEnvironment?.length === 0 && filteredLocalEnvironment?.length === 0}
        <p
          class="mx-1 mb-2 mt-1 text-fs-12 mb-0 text-center"
          style="color: var(--text-secondary-550);  font-weight:300; letter-spacing: 0.5px;"
        >
          It seems we couldn't find the result matching your search query.
        </p>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .icon-default {
    display: inline;
  }

  .icon-hover {
    display: none;
  }

  .env-item:hover .icon-default {
    display: none;
  }

  .env-item:hover .icon-hover {
    display: inline;
  }

  .env-item.active .icon-default {
    display: none;
  }

  .env-item.active .icon-hover {
    display: inline;
  }

  .environment-inactive {
    visibility: hidden;
  }
  .environment-active {
    visibility: visible;
    background-color: transparent;
  }

  .environment-active:hover {
    visibility: visible;
    background-color: var(--bg-tertiary-190);
  }
  .environment-active:active {
    visibility: visible;
    background-color: var(--bg-secondary-420);
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
    background-color: var(--bg-secondary-320);
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
    border-radius: 2px;
    height: 32px;
  }
  .add-environment:hover {
    border: 1px solid var(--border-primary-300);
    border-radius: 2px;
  }
</style>
