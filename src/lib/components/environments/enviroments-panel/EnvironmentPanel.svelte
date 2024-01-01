<script lang="ts">
  import { HelpIcon, SaveIcon } from "$lib/assets/app.asset";
  import EnvValue from "$lib/components/env-value/EnvValue.svelte";
  import type { EnvironmentDocument } from "$lib/database/app.database";
  import { createDeepCopy } from "$lib/utils/helpers/conversion.helper";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import type { Observable } from "rxjs";
  import { EnvironmentPanelViewModel } from "./EnvironmentPanel.ViewModel";
  import { onDestroy } from "svelte";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import type { EnvValuePair } from "$lib/utils/interfaces/request.interface";
    import { notifications } from "$lib/utils/notifications";
  const _environmentPanelViewModel = new EnvironmentPanelViewModel();
  export let environmentRepositoryMethods: EnvironmentRepositoryMethods;
  export let environmentServiceMethods: EnvironmentServiceMethods;
  export let currentEnvironment: any;
  export let environmentChanged: {
    name: boolean;
    variable: boolean;
  } = {
    name: false,
    variable: false,
  };
  let changedName: string;
  let changedKeyValuePair: EnvValuePair[];
  let initialKeyValuePair: EnvValuePair[] = currentEnvironment.variable;
  const handleCurrentEnvironmentNameChange = (e: any) => {
    if (e.target.value !== currentEnvironment.name) {
      environmentChanged.name = true;
      changedName = e.target.value;
    } else {
      changedName = undefined;
      environmentChanged.name = false;
    }
  };
  const handleCurrentEnvironmentKeyValuePairChange = (
    pairs: EnvValuePair[],
  ) => {
    if (pairs == createDeepCopy(currentEnvironment.variable)) {
      environmentChanged.variable = false;
      changedKeyValuePair = undefined;
    } else {
      environmentChanged.variable = true;
      currentEnvironment.variable = pairs;
      changedKeyValuePair = pairs;
    }
  };
  let activeWorkspaceRxDoc: EnvironmentDocument;
  let currentWorkspaceId: string;
  const activeWorkspace: Observable<EnvironmentDocument> =
    environmentRepositoryMethods.getActiveWorkspace();
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: EnvironmentDocument) => {
      activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
        return;
      }
    },
  );
  const handleSaveEnvironment = () => {
    environmentServiceMethods.updateEnvironment(
      currentWorkspaceId,
      currentEnvironment.id,
      {
        name: changedName ? changedName : currentEnvironment.name,
        variable: changedKeyValuePair
          ? changedKeyValuePair
          : currentEnvironment.variable,
      },
    );
    environmentRepositoryMethods.updateEnvironment(currentEnvironment.id, {
      name: changedName ? changedName : currentEnvironment.name,
      isActive: true,
      variable: changedKeyValuePair
        ? changedKeyValuePair
        : currentEnvironment.variable,
    });
    notifications.success(`Changes saved for ${changedName ? changedName : currentEnvironment.name} environment.`);
    environmentChanged.name = false;
    environmentChanged.variable = false;
  };
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<div class={`env-panel`}>
  <header class={`env-header justify-content-between d-flex`}>
    <!-- {#if currentEnvironment.type == "GLOBAL"}
      <p class={`env-heading fw-normal border-0`}>
        {currentEnvironment?.name}
      </p>
    {:else} -->
    <input
      type="text"
      class={`env-heading fw-normal px-2 border-0`}
      value={currentEnvironment?.name}
      on:change={(e) => handleCurrentEnvironmentNameChange(e)}
      disabled={currentEnvironment.type == "GLOBAL"}
    />
    <!-- {/if} -->
    <div class={`d-flex env-btn-container`}>
      <button class={`d-flex env-help-btn border-0 my-auto`}>
        <HelpIcon width={19} height={19} classProp={`me-2`} />
        <span class={``}>How to use variables</span>
      </button>
      <button
        class={`d-flex ${
          !environmentChanged.name && !environmentChanged.variable
            ? "env-save-btn"
            : "env-save-btn-enabled"
        } border-0`}
        disabled={!environmentChanged.name && !environmentChanged.variable}
        on:click={() =>
          (environmentChanged.name || environmentChanged.variable) &&
          handleSaveEnvironment()}
        ><SaveIcon
          width={16}
          height={16}
          classProp={`me-2 my-auto rounded`}
        /><span>Save</span><span
          class={`${
            (environmentChanged.name || environmentChanged.variable) && "badge"
          }`}>{" "}</span
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

<style lang="scss">
  .env-panel {
    background-color: var(--background-color);
    width: 75vw;
    height: 94vh;
    padding: 3vw;
  }
  .env-header {
    margin-bottom: 24px;
  }
  .env-heading {
    font-size: 18px;
    background-color: transparent;
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
    background-color: #FF7878;
    color: white;
  }
  .env-btn-container {
    gap: 24px;
  }
  .var-value-container {
    width: 40vw;
  }
</style>
