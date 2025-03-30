<script lang="ts">
  import {
    PlusIcon,
    StackIcon,
    StackFilled,
    ChevronRightRegular,
    ChevronDownRegular,
    AddRegular,
    LayerRegular,
    GlobeRegular,
  } from "@sparrow/library/icons";
  import { Button, List } from "@sparrow/library/ui";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "@sparrow/common/constants/permissions.constant";
  import { hasWorkpaceLevelPermission } from "@sparrow/common/utils";
  import { ListItem } from "../components";
  import { angleRightV2Icon as angleRight } from "@sparrow/library/assets";
  import { Tooltip } from "@sparrow/library/ui";
  import { isExpandEnvironment } from "../../../stores/recent-left-panel";

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

  // export let isExpandEnvironment = false;

  export let toggleExpandEnvironment;

  export let activeTabId;
  export let ActiveTab;
  export let handleTabUpdate;

  let isExpandEnviromentLine = false;
  export let activeTabType;

  $: {
    // console.log(activeTabId);

    if (environments?.find((item) => item._data.id === activeTabId)) {
      isExpandEnviromentLine = true;
    } else {
      isExpandEnviromentLine = false;
    }
  }

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

  const handleCreateEnvironment = async () => {
    if (!$isExpandEnvironment) {
      isExpandEnvironment.update((value) => !value);
    }
    await onCreateEnvironment(localEnvironment);
    setTimeout(() => {
      scrollToBottom();
    }, 1000);
  };

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
  class={`d-flex flex-column  h-100     pt-0 px-1`}
  style="font-weight: 500;"
  id="Environment-container"
>
  <div
    tabindex="0"
    class=" env-sidebar d-flex align-items-center border-radius-2 me-0 mb-0 pe-2"
    style="cursor:pointer; justify-content: space-between; height:32px ;gap:4px;"
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:click={() => {
      toggleExpandEnvironment();
      handleTabUpdate("enviroment");
    }}
  >
    <div
      class="d-flex align-items-center"
      style="width: calc(100% - 30px);  padding:4px 2px;"
    >
      <span style="  display: flex; margin-right:4px; ">
        <Button
          size="extra-small"
          customWidth={"24px"}
          type="teritiary-regular"
          startIcon={!$isExpandEnvironment
            ? ChevronRightRegular
            : ChevronDownRegular}
        />
      </span>

      <span
        style="   display: flex; width:30px; height:24px; align-items:center; justify-content:end; padding:4px;  "
      >
        <LayerRegular size={"16px"} color="var(--bg-ds-neutral-300)" />
      </span>
      <span style="padding:2px 4px;">
        <p
          class=" mb-0 sparrow-fs-13"
          style="font-weight:400; font-size:12px; line-height:18px; color:var(--bg-ds-neutral-50);"
        >
          Environments
        </p>
      </span>
    </div>
    {#if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER}
      <Tooltip
        title={"Add Environment"}
        placement={"bottom-center"}
        distance={13}
        show={isHovered}
        zIndex={701}
      >
        <span class="add-icon-container d-flex">
          <Button
            disabled={loggedUserRoleInWorkspace ===
              WorkspaceRole.WORKSPACE_VIEWER}
            size="extra-small"
            customWidth={"24px"}
            type="teritiary-regular"
            onClick={(e) => {
              e.stopPropagation();
              handleCreateEnvironment(e);
            }}
            startIcon={AddRegular}
          />
        </span>
      </Tooltip>
    {/if}
  </div>

  {#if $isExpandEnvironment}
    <div
      style="flex: 1; height: 32px; background-color: {ActiveTab ===
      'enviroment'
        ? 'var(--bg-ds-surface-600)'
        : 'transparent'};"
      class="overflow-auto"
      bind:this={scrollDiv}
    >
      {#if filteredGlobalEnvironment?.length}
        <div class="mb-0 env-Global">
          <p
            tabindex="0"
            role="button"
            class={`fw-normal env-item text-fs-12 border-radius-2  ${
              globalEnvironment[0]?.id === activeTabId && "active"
            }`}
            style="height: 32px; display:flex; align-items:center; padding-left:18px; margin-bottom:2px; position:relative; gap:0px;"
            on:click={() => {
              onOpenGlobalEnvironment(globalEnvironment[0]);
            }}
          >
            <span
              class="icon-default"
              style="width: 24px; height:24px; margin-right:4px;"
            >
            </span>
            <span class="icon-default">
              <GlobeRegular size="16px" color="var(--icon-ds-neutral-300)" />
            </span>

            <span
              class="box-line1"
              style="background-color: {isExpandEnviromentLine
                ? 'var(--bg-ds-neutral-500)'
                : 'var(--bg-ds-surface-100)'}"
            ></span>
            <span
              class=""
              style="color:var(--bg-ds-neutral-200); padding: 2px 4px;"
              >{globalEnvironment[0]?.name}
            </span>
          </p>
        </div>
        <hr class="m-0 me-1 mt-1 mb-1" style="margin-left: 2rem !important" />
      {/if}
      {#if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER && !filteredLocalEnvironment?.length && !searchData}
        <div class={`pb-2 px-1`}>
          <p
            class={`add-env-desc-text mt-2 mb-3 text-fs-12 mb-0 fw-normal text-center`}
            style="color: var(--text-secondary-50)"
          >
            Add Environments in your Workspace for precise API testing with
            relevant resources and constraints.
          </p>
          <Button
            title="Add Environment"
            startIcon={AddRegular}
            type="secondary"
            size="small"
            customWidth="100%"
            disabled={loggedUserRoleInWorkspace ===
              WorkspaceRole.WORKSPACE_VIEWER}
            onClick={() => {
              onCreateEnvironment(localEnvironment);
            }}
          >
            startIcon = {AddRegular}
          </Button>
        </div>
      {/if}

      <div class="position-relative">
        {#if filteredLocalEnvironment?.length}
          <!-- <div class="mb-1 mt-0 ms-5 me-2" style="height: 1px; background-color:white"></div> -->
          <div
            class="box-line"
            style="background-color: {isExpandEnviromentLine
              ? 'var(--bg-ds-neutral-500)'
              : 'var(--bg-ds-surface-100)'}"
          ></div>
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
      </div>
      {#if !filteredGlobalEnvironment?.length && !filteredLocalEnvironment?.length && searchData}
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
  .env-Global {
    height: 32px;
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    border-radius: 2px;
  }

  .env-Global:hover {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400) !important;
  }
  .add-icon-container {
    visibility: hidden;
  }

  .env-Global:focus-visible {
    background-color: var(--bg-ds-surface-400) !important;
    border-radius: 4px;
    color: var(--text-ds-neutral-50);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  .env-Global:focus-visible .add-icon-container {
    visibility: visible;
  }
  .env-Global:active {
    background-color: var(--bg-ds-surface-500) !important;
    border-radius: 4px;
    color: var(--text-ds-neutral-50);
  }
  .env-Global:active .add-icon-container {
    visibility: visible;
  }
  .env-sidebar:hover {
    background-color: var(--bg-ds-surface-400) !important;
    border-radius: 4px;
    color: var(--text-ds-neutral-50);
  }
  .env-sidebar:hover .add-icon-container {
    visibility: visible;
  }
  .env-sidebar:active {
    background-color: var(--bg-ds-surface-500) !important;
    border-radius: 4px;
    color: var(--text-ds-neutral-50);
  }
  .env-sidebar:active .add-icon-container {
    visibility: visible;
  }
  .env-sidebar:focus-visible {
    background-color: var(--bg-ds-surface-400) !important;
    border-radius: 4px;
    color: var(--text-ds-neutral-50);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  .env-sidebar:focus-visible .add-icon-container {
    visibility: visible;
  }
  .icon-default {
    display: inline;
    height: 24px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 4px;
  }

  .icon-hover {
    display: none;
    height: 24px;
    width: 30px;
    align-items: center;
    justify-content: center;
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
    background-color: var(--bg-secondary-420);
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
    // gap: 4px;
  }
  .env-item:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .env-item:focus-visible {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  .env-item.active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .env-item.active:focus-visible {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
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
  .box-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 14.6px;
    width: 1px;
    // background-color: var(--bg-ds-surface-100);
    z-index: 10;
    /* height: 100px; */
  }
  .box-line1 {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 14.6px;
    width: 1px;
    // background-color: var(--bg-ds-surface-100);
    z-index: 10;
    height: 45px;
  }
</style>
