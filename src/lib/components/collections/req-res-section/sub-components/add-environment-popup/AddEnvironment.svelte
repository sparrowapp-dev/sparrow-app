<script lang="ts">
  import Warning from "$lib/assets/warning.svg";
  import CustomButton from "$lib/components/buttons/CustomButton.svelte";
  import { slide } from "svelte/transition";
  import type { UpdateEnvironmentPostBody } from "$lib/utils/dto";
  import { notifications } from "$lib/utils/notifications";
  export let environmentAxisX;
  export let environmentAxisY;
  export let updateEnvironment: (
    workspaceId: string,
    environmentId: string,
    environment: UpdateEnvironmentPostBody,
  ) => any;
  export let currentWorkspaceId: string;
  export let currentEnvironment;
  export let globalEnvironment;
  export let handleEnvironmentBox: (change: boolean) => void;
  let addVariable = false;
  let isGlobalVariable = false;
  let variableData = "";
  let valueData = "";
  let isAddDisable = true;
  //   let activeVariable;
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
  console.log("curreenv", currentEnvironment);
  console.log("wsid", currentWorkspaceId);
  console.log("global", globalEnvironment.toMutableJSON());
  if (currentEnvironment.id === "none") {
    isGlobalVariable = true;
  }
  //   let scrollPosition = 0;
  //   const scrollTo = (direction) => {
  //     const container = document.getElementById("left-panel-environment");
  //     if (container) {
  //       if (direction === "bottom") {
  //         container.scrollTop += 10;
  //       } else {
  //         container.scrollTop -= 10;
  //       }
  //       scrollPosition = container.scrollTop;
  //     }
  //   };
  //   const handleKeyPress = (event) => {
  //     if (
  //       activeVariable === undefined &&
  //       (event.key === "ArrowDown" || event.key === "ArrowUp")
  //     ) {
  //       activeVariable = 0;
  //     } else if (event.key === "ArrowDown") {
  //       if (activeVariable >= filterData.length - 1) {
  //         activeVariable = filterData.length - 1;
  //       } else {
  //         scrollTo("bottom");
  //         activeVariable++;
  //       }
  //     } else if (event.key === "ArrowUp") {
  //       if (activeVariable <= 0) {
  //         activeVariable = 0;
  //       } else {
  //         activeVariable--;
  //         scrollTo("top");
  //       }
  //     }
  //     if (event.key === "Enter") {
  //       const preUrl = inputText?.substring(0, trackParanthesis[0]);
  //       const postUrl = inputText?.substring(trackCursor, inputText.length);
  //       updateText(
  //         preUrl + "{{" + filterData[activeVariable].key + "}}" + postUrl,
  //       );
  //       handleInputValue();
  //     }
  //   };
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
      console.log("dataglobal", response);
      if (response.isSuccessful) {
        notifications.success("Environment Variable Added");
        handleEnvironmentBox(false);
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
      console.log("datalocal", response);
      if (response.isSuccessful) {
        notifications.success("Environment Variable Added");
        handleEnvironmentBox(false);
      }
    }
  };
</script>

{#if !addVariable}
  <div
    class="select-environment-popup d-flex p-3 rounded"
    style="
top:{environmentAxisY}px;
left:{environmentAxisX}px;
"
  >
    <div class="warning-message d-flex">
      <img src={Warning} alt="i" />
      <p class="missing-title">Missing Variable</p>
    </div>
    <p class="missing-discription">
      This variable is missing in your workspace. Try adding it as a global
      variable or under the active environment.
    </p>
    <div class="w-100">
      <CustomButton
        text={"Add Variable"}
        fontSize={12}
        type={"dark"}
        classProp={`w-100`}
        onClick={() => {
          addVariable = true;
        }}
      />
    </div>
  </div>
{/if}
{#if addVariable}
  <div
    class="add-environment-popup d-flex p-3 rounded"
    style="
top:{environmentAxisY}px;
left:{environmentAxisX}px;
"
    transition:slide
  >
    <div class="warning-message">
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
      <p>Global variable</p>
      <label class="switch">
        <input
          type="checkbox"
          id="showPath"
          on:change={() => {
            changeVariableType();
          }}
        />
        <span class="slider round"></span>
      </label>
    </div>
    {#if !isGlobalVariable}
      <div class="variable-text">
        Adding to <span class="variable-highlight">Dev</span> environment.
      </div>
    {:else}
      <div class="variable-text">
        Adding as <span class="variable-highlight">Global variable.</span>
      </div>
    {/if}
    <div class="w-100">
      <CustomButton
        text={"Add & Apply"}
        fontSize={12}
        type={"primary"}
        classProp={`w-100`}
        disable={isAddDisable}
        onClick={() => applyVariable()}
      />
    </div>
  </div>
{/if}

<svelte:window />

<style>
  .select-environment-popup {
    width: 260px;
    height: 180px;
    position: fixed;
    /* transform: translateX(-50%); */
    background-color: var(--background-dropdown);
    z-index: 5;
    flex-wrap: wrap;
    border: 1px solid var(--border-color);
    /* margin-top: 40px; */
  }
  .add-environment-popup {
    width: 260px;
    height: 200px;
    position: fixed;
    /* transform: translateX(-50%); */
    background-color: var(--background-dropdown);
    z-index: 5;
    flex-wrap: wrap;
    border: 1px solid var(--border-color);
  }
  .warning-message {
    /* flex-direction: row; */
    /* background-color: #df77f9; */
    align-items: center;
    /* top: 50px; */
    /* width: 100%; */
  }
  .variable-name {
    width: 100%;
    /* padding: 0px, 8px, 0px, 8px; */
    border: #000000;
    border-radius: 4px;
    margin-bottom: 4px;
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
  }
  .variable-highlight {
    color: var(--white-color);
    font-weight: 500;
  }
  .select-environment-popup .left-panel {
    height: 190px;
    overflow-y: auto;
  }
  .select-environment-popup .right-panel {
    height: 190px;
  }
  .missing-title {
    font-family: Roboto;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
    /* padding: 4px 30px 4px 10px; */
    margin-top: 14px;
    margin-left: 5px;
  }
  .missing-discription {
    color: var(--colors-neutral-bg-4, #999);
    /* P-xs-regular */
    font-family: Roboto;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%; /* 18px */
    align-self: stretch;
  }
  .switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #45494d;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    top: 2px;
    bottom: 4px;
    background-color: #85c2ff;
    -webkit-transition: 0.1s;
    transition: 0.1s;
  }
  /* .slider:after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    top: 2px;
    bottom: 4px;
    background-color: #85c2ff;
    -webkit-transition: 0.1s;
    transition: 0.1s;
  } */

  input:checked + .slider {
    background-color: #1d3650;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(15px);
    -ms-transform: translateX(15px);
    transform: translateX(15px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
  .global-variable {
    width: 100%;
    justify-content: space-between;
  }

  .dropdown-active {
    cursor: pointer;
  }
  .global-environment {
    color: #58c6b9;
  }
  .local-environment {
    color: #df77f9;
  }
  .select-env-info {
    font-size: 12px;
    color: #999999;
    margin-top: 10px;
  }
  .env-title {
    color: #999999;
    font-size: 12px;
  }
  .env-value {
    font-size: 12px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 3; /* Number of lines to show */
    text-overflow: ellipsis;
    white-space: normal; /* Use 'normal' instead of 'nowrap' */
    color: white;
  }
  .default-environment {
    font-size: 10px;
    text-align: center;
    color: #999999;
  }
</style>
