<script lang="ts">
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { onDestroy } from "svelte";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";
  export let keyValue: KeyValuePair[];
  export let callback;

  let pairs: KeyValuePair[] = keyValue;

  $: {
    if (keyValue) {
      pairs = keyValue;
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
      pairs.push({ key: "", value: "", checked: false });
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

  onDestroy(() => {});
</script>

<div class="mt-3 me-0 w-100">
  <div class="d-flex gap-2">
    <div style="width:40px;" />
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
  >
    {#each pairs as element, index}
      <div
        aria-label="Toggle Hover"
        class="sortable > div"
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
                bind:checked={element.checked}
                on:input={() => {
                  updateCheck(index);
                }}
              />
            </div>

            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <input
                  type="text"
                  placeholder="Enter Key"
                  class="form-control bg-blackColor py-1 border-0"
                  style="font-size: 13px;"
                  bind:value={element.key}
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
                  bind:value={element.value}
                  on:input={() => {
                    updateParam(index);
                  }}
                />
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
