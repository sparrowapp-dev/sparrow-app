<script lang="ts">
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import {
    updateQueryParams,
    updateURL,
  } from "$lib/store/request-response-section";
  import type { QueryParams } from "$lib/utils/dto";
  import { findAuthParameter } from "$lib/utils/helpers/auth.helper";
  import type {
    KeyValuePair,
    NewTab,
  } from "$lib/utils/interfaces/request.interface";
  import { onMount } from "svelte";

  export let requestData: NewTab;
  export let currentTabId: string | null = null;
  export let params: KeyValuePair[] = [];
  export let url: string = "";

  let authValue: { key: string; value: string } = {
    key: "",
    value: "",
  };
  let controller: boolean = false;

  $: {
    if (params) {
      authValue = findAuthParameter(requestData);
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

  $: {
    if (currentTabId) {
      authValue = findAuthParameter(requestData);
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
    authValue = findAuthParameter(requestData);
  });

  let ListView;
  function onSortableUpdate() {
    let newListElements = [];
    let ItemViewList = ListView.children;
    for (let i = 0, l = ItemViewList.length; i < l; i++) {
      let ListKey = ItemViewList[i].dataset.listKey;
      if (ListKey != null) {
        newListElements.push(JSON.parse(ListKey));
      }
    }

    params = newListElements;
    updateURL(extractQueryParamstoURL(params), currentTabId);
    updateQueryParams(params, currentTabId);
  }

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
    updateQueryParams(params, currentTabId);
    updateURL(extractQueryParamstoURL(params), currentTabId);
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
    updateQueryParams(params, currentTabId);
    updateURL(extractQueryParamstoURL(params), currentTabId);
  };
  const updateCheck = (index) => {
    let filteredParam = params.map((elem, i) => {
      if (i == index) {
        elem.checked = !elem.checked;
      }
      return elem;
    });
    params = filteredParam;
    updateQueryParams(params, currentTabId);
    updateURL(extractQueryParamstoURL(params), currentTabId);
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
    updateQueryParams(params, currentTabId);
    updateURL(extractQueryParamstoURL(params), currentTabId);
  };
</script>

<div class="mt-3 me-0 w-100">
  <div class="d-flex gap-2">
    <div style="width:40px;">
      <input
        class="form-check-input"
        type="checkbox"
        bind:checked={controller}
        on:input={handleCheckAll}
      />
    </div>
    <div
      class=" d-flex gap-2 text-requestBodyColor align-items-center"
      style="font-size: 12px; font-weight: 500; width:100%;"
    >
      <p class="flex-grow-1 w-100">Key</p>
      <p class="flex-grow-1 w-100">Value</p>
    </div>
    <div style="width:60px;" />
  </div>

  <div
    class="w-100"
    style="display:block; position:relative;
    width:200px;
    "
    bind:this={ListView}
  >
    {#if authValue.key && authValue.value}
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

            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Key"
                  class="form-control bg-blackColor py-1 border-0"
                  style="font-size: 13px;"
                  disabled
                  bind:value={authValue.key}
                />
              </div>
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Value"
                  class="form-control bg-blackColor py-1 border-0"
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
        aria-label="Toggle Hover"
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
            class="d-flex w-100 align-items-center justify-content-center gap-3 mb-2"
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

            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Key"
                  class="form-control bg-blackColor py-1 border-0"
                  style="font-size: 13px;"
                  bind:value={param.key}
                  on:input={() => {
                    updateParam(index);
                  }}
                />
              </div>
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Value"
                  class="form-control bg-blackColor py-1 border-0"
                  style="font-size: 13px;"
                  bind:value={param.value}
                  on:input={() => {
                    updateParam(index);
                  }}
                />
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
  .sortable > div {
    -webkit-touch-callout: none;
    -ms-touch-action: none;
    touch-action: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  div:global(.ui-sortable-placeholder) {
    height: 30px;
  }
</style>
