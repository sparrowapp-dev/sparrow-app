<script lang="ts">
  import { InfoFilled } from "@sparrow/library/icons";
  import { onDestroy, onMount } from "svelte";
  import { Toggle } from "@sparrow/library/ui";

  /**
   * environment dialog box position
   */
  export let environmentAxisX: number;
  export let environmentAxisY: number;
  export let disabled;
  /**
   * missed environment
   */
  export let localEnvKey: string;
  /**
   * handles environment dialog box
   */
  export let handleEnvironmentBox;
  /**
   * unique environment dialog box id
   */
  export let id: string;
  /**
   * environment data
   */
  export let onUpdateEnvironment;
  export let environmentVariables;
  let count = 0;
  function handleSelectClicked(event: MouseEvent) {
    const selectElement = document.getElementById(`env-not-found-${id}`);
    if (count) {
      if (JSON.stringify(event.target.className).includes("prevent-default")) {
        return;
      }
      if (selectElement && !selectElement.contains(event.target as Node)) {
        handleEnvironmentBox("", "");
      }
    }
    count = count + 1;
  }

  let addVariable = false;
  const newVariableObj = {
    key: localEnvKey,
    value: "",
  };
  let checkedToggle = false;
  let isGlobalVariable = false;

  $: {
    if (environmentVariables) {
      if (!environmentVariables.local) {
        checkedToggle = true;
        isGlobalVariable = true;
      }
    }
  }
  onDestroy(() => {
    window.removeEventListener("click", handleSelectClicked);
  });

  onMount(() => {
    window.addEventListener("click", handleSelectClicked);
  });
</script>

<div
  id={`env-not-found-${id}`}
  class="select-environment-popup d-flex"
  style="
      top:{environmentAxisY}px;
      left:{environmentAxisX}px;
      ;
      "
>
  <div class="content-panel w-100">
    {#if addVariable}
      <!-- add variable form -->
      <div>
        <input
          type="text"
          bind:value={newVariableObj.key}
          placeholder="Enter Key"
          disabled
          class="w-100 border-0 text-fs-12 border-radius-2 mb-2 p-2 fw-medium"
          style="background-color: var(--bg-ds-surface-400);placeholder-color: var(--text-ds-neutral-400)"
        />
        <input
          type="text"
          bind:value={newVariableObj.value}
          placeholder="Add Value"
          style={"outline:none;background-color: var(--bg-ds-surface-400);placeholder-color: var(--text-ds-neutral-400); color: var(--text-ds-neutral-200)"}
          class="w-100 border-0 outline-0 text-fs-12 border-radius-2 mb-2 p-2 fw-medium"
        />
        <div
          class="global-variable d-flex align-items-center justify-content-between pb-2"
        >
          <p class="text-fs-12 mb-0" style="color:var(--text-ds-neutral-200)">
            Global variable
          </p>
          <div class="form-check form-switch">
            <Toggle
              bind:isActive={checkedToggle}
              disabled={!environmentVariables.local}
              onChange={() => {
                isGlobalVariable = !isGlobalVariable;
              }}
            />
          </div>
        </div>

        <div
          class="prevent-default text-fs-12 text-center border-radius-2 p-2 bg-primary-300"
          on:click={async (e) => {
            const response = await onUpdateEnvironment(
              isGlobalVariable,
              environmentVariables,
              newVariableObj,
            );
            if (response.isSuccessful) {
              handleEnvironmentBox("", "");
            }
          }}
        >
          Add & Apply
        </div>
      </div>
    {:else}
      <!-- Missed env -->
      <p class="text-fs-12 d-flex align-items-center">
        <span>
          <InfoFilled size="16px" color="var(--bg-ds-danger-300)" />
        </span><span
          class="ms-2"
          style="color:var(--text-ds-neutral-50); line-height: 1.5;"
          >Missing Variable</span
        >
      </p>
      <p
        class="text-fs-12"
        style="color:var(--text-ds-neutral-50); line-height: 1.5;"
      >
        This variable is missing in your workspace.
        {#if !disabled}
          Try adding it as a global variable or under the active environment.
        {/if}
      </p>
      {#if !disabled}
        <div
          class="add-btn prevent-default text-fs-12 text-center add-variable-btn border-radius-2 p-2"
          role="button"
          on:click={(e) => {
            e.preventDefault();
            addVariable = true;
          }}
        >
          Add Variable
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .content-panel {
    background-color: var(--bg-ds-surface-600);
  }
  .select-environment-popup {
    width: 222px;
    height: auto;
    position: fixed;
    z-index: 900;
    flex-wrap: wrap;
    overflow-y: auto;
    background-color: var(--bg-ds-surface-600);
    border-radius: 4px;
    padding: 12px;
  }
  .variable-highlight {
    color: white;
  }
  .add-btn {
    background-color: var(--bg-ds-primary-400);
  }

  .add-btn:hover {
    background: var(--button-active);
  }
  .add-btn:active {
    background: var(--bg-primary-300);
  }
</style>
