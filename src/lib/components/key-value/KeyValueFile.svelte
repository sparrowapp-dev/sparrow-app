<script lang="ts">
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { onDestroy } from "svelte";
  import type { KeyValuePairWithBase } from "$lib/utils/interfaces/request.interface";
  import close from "$lib/assets/close.svg";
  import { invoke } from "@tauri-apps/api";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import EnvironmentPicker from "../collections/req-res-section/sub-components/environment-picker/EnvironmentPicker.svelte";
  export let keyValue: KeyValuePairWithBase[];
  export let callback;
  export let environmentVariables;

  let pairs: KeyValuePairWithBase[] = keyValue;
  let controller: boolean = false;
  const environmentHelper = new EnvironmentHeper();

  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let tempText = "";
  let focusedInput;
  let environmentAxisY: number;
  let environmentAxisX: number;

  let filterData = [];
  $: {
    if (trackCursor) {
      if (trackParanthesis.length === 2)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          tempText,
          trackParanthesis,
          trackCursor,
        );
    }
    if (trackParanthesis) {
      if (trackParanthesis.length === 2 && trackCursor)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          tempText,
          trackParanthesis,
          trackCursor,
        );
    }
  }

  $: {
    if (keyValue) {
      pairs = keyValue;
      let flag: boolean = false;
      for (let i = 0; i < pairs.length - 1; i++) {
        if (pairs[i].checked === false) {
          flag = true;
        }
      }
      if (flag) {
        controller = false;
      } else {
        controller = true;
      }
    }
  }

  const updateParam = (index) => {
    pairs.forEach((elem, i) => {
      if (i == index) {
        elem.checked = true;
      }
    });
    pairs = pairs;
    if (pairs.length - 1 === index) {
      pairs.push({ key: "", value: "", checked: false, base: "" });
      pairs = pairs;
    }
    callback(pairs);
  };

  const deleteParam = (index) => {
    if (pairs.length > 1) {
      let filteredKeyValue = pairs.filter((elem, i) => {
        if (i != index) {
          return true;
        }
        return false;
      });
      pairs = filteredKeyValue;
    }
    callback(pairs);
  };
  const updateCheck = (index) => {
    let filteredKeyValue = pairs.map((elem, i) => {
      if (i == index) {
        elem.checked = !elem.checked;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };
  let files;

  const extractFileName = (url) => {
    const parts = url.split("\\");
    const fileName = parts[parts.length - 1];
    return fileName;
  };

  const uploadFormFile = async (index) => {
    const filePathResponse = await invoke("fetch_file_command");
    if (filePathResponse !== "Canceled") {
      const filename = extractFileName(filePathResponse);
      const updatedFilePath = "#@#" + filePathResponse;
      let filteredPair = pairs.map((elem, i) => {
        if (i == index) {
          elem.value = filename;
          elem.base = updatedFilePath;
        }
        return elem;
      });
      pairs = filteredPair;
      callback(pairs);
      updateParam(index);
    }
  };

  const removeFormFile = (index) => {
    let filteredPair = pairs.map((elem, i) => {
      if (i == index) {
        elem.value = "";
        elem.base = "";
      }
      return elem;
    });
    pairs = filteredPair;
    callback(pairs);
  };

  const handleCheckAll = (): void => {
    let flag: boolean;
    if (controller === true) {
      flag = false;
    } else {
      flag = true;
    }
    let filteredKeyValue = pairs.map((elem, i) => {
      if (i !== pairs.length - 1) {
        elem.checked = flag;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };

  onDestroy(() => {});
</script>

<div class="mt-3 mb-3 me-0 w-100">
  <div class="d-flex gap-3 pb-2">
    <div style="width:30px;">
      <input
        class="form-check-input"
        type="checkbox"
        bind:checked={controller}
        on:input={handleCheckAll}
      />
    </div>
    <div
      class=" d-flex text-requestBodyColor pair-title align-items-center"
      style="font-size: 12px; font-weight: 500; width:100%;"
    >
      <p class="flex-grow-1 w-100 mb-0 key-container">Key</p>
      <p class="flex-grow-1 w-100 mb-0 value-container">Value</p>
    </div>
    <div class="h-75 pe-1">
      <button class="border-0" style="width:40px;" />
    </div>
  </div>

  <div
    class="w-100"
    style="display:block; position:relative;
        width:200px;
        "
  >
    {#each pairs as element, index}
      <div
        aria-label="Toggle Hover"
        class="sortable > div pair-container"
        style="cursor:default; width:100%;"
        data-list-key={JSON.stringify({
          name: element.key,
          description: element.value,
          checked: element.checked,
        })}
      >
        <div
          style="padding-top: 1px; background-color:backgroundColor;display: flex;flex-direction: column;width:100%;"
        >
          <div
            class="d-flex w-100 align-items-center justify-content-center gap-3 pair-container"
          >
            <img
              src={dragIcon}
              alt=""
              class="d-none"
              style="cursor:grabbing;"
            />
            <div style="width:30px;">
              {#if pairs.length - 1 != index}
                <input
                  class="form-check-input"
                  type="checkbox"
                  bind:checked={element.checked}
                  on:input={() => {
                    updateCheck(index);
                  }}
                />
              {/if}
            </div>

            <div class="w-100 d-flex gap-0">
              <div class="flex-grow-1 w-100 position-relative">
                <input
                  type="text"
                  placeholder="Enter Key"
                  class="form-control keyValuePair py-1"
                  style="font-size: 13px;"
                  id={"pair-file-key" + index}
                  bind:value={element.key}
                  on:input={() => {
                    updateParam(index);
                    tempText = element.key;
                    trackParanthesis =
                      environmentHelper.balanceParanthesis(tempText);
                  }}
                  on:keyup={(e) => {
                    trackCursor = e.target.selectionStart;
                  }}
                  on:blur={() => {
                    setTimeout(() => {
                      tempText = "";
                      trackParanthesis = [];
                      trackCursor = undefined;
                      filterData = [];
                    }, 300);
                  }}
                  on:focus={(e) => {
                    tempText = element.key;
                    focusedInput = index;
                    trackParanthesis =
                      environmentHelper.balanceParanthesis(tempText);
                    const elem = document.getElementById(
                      "pair-file-key" + index,
                    );
                    environmentAxisY = elem.getBoundingClientRect().top + 30;
                    environmentAxisX = elem.getBoundingClientRect().left;
                  }}
                />
                {#if focusedInput === index && trackParanthesis.length === 2 && filterData.length > 0}
                  <EnvironmentPicker
                    {environmentAxisX}
                    {environmentAxisY}
                    {filterData}
                    inputText={element.key}
                    {trackCursor}
                    {trackParanthesis}
                    updateText={(url) => {
                      element.key = url;
                    }}
                    handleInputValue={() => {
                      updateParam(index);
                      trackParanthesis = [];
                      trackCursor = undefined;
                      filterData = [];
                    }}
                  />
                {/if}
              </div>
              <div class="flex-grow-1 w-100">
                <div
                  class="position-relative rounded p-1 d-flex backgroundColor"
                  style="height: 27px;"
                >
                  {#if element.value === ""}
                    <input
                      type="text"
                      class="form-control keyValuePair py-1"
                      readonly
                      style="z-index:4; font-size:13px;
                    position: absolute;
                      top:0;
                      left:0;
                      right:0;
                      bottom:-1;"
                      placeholder="Choose File"
                    />
                    <input
                      class="form-input"
                      type="text"
                      id="formdata-file"
                      on:click={() => {
                        uploadFormFile(index);
                      }}
                      style="opacity: 0;
                      position: absolute;
                      top:0;
                      left:0;
                      right:0;
                      bottom:0;
                      z-index:10;
                      "
                    />
                  {:else}
                    <input
                      type="text"
                      class="form-control keyValuePair py-1"
                      readonly
                      style="z-index:4; font-size:13px;
                    position: absolute;
                      top:0;
                      left:0;
                      right:0;
                      bottom:-1;"
                      placeholder=""
                    />
                    <div
                      class=""
                      style="height:18px;
                      z-index:4; 
                      font-size:13px;
                    position: absolute;
                      top:0;
                      left:10px;"
                    >
                      <span style="font-size:10px; margin:4px;"
                        >{element.value}</span
                      >
                      <img
                        src={close}
                        alt=""
                        style="cursor:pointer;"
                        on:click={() => {
                          removeFormFile(index);
                        }}
                      />
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            {#if pairs.length - 1 != index}
              <div class="h-75 pe-1">
                <button class="bg-backgroundColor border-0" style="width:40px;">
                  <img
                    src={trashIcon}
                    on:click={() => {
                      deleteParam(index);
                    }}
                    alt=""
                  />
                </button>
              </div>
            {:else}
              <div class="h-75 pe-1">
                <button class="bg-backgroundColor border-0" style="width:40px;">
                  <img src="" alt="" />
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  input[type="checkbox"] {
    margin-top: 6px;
    border-radius: 2px;
    height: 12px;
    width: 12px;
  }

  input[type="text"] {
    padding: 4px 12px !important;
  }

  input:checked {
    background-color: var(--send-button) !important;
  }
  .keyValuePair {
    background-color: transparent;
    border-radius: 0;
    border: 1px solid var(--border-color);
  }
  .pair-container:nth-child(odd) {
    margin-top: -1px;
  }
  .pair-title {
    background-color: var(--background-light);
  }
  .key-container {
    padding: 4px 12px;
  }
  .value-container {
    padding: 4px 12px;
    border-left: 2px solid var(--border-color);
  }
  .file-input {
    border: 1px solid var(--border-color);
  }
</style>
