<script lang="ts">
  import { HelpIcon, SaveIcon } from "$lib/assets/app.asset";
  import EnvValue from "$lib/components/env-value/EnvValue.svelte";
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

  let quickHelp: boolean = false;

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
          <button
            on:click={() => {
              quickHelp = true;
            }}
            class={`d-flex env-help-btn border-0 p-1 pe-2 my-auto rounded`}
          >
            <HelpIcon width={19} height={19} classProp={`me-2`} />
            <span class={``}>How to use variables</span>
          </button>
          <Tooltip
            title={PERMISSION_NOT_FOUND_TEXT}
            show={!hasWorkpaceLevelPermission(
              $userWorkspaceLevelRole,
              workspaceLevelPermissions.ADD_ENVIRONMENT,
            )}
          >
            <button
              disabled={$currentEnvironment.isSaveInProgress ||
                !hasWorkpaceLevelPermission(
                  $userWorkspaceLevelRole,
                  workspaceLevelPermissions.ADD_ENVIRONMENT,
                )}
              class="d-flex border-0 rounded env-save-btn env-save-btn-enabled d-flex align-items-center"
              on:click={onSaveEnvironment}
            >
              <div class="badge"></div>

              {#if $currentEnvironment.isSaveInProgress}
                <span style="padding-right: 10px;">
                  <Spinner size={`${12}px`} />
                </span>
              {:else}
                <SaveIcon
                  width={16}
                  height={16}
                  classProp={`me-2 my-auto rounded `}
                />
              {/if}

              <span>Save</span>
              <span class={`${!$currentEnvironment.isSave && "badge"}`}
                >{" "}</span
              >
            </button>
          </Tooltip>
        </div>
      </header>
      <section class={`var-value-container`}>
        <EnvValue
          loggedUserRoleInWorkspace={$userWorkspaceLevelRole}
          keyValue={$currentEnvironment.variable}
          callback={handleCurrentEnvironmentKeyValuePairChange}
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
    background-color: var(--background-color);
    height: calc(100vh - 44px);
  }
  .env-header {
    margin-bottom: 24px;
  }
  .env-heading {
    font-size: 18px;
    background-color: transparent;
    width: calc(100% - 300px);
  }
  .env-heading:disabled {
    color: white;
  }
  .env-heading:focus {
    outline: none;
    background-color: var(--border-color);
    border-bottom: 1px solid #85c2ff !important;
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
    background-color: var(--border-color);
  }
  .env-save-btn:disabled {
    color: white;
  }
  .env-save-btn-enabled {
    padding: 6px 16px;
    opacity: 1;
    background-color: var(--border-color);
    position: relative;
    color: white;
  }
  .env-save-btn-enabled .badge {
    position: absolute;
    top: -2px;
    right: -2px;
    padding: 4px 4px;
    border-radius: 50%;
    background-color: #ff7878;
    color: white;
  }
  .env-btn-container {
    gap: 24px;
  }
  .var-value-container {
    width: 100%;
  }
  .quick-help {
    width: 280px;
    overflow-y: auto;
  }
  .env-parent {
    padding: 3vw;
  }
  .quick-help-active {
    width: calc(100% - 280px) !important;
  }
  .env-help-btn:active {
    background-color: var(--selected-active-sidebar);
  }
</style>
