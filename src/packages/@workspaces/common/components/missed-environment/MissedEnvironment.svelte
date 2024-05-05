<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  //   export let filterData = [];
  export let environmentAxisX;
  export let environmentAxisY;
  export let localEnvKey;
  export let handleEnvironmentBox;
  export let id;
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
  <div class="left-panel pe-2 w-100">
    {#if addVariable}
      <!-- add variable form -->
      <div>
        <input
          type="text"
          bind:value={newVariableObj.key}
          placeholder="Enter Key"
          disabled
          class="w-100"
        />
        <input
          type="text"
          bind:value={newVariableObj.value}
          placeholder="Enter Value"
          class="w-100"
        />
        <div class="global-variable d-flex">
          <p class="variable-switch">Global variable</p>
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
            Adding to <span class="variable-highlight"
              >{environmentVariables.local.name}</span
            > environment.
          </div>
        {/if}
        <div
          class="prevent-default"
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
      <p class="text-fs-12">Missing Variable</p>
      <p class="text-fs-12">
        This variable is missing in your workspace. Try adding it as a global
        variable or under the active environment.
      </p>

      <div
        class="prevent-default"
        on:click={(e) => {
          e.preventDefault();
          addVariable = true;
        }}
      >
        Add Variable
      </div>
    {/if}
    <!-- <p>env not found</p>
    {localEnvKey} -->
  </div>
</div>

<style>
  .select-environment-popup {
    width: 400px;
    height: 250px;
    position: fixed;
    z-index: 900;
    flex-wrap: wrap;
  }
  .select-environment-popup .left-panel {
    height: 220px;
    overflow-y: auto;
  }
  .variable-highlight {
    color: white;
  }
</style>
