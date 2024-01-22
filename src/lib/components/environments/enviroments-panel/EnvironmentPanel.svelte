<script lang="ts">
  import { HelpIcon, SaveIcon } from "$lib/assets/app.asset";
  import EnvValue from "$lib/components/env-value/EnvValue.svelte";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import { EnvironmentPanelViewModel } from "./EnvironmentPanel.ViewModel";
  import type { EnvValuePair } from "$lib/utils/interfaces/request.interface";
  import { notifications } from "$lib/utils/notifications";
  import QuickHelp from "./sub-components/quick-help/QuickHelp.svelte";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { environmentType } from "$lib/utils/enums/environment.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";

  export let environmentRepositoryMethods: EnvironmentRepositoryMethods;
  export let environmentServiceMethods: EnvironmentServiceMethods;
  export let currentEnvironment;
  export let activeWorkspace;

  const _environmentPanelViewModel = new EnvironmentPanelViewModel();
  let quickHelp: boolean = false;

  const handleCurrentEnvironmentNameChange = (e: any) => {
    environmentRepositoryMethods.setEnvironmentTabProperty(
      e.target.value,
      "name",
      currentEnvironment.id,
    );
  };

  const handleCurrentEnvironmentKeyValuePairChange = (
    pairs: EnvValuePair[],
  ) => {
    environmentRepositoryMethods.setEnvironmentTabProperty(
      pairs,
      "variable",
      currentEnvironment.id,
    );
  };

  const handleSaveEnvironment = async () => {
    await environmentRepositoryMethods.setEnvironmentTabProperty(
      true,
      "isSaveInProgress",
      currentEnvironment.id,
    );
    const response = await environmentServiceMethods.updateEnvironment(
      activeWorkspace._id,
      currentEnvironment.id,
      {
        name: currentEnvironment.name,
        variable: currentEnvironment.variable,
      },
    );
    if (response.isSuccessful) {
      environmentRepositoryMethods.updateEnvironment(
        response.data.data._id,
        response.data.data,
      );
      await environmentRepositoryMethods.setEnvironmentTabProperty(
        false,
        "isSaveInProgress",
        currentEnvironment.id,
      );
      environmentRepositoryMethods.setEnvironmentTabProperty(
        true,
        "isSave",
        currentEnvironment.id,
      );
      notifications.success(
        `Changes saved for ${currentEnvironment.name} environment.`,
      );
    } else {
      await environmentRepositoryMethods.setEnvironmentTabProperty(
        false,
        "isSaveInProgress",
        currentEnvironment.id,
      );
      notifications.error(
        `Failed to save changes for ${currentEnvironment.name} environment.`,
      );
    }
    if (currentEnvironment.type === environmentType.GLOBAL) {
      MixpanelEvent(Events.SAVE_GLOBAL_ENVIRONMENT_VARIABLES, {
        environmentName: currentEnvironment.name,
        environmanetId: currentEnvironment.id,
      });
    } else {
      MixpanelEvent(Events.SAVE_LOCAL_ENVIRONMENT_VARIABLES, {
        environmentName: currentEnvironment.name,
        environmanetId: currentEnvironment.id,
      });
    }
  };
</script>

{#if currentEnvironment}
  <div class={`env-panel d-flex`}>
    <div class="env-parent w-100 {quickHelp ? 'quick-help-active' : ''}">
      <header class={`env-header justify-content-between d-flex`}>
        <input
          type="text"
          class={`env-heading ellipsis fw-normal px-2 border-0`}
          value={currentEnvironment?.name}
          on:change={(e) => handleCurrentEnvironmentNameChange(e)}
          disabled={currentEnvironment?.type == "GLOBAL"}
        />
        <div class={`d-flex env-btn-container`}>
          <button class={`d-flex env-help-btn border-0 my-auto`}>
            <HelpIcon width={19} height={19} classProp={`me-2`} />
            <span
              class={``}
              on:click={() => {
                quickHelp = true;
              }}>How to use variables</span
            >
          </button>
          <button
            disabled={currentEnvironment.isSaveInProgress}
            class="d-flex border-0 rounded env-save-btn env-save-btn-enabled d-flex align-items-center"
            on:click={handleSaveEnvironment}
          >
            <div class="badge"></div>

            {#if currentEnvironment.isSaveInProgress}
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
            <span class={`${!currentEnvironment.isSave && "badge"}`}>{" "}</span
            >
          </button>
        </div>
      </header>
      <section class={`var-value-container`}>
        <EnvValue
          keyValue={currentEnvironment.variable}
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
    width: 76vw;
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
    color: var(--send-button);
    font-size: 12px;
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
</style>
