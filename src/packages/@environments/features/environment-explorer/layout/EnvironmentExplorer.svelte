<script lang="ts">
  import { HelpIcon, SaveIcon } from "$lib/assets/app.asset";
  import type { EnvValuePair } from "$lib/utils/interfaces/request.interface";
  import { QuickHelp } from "../components";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { userWorkspaceLevelRole } from "$lib/store";
  import { TabularInput } from "@environments/common/components";
  import { WithButton } from "@environments/common/hoc";
  import { Input } from "@library/forms";

  /**
   * selected environmet to be shown on API
   */
  export let currentEnvironment;
  /**
   * updates the environment name
   */
  export let onUpdateName;
  /**
   * updates the environment variables
   */
  export let onUpdateVariable;
  /**
   * saves the environment
   */
  export let onSaveEnvironment;

  let quickHelp: boolean = false;
  let search = "";
  let environmentName = "";

  $: {
    if ($currentEnvironment) {
      environmentName = $currentEnvironment?.name;
    }
  }

  const handleCurrentEnvironmentNameChange = (_name, event) => {
    onUpdateName(_name, event);
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
        <Input
          width={"calc(100% - 500px)"}
          type="text"
          bind:value={environmentName}
          on:input={(e) => {
            handleCurrentEnvironmentNameChange(environmentName, "");
          }}
          on:blur={(e) => {
            handleCurrentEnvironmentNameChange(environmentName, "blur");
          }}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"var(--border-primary-300)"}
          class="text-fs-18 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;"
          disabled={$currentEnvironment?.type == "GLOBAL"}
          placeholder=""
        />
        <div class={`d-flex env-btn-container`}>
          <div class="position-relative">
            <Input
              type="search"
              bind:value={search}
              on:input={() => {}}
              width={"300px"}
              class="text-fs-12 rounded p-2 bg-secondary-600"
              style="outline:none;"
              placeholder="Search Variables"
              defaultBorderColor="transparent"
              hoveredBorderColor={"var(--border-primary-300)"}
              focusedBorderColor={"var(--border-primary-300)"}
            />
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
              <WithButton
                icon={SaveIcon}
                onClick={onSaveEnvironment}
                disable={$currentEnvironment.isSaveInProgress ||
                  $currentEnvironment.isSave ||
                  !hasWorkpaceLevelPermission(
                    $userWorkspaceLevelRole,
                    workspaceLevelPermissions.ADD_ENVIRONMENT,
                  )}
                loader={$currentEnvironment.isSaveInProgress}
              />
            </div>
          </Tooltip>
          <span>
            <WithButton
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
</style>
