<script lang="ts">
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { findAuthParameter } from "$lib/utils/helpers/auth.helper";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";
  import { onMount } from "svelte";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { RequestProperty } from "$lib/utils/enums/request.enum";
  import EnvironmentPicker from "../environment-picker/EnvironmentPicker.svelte";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";

  export let request;
  export let params: KeyValuePair[] = [];
  export let url: string = "";
  export let collectionsMethods: CollectionsMethods;
  export let currentTabId;
  export let environmentVariables;

  let authValue: { key: string; value: string } = {
    key: "",
    value: "",
  };
  let controller: boolean = false;
  const environmentHelper = new EnvironmentHeper();

  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let tempText = "";
  let focusedInput;
  let focusedElement;
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
    if (params) {
      authValue = findAuthParameter(request);
      let flag: boolean = false;
      for (let i = 0; i < params.length - 1; i++) {
        if (params[i].checked === false) {
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

  onMount(() => {
    authValue = findAuthParameter(request);
  });

  const extractQueryParamstoURL = (params: KeyValuePair[]) => {
    let response = "";
    let urlString: string = "";
    for (let i = 0; i < url.length; i++) {
      if (url[i] === "?") {
        break;
      }
      urlString += url[i];
    }
    let queryString: string = "";
    let count: number = 0;
    for (let param of params) {
      if (param.checked) {
        count++;
        queryString += `${param.key}=${param.value}&`;
      }
    }
    if (count !== 0) {
      queryString = queryString.slice(0, -1);
    }
    response += urlString;
    if (queryString !== "") {
      response += `?${queryString}`;
    }
    return response;
  };

  const updateParam = (index) => {
    params.forEach((elem, i) => {
      if (i == index) {
        elem.checked = true;
      }
    });
    params = params;
    if (params.length - 1 === index) {
      params.push({ key: "", value: "", checked: false });
      params = params;
    }
    collectionsMethods.updateRequestProperty(
      params,
      RequestProperty.QUERY_PARAMS,
      currentTabId,
    );
    collectionsMethods.updateRequestProperty(
      extractQueryParamstoURL(params),
      RequestProperty.URL,
      currentTabId,
    );
  };

  const deleteParam = (index) => {
    if (params.length > 1) {
      let filteredParam = params.filter((elem, i) => {
        if (i != index) {
          return true;
        }
        return false;
      });
      params = filteredParam;
    }
    collectionsMethods.updateRequestProperty(
      params,
      RequestProperty.QUERY_PARAMS,
      currentTabId,
    );
    collectionsMethods.updateRequestProperty(
      extractQueryParamstoURL(params),
      RequestProperty.URL,
      currentTabId,
    );
  };
  const updateCheck = (index) => {
    let filteredParam = params.map((elem, i) => {
      if (i == index) {
        elem.checked = !elem.checked;
      }
      return elem;
    });
    params = filteredParam;
    collectionsMethods.updateRequestProperty(
      params,
      RequestProperty.QUERY_PARAMS,
      currentTabId,
    );
    collectionsMethods.updateRequestProperty(
      extractQueryParamstoURL(params),
      RequestProperty.URL,
      currentTabId,
    );
  };

  const handleCheckAll = (): void => {
    let flag: boolean;
    if (controller === true) {
      flag = false;
    } else {
      flag = true;
    }
    let filteredKeyValue = params.map((elem, i) => {
      if (i !== params.length - 1) {
        elem.checked = flag;
      }
      return elem;
    });
    params = filteredKeyValue;
    collectionsMethods.updateRequestProperty(
      params,
      RequestProperty.QUERY_PARAMS,
      currentTabId,
    );
    collectionsMethods.updateRequestProperty(
      extractQueryParamstoURL(params),
      RequestProperty.URL,
      currentTabId,
    );
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
      class=" d-flex text-requestBodyColor pair-title align-items-center"
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
    {#if authValue.key || authValue.value}
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
            <img
              src={dragIcon}
              alt=""
              class="d-none"
              style="cursor:grabbing;"
            />
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
                  bind:value={authValue.key}
                />
              </div>
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Value"
                  class="form-control keyValuePair py-1"
                  style="font-size: 13px;"
                  disabled
                  bind:value={authValue.value}
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
    {#each params as param, index}
      <div
        aria-label="Toggle Hover pair-container"
        class="sortable > div"
        style="cursor:default; width:100%;"
        data-list-key={JSON.stringify({
          name: param.key,
          description: param.value,
          checked: param.checked,
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
              {#if params.length - 1 != index}
                <input
                  class="form-check-input"
                  type="checkbox"
                  bind:checked={param.checked}
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
                  id={"query-param-key" + index}
                  bind:value={param.key}
                  on:input={() => {
                    updateParam(index);
                    tempText = param.key;
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
                    tempText = param.key;
                    focusedInput = index;
                    focusedElement = "key";
                    trackParanthesis =
                      environmentHelper.balanceParanthesis(tempText);
                    const elem = document.getElementById(
                      "query-param-key" + index,
                    );
                    environmentAxisY = elem.getBoundingClientRect().top + 30;
                    environmentAxisX = elem.getBoundingClientRect().left;
                  }}
                />
                {#if focusedInput === index && focusedElement === "key" && trackParanthesis.length === 2 && filterData.length > 0}
                  <EnvironmentPicker
                    {environmentAxisX}
                    {environmentAxisY}
                    {filterData}
                    inputText={param.key}
                    {trackCursor}
                    {trackParanthesis}
                    updateText={(url) => {
                      param.key = url;
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
                <input
                  type="text"
                  placeholder="Enter Value"
                  class="form-control keyValuePair py-1"
                  style="font-size: 13px;"
                  id={"query-param-value" + index}
                  bind:value={param.value}
                  on:input={() => {
                    updateParam(index);
                    tempText = param.value;
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
                    tempText = param.value;
                    focusedInput = index;
                    focusedElement = "value";
                    trackParanthesis =
                      environmentHelper.balanceParanthesis(tempText);
                    const elem = document.getElementById(
                      "query-param-value" + index,
                    );
                    environmentAxisY = elem.getBoundingClientRect().top + 30;
                    environmentAxisX = elem.getBoundingClientRect().left;
                  }}
                />
                {#if focusedInput === index && focusedElement === "value" && trackParanthesis.length === 2 && filterData.length > 0}
                  <EnvironmentPicker
                    {environmentAxisX}
                    {environmentAxisY}
                    {filterData}
                    inputText={param.value}
                    {trackCursor}
                    {trackParanthesis}
                    updateText={(url) => {
                      param.value = url;
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
            {#if params.length - 1 != index}
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
</style>
