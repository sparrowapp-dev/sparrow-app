<script lang="ts">
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";
  import EnvironmentPicker from "../collections/req-res-section/sub-components/environment-picker/EnvironmentPicker.svelte";

  type Mode = "READ" | "WRITE";

  export let keyValue: KeyValuePair[];
  export let callback: (pairs: KeyValuePair[]) => void;
  export let mode: Mode = "WRITE";
  export let readable: { key: string; value: string } = {
    key: "",
    value: "",
  };
  export let environmentVariables;
  const environmentHelper = new EnvironmentHeper();
  let pairs: KeyValuePair[] = keyValue;
  let controller: boolean = false;

  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let tempText = "";
  let focusedInput;
  let focusedElement;
  let environmentAxisY: number;
  let environmentAxisX: number;

  $: {
    if (keyValue) {
      pairs = keyValue;
      let flag: boolean = false;
      for (let i = 0; i < pairs.length - 1; i++) {
        if (pairs[i].checked === false) {
          flag = true;
        }
      }
      if (mode === "READ" && pairs[pairs.length - 1].checked === false) {
        flag = true;
      }
      if (flag) {
        controller = false;
      } else {
        controller = true;
      }
    }
  }

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

  const updateParam = (index: number): void => {
    pairs.forEach((elem, i) => {
      if (i === index) {
        elem.checked = true;
      }
    });
    pairs = pairs;
    if (pairs.length - 1 === index) {
      pairs.push({ key: "", value: "", checked: false });
      pairs = pairs;
    }
    callback(pairs);
  };

  const deleteParam = (index: number): void => {
    if (pairs.length > 1) {
      let filteredKeyValue = pairs.filter((elem, i) => {
        if (i !== index) {
          return true;
        }
        return false;
      });
      pairs = filteredKeyValue;
    }
    callback(pairs);
  };

  const updateCheck = (index: number): void => {
    let filteredKeyValue = pairs.map((elem, i) => {
      if (i === index) {
        elem.checked = !elem.checked;
      }
      return elem;
    });
    pairs = filteredKeyValue;
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
      } else if (mode === "READ") {
        elem.checked = flag;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };

  let handleInputValue = () => {
    trackParanthesis = environmentHelper.balanceParanthesis(tempText);
  };
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
      class="d-flex text-requestBodyColor pair-title align-items-center"
      style="font-size: 12px; font-weight: 500; width:100%;"
    >
      <p class="flex-grow-1 mb-0 w-100 key-container">Key</p>
      <p class="flex-grow-1 mb-0 w-100 value-container">Value</p>
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
    {#if readable.key || readable.value}
      <div
        aria-label="Toggle Hover"
        class="sortable > div"
        style="cursor:default; width:100%;"
      >
        <div
          style="padding-top: 1px; background-color:backgroundColor;display: flex;flex-direction: column;width:100%;"
        >
          <div
            class="d-flex w-100 align-items-center justify-content-center gap-3 mb-2"
          >
            <div style="width:30px;">
              <input
                class="form-check-input"
                type="checkbox"
                disabled
                checked={true}
              />
            </div>

            <div class="w-100 d-flex gap-0">
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Key"
                  class="form-control keyValuePair py-1"
                  style="font-size: 13px;"
                  disabled
                  bind:value={readable.key}
                />
              </div>
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Value"
                  class="form-control keyValuePair py-1"
                  style="font-size: 13px;"
                  disabled
                  bind:value={readable.value}
                />
              </div>
            </div>
            <div class="h-75 pe-1">
              <button class="bg-backgroundColor border-0" style="width:40px;" />
            </div>
          </div>
        </div>
      </div>
    {/if}
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
              {#if pairs.length - 1 != index || mode === "READ"}
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
                  id={"pair-key" + index}
                  disabled={mode == "READ" ? true : false}
                  bind:value={element.key}
                  on:input={() => {
                    updateParam(index);
                    tempText = element.key;
                    handleInputValue();
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
                    focusedElement = "key";
                    handleInputValue();
                    const elem = document.getElementById("pair-key" + index);
                    environmentAxisY = elem.getBoundingClientRect().top + 30;
                    environmentAxisX = elem.getBoundingClientRect().left;
                  }}
                />
                {#if focusedInput === index && focusedElement === "key" && trackParanthesis.length === 2 && filterData.length > 0}
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
              <div class="flex-grow-1 w-100 position-relative">
                <input
                  type="text"
                  placeholder="Enter Value"
                  class="form-control keyValuePair py-1"
                  style="font-size: 13px;"
                  id={"pair-value" + index}
                  disabled={mode == "READ" ? true : false}
                  bind:value={element.value}
                  on:input={() => {
                    updateParam(index);
                    tempText = element.value;
                    handleInputValue();
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
                    tempText = element.value;
                    focusedInput = index;
                    focusedElement = "value";
                    handleInputValue();
                    const elem = document.getElementById("pair-value" + index);
                    environmentAxisY = elem.getBoundingClientRect().top + 30;
                    environmentAxisX = elem.getBoundingClientRect().left;
                  }}
                />
                {#if focusedInput === index && focusedElement === "value" && trackParanthesis.length === 2 && filterData.length > 0}
                  <EnvironmentPicker
                    {environmentAxisX}
                    {environmentAxisY}
                    {filterData}
                    inputText={element.value}
                    {trackCursor}
                    {trackParanthesis}
                    updateText={(url) => {
                      element.value = url;
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
            </div>
            {#if pairs.length - 1 != index}
              <div class="h-75 pe-1">
                <button class="bg-backgroundColor border-0" style="width:40px;">
                  {#if mode !== "READ"}
                    <img
                      src={trashIcon}
                      on:click={() => {
                        deleteParam(index);
                      }}
                      alt=""
                    />
                  {/if}
                </button>
              </div>
            {:else}
              <div class="h-75 pe-1">
                <button
                  class="bg-backgroundColor border-0"
                  style="width:40px;"
                />
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
</style>
