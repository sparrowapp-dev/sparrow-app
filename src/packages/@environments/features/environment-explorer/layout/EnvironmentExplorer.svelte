<script lang="ts">
  import { HelpIcon, SaveIcon } from "$lib/assets/app.asset";
  import type { EnvValuePair } from "$lib/utils/interfaces/request.interface";
  import { QuickHelp } from "../components";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";

  export let currentEnvironment;
  export let onUpdateName;
  export let onUpdateVariable;
  export let onSaveEnvironment;
  import { userWorkspaceLevelRole } from "$lib/store";
  import { TabularInput } from "@environments/common/components";
  import { WithIconButton } from "@environments/common/hoc";
  import { SearchIcon } from "$lib/assets/icons";

  let quickHelp: boolean = false;
  let search = "";

  const handleCurrentEnvironmentNameChange = (e: any) => {
    onUpdateName(e.target.value);
  };

  const handleCurrentEnvironmentKeyValuePairChange = (
    pairs: EnvValuePair[],
  ) => {
    onUpdateVariable(pairs);
  };
</script>

{#if $currentEnvironment?.environmentId}
  <div class={`env-panel d-flex`}>
    <div class="env-parent w-100 {quickHelp ? 'quick-help-active' : ''}">
      <header class={`env-header justify-content-between d-flex`}>
        <input
          type="text"
          class={`env-heading ellipsis fw-normal px-2 border-0`}
          value={$currentEnvironment?.name}
          on:input={(e) => handleCurrentEnvironmentNameChange(e)}
          disabled={$currentEnvironment?.type == "GLOBAL"}
        />
        <div class={`d-flex env-btn-container`}>
          <div class="position-relative">
            <input
              type="search"
              class="searchField text-fs-12 rounded p-2 bg-secondary-600"
              style="padding-left:35px !important; outline:none; width:300px;"
              placeholder="Search Variables"
              bind:value={search}
            />
            <span
              class="position-absolute"
              style="top:5px;
                    left: 10px"
            >
              <SearchIcon
                height={16}
                width={16}
                color={"var(--defaultcolor)"}
              />
            </span>
          </div>
          <Tooltip
            title={PERMISSION_NOT_FOUND_TEXT}
            show={!hasWorkpaceLevelPermission(
              $userWorkspaceLevelRole,
              workspaceLevelPermissions.ADD_ENVIRONMENT,
            )}
          >
            <div class="position-relative">
              {#if !$currentEnvironment.isSave}
                <div class="badge-data d-block"></div>
              {/if}
              <WithIconButton
                icon={SaveIcon}
                onClick={onSaveEnvironment}
                disable={$currentEnvironment.isSaveInProgress ||
                  !hasWorkpaceLevelPermission(
                    $userWorkspaceLevelRole,
                    workspaceLevelPermissions.ADD_ENVIRONMENT,
                  )}
                loader={$currentEnvironment.isSaveInProgress}
              />
            </div>
          </Tooltip>
          <span>
            <WithIconButton
              icon={HelpIcon}
              onClick={() => {
                quickHelp = true;
              }}
              disable={false}
              loader={false}
            />
          </span>
        </div>
      </header>
      <section class={`var-value-container`}>
        <TabularInput
          loggedUserRoleInWorkspace={$userWorkspaceLevelRole}
          keyValue={$currentEnvironment.variable}
          callback={handleCurrentEnvironmentKeyValuePairChange}
          {search}
        />
      </section>
    </div>
    {#if quickHelp}
      <div class="quick-help">
        <QuickHelp
          closeQuickHelp={() => {
            quickHelp = false;
          }}
        />
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .env-panel {
    background-color: var(--bg-secondary-800);
    height: calc(100vh - 44px);
  }
  .env-header {
    padding: 20px 0px 10px 6px;
  }
  .env-heading {
    font-size: 18px;
    background-color: transparent;
    width: calc(100% - 500px);
  }
  .env-heading:disabled {
    color: white;
  }
  .env-heading:focus {
    outline: none;
    border: 1px solid #85c2ff !important;
  }

  .env-help-btn {
    background: transparent;
    border: 0;
    color: var(--primary-btn-color);
    font-size: 12px;
  }
  .env-help-btn:hover {
    color: var(--send-button) !important;
  }
  .env-save-btn {
    padding: 6px 16px;
    opacity: 0.3;
    // background-color: var(--border-color);
  }
  .env-save-btn:disabled {
    color: white;
  }
  .env-save-btn-enabled {
    padding: 6px;
    opacity: 1;
    // background-color: var(--border-color);
    background-color: transparent;
    position: relative;
    color: white;
  }
  .badge-data {
    position: absolute;
    top: 3px;
    right: 3px;
    height: 3px;
    width: 3px;
    border-radius: 50%;
    background-color: #ff7878;
    color: white;
  }
  .env-btn-container {
    gap: 16px;
  }
  .var-value-container {
    width: 100%;
    height: calc(100vh - 130px);
    overflow-y: auto;
  }
  .quick-help {
    width: 280px;
    overflow-y: auto;
  }
  .env-parent {
    padding: 10px;
  }
  .quick-help-active {
    width: calc(100% - 280px) !important;
  }
  .env-help-btn:active {
    background-color: var(--selected-active-sidebar);
  }
  .searchField {
    border: 1px solid var(--border-secondary-400) !important;
  }
  .searchField:focus {
    border: 1px solid var(--border-primary-300) !important;
  }
</style>
