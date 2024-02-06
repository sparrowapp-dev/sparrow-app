<script lang="ts">
  import Warning from "$lib/assets/warning.svg";
  import Cross from "$lib/assets/cross.svg";
  import { slide } from "svelte/transition";
  import type {
    EnvironmentResponseDto,
    UpdateEnvironmentPostBody,
  } from "$lib/utils/dto";
  import { notifications } from "$lib/utils/notifications";
  import Button from "$lib/components/buttons/Button.svelte";
  export let environmentAxisX;
  export let environmentAxisY;
  export let updateEnvironment: (
    workspaceId: string,
    environmentId: string,
    environment: UpdateEnvironmentPostBody,
  ) => Promise<EnvironmentResponseDto>;
  export let currentWorkspaceId: string;
  export let currentEnvironment;
  export let globalEnvironment;
  export let localEnvKey: string;
  export let handleEnvironmentBox: (change: boolean) => void;
  let addVariable = false;
  let isGlobalVariable = false;
  let variableData = localEnvKey;
  let valueData = "";
  let isAddDisable = true;
  let environmentName = "Dev";
  let checkedToggle = false;

  const changeVariableType = () => {
    isGlobalVariable = !isGlobalVariable;
  };
  const modifiedGlobalEnvironment = globalEnvironment.toMutableJSON();

  const checkDataInput = () => {
    if (variableData.length > 0 && valueData.length > 0) {
      isAddDisable = false;
    } else {
      isAddDisable = true;
    }
  };
  if (currentEnvironment.id === "none") {
    isGlobalVariable = true;
    checkedToggle = true;
  } else {
    environmentName = currentEnvironment.name;
  }
  const applyVariable = async () => {
    if (isGlobalVariable) {
      const payload = {
        name: modifiedGlobalEnvironment.name,
        variable: [
          ...modifiedGlobalEnvironment.variable,
          {
            key: variableData,
            value: valueData,
            checked: true,
          },
        ],
      };
      const response = await updateEnvironment(
        currentWorkspaceId,
        modifiedGlobalEnvironment.id,
        payload,
      );
      if (response.isSuccessful) {
        notifications.success("Environment Variable Added");
      } else {
        notifications.error("Failed to add Environment Variable");
      }
    } else {
      const payload = {
        name: currentEnvironment.name,
        variable: [
          ...currentEnvironment.variable,
          {
            key: variableData,
            value: valueData,
            checked: true,
          },
        ],
      };
      const response = await updateEnvironment(
        currentWorkspaceId,
        currentEnvironment.id,
        payload,
      );
      if (response.isSuccessful) {
        notifications.success("Environment Variable Added");
      } else {
        notifications.error("Failed to add Environment Variable");
      }
    }
    handleEnvironmentBox(false);
  };
</script>

{#if !addVariable}
  <div
    class="select-environment-popup d-flex p-2 rounded"
    style="
top:{environmentAxisY}px;
left:{environmentAxisX}px;
"
  >
    <div class="warning-message d-flex">
      <div class="d-flex align-self-start">
        <img src={Warning} alt="i" />
        <p class="missing-title align-self-end">Missing Variable</p>
      </div>
      <div>
        <img
          class="cross-icon"
          src={Cross}
          alt="x"
          on:click={() => handleEnvironmentBox(false)}
        />
      </div>
    </div>
    <p class="missing-discription" style="margin-top: 2%;">
      This variable is missing in your workspace. Try adding it as a global
      variable or under the active environment.
    </p>
    <div class="w-100">
      <Button
        title={"Add Variable"}
        type={"dark"}
        buttonClassProp={`w-100`}
        onClick={() => {
          addVariable = true;
        }}
        buttonStyleProp={`align-items: center; justify-content: center; height: 30px;`}
        textStyleProp={"font-size: 12px"}
      />
    </div>
  </div>
{:else if addVariable}
  <div
    class="add-environment-popup d-flex p-2 rounded"
    style="
top:{environmentAxisY}px;
left:{environmentAxisX}px;
"
    transition:slide
  >
    <div class="d-flex w-100 justify-content-end align-items-start mb-2">
      <img src={Cross} alt="x" on:click={() => handleEnvironmentBox(false)} />
    </div>
    <div class="input-class">
      <input
        type="text"
        placeholder="Enter Variable"
        class="variable-name"
        bind:value={variableData}
        on:input={checkDataInput}
      />
      <input
        type="text"
        placeholder="Enter Value"
        class="variable-name"
        bind:value={valueData}
        on:input={checkDataInput}
      />
    </div>
    <div class="global-variable d-flex">
      <p class="variable-switch">Global variable</p>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
          checked={checkedToggle}
          disabled={checkedToggle}
          on:change={() => {
            changeVariableType();
          }}
        />
      </div>
    </div>
    {#if !isGlobalVariable}
      <div class="variable-text">
        Adding to <span class="variable-highlight">{environmentName}</span> environment.
      </div>
    {:else}
      <div class="variable-text">
        Adding as <span class="variable-highlight">Global variable.</span>
      </div>
    {/if}
    <div class="w-100">
      <Button
        title={"Add & Apply"}
        type={"primary"}
        buttonClassProp={`w-100`}
        disable={isAddDisable}
        onClick={() => applyVariable()}
        buttonStyleProp={isAddDisable
          ? `align-items: center; justify-content: center; height: 30px; margin-top: 10px; opacity: 35%;`
          : `align-items: center; justify-content: center; height: 30px; margin-top: 10px;`}
        textStyleProp={"font-size: 12px"}
      />
    </div>
  </div>
{/if}

<svelte:window />

<style>
  .select-environment-popup {
    width: 240px;
    height: 160px;
    position: fixed;
    background-color: var(--background-dropdown);
    z-index: 5;
    flex-wrap: wrap;
    border: 1px solid var(--border-color);
  }
  .add-environment-popup {
    width: 260px;
    height: 220px;
    position: fixed;
    background-color: var(--background-dropdown);
    z-index: 5;
    flex-wrap: wrap;
    border: 1px solid var(--border-color);
  }
  .warning-message {
    justify-content: space-between;
    width: 100%;
  }
  .input-class {
    align-items: center;
  }
  .cross-icon {
    align-self: flex-end;
  }
  .form-check-input:checked {
    background-color: #1d3650 !important;
    color: #85c2ff !important;
  }
  .variable-switch {
    padding-left: 2%;
  }
  .variable-name {
    width: 100%;
    height: 30px;
    border: #000000;
    border-radius: 4px;
    margin-bottom: 4px;
    padding-left: 4px;
  }
  input::placeholder {
    color: var(--sparrow-text-color);
    padding-left: 4%;
    font-size: 12px;
  }
  .variable-text {
    color: var(--sparrow-text-color);
    font-size: 12px;
    font-weight: 400;
    padding-left: 2%;
  }
  .variable-highlight {
    color: var(--white-color);
    font-weight: 500;
  }
  .missing-title {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
    margin-top: 5px;
    margin-left: 5px;
    margin-bottom: 5px;
  }
  .missing-discription {
    color: var(--colors-neutral-bg-4, #999);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
    align-self: stretch;
  }
  .form-check-input {
    background-color: #45494d;
  }
  .form-check-input:checked {
    background-color: #1d3650;
  }
  .global-variable {
    width: 100%;
    justify-content: space-between;
    height: 12%;
  }
</style>
