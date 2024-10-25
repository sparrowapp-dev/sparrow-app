<script lang="ts">
  import { DangerIcon } from "@sparrow/library/icons";
  import { onDestroy, onMount } from "svelte";

  /**
   * environment dialog box position
   */
  export let environmentAxisX: number;
  export let environmentAxisY: number;
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
  class="select-environment-popup bg-tertiary-700 d-flex p-3 rounded"
  style="
      top:{environmentAxisY}px;
      left:{environmentAxisX}px;
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
          class="w-100 border-0 text-fs-12 bg-tertiary-400 border-radius-2 mb-2 p-2"
        />
        <input
          type="text"
          bind:value={newVariableObj.value}
          placeholder="Enter Value"
          style={"outline:none;"}
          class="w-100 border-0 outline-0 text-fs-12 bg-tertiary-400 border-radius-2 mb-2 p-2"
        />
        <div
          class="global-variable d-flex align-items-center justify-content-between pb-2"
        >
          <p class="variable-switch text-fs-12 mb-0">Global variable</p>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              id="flexSwitchCheckDefault"
              checked={checkedToggle}
              disabled={!environmentVariables.local}
              on:change={() => {
                isGlobalVariable = !isGlobalVariable;
              }}
            />
          </div>
        </div>
        {#if !isGlobalVariable && environmentVariables.local}
          <div class="variable-text">
            <p class="text-fs-12 text-secondary-200">
              Adding to <span class="variable-highlight"
                >{environmentVariables.local.name}</span
              > environment.
            </p>
          </div>
        {/if}
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
        <span><DangerIcon /></span><span class="ms-2">Missing Variable</span>
      </p>
      <p class="text-fs-12">
        This variable is missing in your workspace. Try adding it as a global
        variable or under the active environment.
      </p>
      <div
        class="add-btn prevent-default text-fs-12 text-center add-variable-btn border-radius-2 p-2 bg-tertiary-400"
        role="button"
        on:click={(e) => {
          e.preventDefault();
          addVariable = true;
        }}
      >
        Add Variable
      </div>
    {/if}
  </div>
</div>

<style>
  .select-environment-popup {
    width: 251px;
    height: auto;
    position: fixed;
    z-index: 900;
    flex-wrap: wrap;
    overflow-y: auto;
  }
  .variable-highlight {
    color: white;
  }

  .add-btn:hover {
    background: var(--button-active);
  }
  .add-btn:active {
    background: var(--bg-primary-300);
  }
</style>
