<script lang="ts">
  import { HelpIcon, SaveIcon } from "$lib/assets/app.asset";
  import EnvValue from "$lib/components/env-value/EnvValue.svelte";
  import type { EnvironmentDocument } from "$lib/database/app.database";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import type { Observable } from "rxjs";
  import { EnvironmentPanelViewModel } from "./EnvironmentPanel.ViewModel";
  import { onDestroy } from "svelte";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import type { EnvValuePair } from "$lib/utils/interfaces/request.interface";
  const _environmentPanelViewModel = new EnvironmentPanelViewModel();
  export let environmentRepositoryMethods: EnvironmentRepositoryMethods;
  export let environmentServiceMethods: EnvironmentServiceMethods;
  export let currentEnvironment: any;
  let environmentChanged: {
    name: boolean;
    variable: boolean;
  } = {
    name: false,
    variable: false,
  };
  let changedName: string;
  let changedKeyValuePair: EnvValuePair[];
  let initialKeyValuePair: EnvValuePair[] = [
    { key: "", value: "", checked: true },
  ];
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
    if (pairs == currentEnvironment.variable) {
      environmentChanged.variable = false;
      changedKeyValuePair = undefined;
    } else {
      environmentChanged.variable = true;
      initialKeyValuePair = pairs;
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
    console.log("saved!");
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
    environmentChanged.name = false;
    environmentChanged.variable = false;
  };
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<div class={`env-panel`}>
  <header class={`env-header justify-content-between d-flex`}>
    <input
      type="text"
      class={`env-heading fw-normal bg-transparent border-0`}
      value={currentEnvironment?.name}
      on:change={(e) => handleCurrentEnvironmentNameChange(e)}
    />
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
        /><span>Save</span></button
      >
    </div>
  </header>
  <section class={`var-value-container`}>
    <EnvValue
      keyValue={currentEnvironment.variable.length == 0
        ? initialKeyValuePair
        : currentEnvironment.variable}
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
    color: white;
  }
  .env-btn-container {
    gap: 24px;
  }
  .var-value-container {
    width: 40vw;
  }
</style>
