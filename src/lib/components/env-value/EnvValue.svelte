<script lang="ts">
  import { SearchIcon, EditIcon } from "$lib/assets/app.asset";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import type { EnvValuePair } from "$lib/utils/interfaces/request.interface";
  import Tooltip from "../tooltip/Tooltip.svelte";
  type Mode = "READ" | "WRITE";

  export let keyValue: EnvValuePair[];
  export let callback: (pairs: EnvValuePair[]) => void;
  export let mode: Mode = "WRITE";
  export let readable: { key: string; value: string } = {
    key: "",
    value: "",
  };
  let pairs: EnvValuePair[] = keyValue;
  let controller: boolean = false;
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
        if (i != index) {
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
</script>

<div class="mt-3 me-0" style="width: 60vw;">
  <div class={`d-flex search-input-container rounded py-1 px-2 mb-4`}>
    <SearchIcon width={12} height={12} classProp={`my-auto me-3`} />
    <input
      type="text"
      class={`bg-transparent w-100 border-0 my-auto`}
      placeholder="Search environment variables"
    />
  </div>
  <div class="d-flex gap-3">
    <div class="form-check-input-container" style="width:30px;">
      <Tooltip text={`${controller ? "Unselect" : "Select"}`}>
        <input
          class="form-check-input"
          type="checkbox"
          on:input={handleCheckAll}
          bind:checked={controller}
        />
      </Tooltip>
    </div>
    <div
      class="d-flex gap-5 text-requestBodyColor align-items-center"
      style="font-size: 12px; font-weight: 500; width: 46vw;"
    >
      <p class="flex-grow-1 w-100">Variable</p>
      <p class="flex-grow-1 w-100">Value</p>
    </div>
    <!-- <div style="width:60px;" /> -->
  </div>

  <div
    class="w-100 env-var-container"
    style="display:block;
        "
  >
    {#if readable.key || readable.value}
      <div
        aria-label="Toggle Hover"
        class="sortable > div"
        style="cursor:default; width:60vw;"
      >
        <div
          style="padding-top: 1px; background-color:backgroundColor;display: flex;flex-direction: column;width:100%;"
        >
          <div
            class="d-flex w-100 align-items-center justify-content-center gap-3 mb-2"
          >
            <!-- <img
              src={dragIcon}
              alt=""
              class="d-none"
              style="cursor:grabbing;"
            /> -->
            <div class="form-check-input-container" style="width:30px;">
              <input class="form-check-input" type="checkbox" disabled />
            </div>

            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <div class="bg-keyValuePairColor d-flex rounded">
                  <input
                    type="text"
                    placeholder="Enter Variable"
                    class="form-control bg-keyValuePairColor py-1 border-0"
                    style="font-size: 13px;"
                    disabled
                    bind:value={readable.key}
                  />
                  <div class="me-2">
                    <EditIcon />
                  </div>
                </div>
              </div>
              <div class="flex-grow-1 w-100">
                <div class="bg-keyValuePairColor d-flex rounded">
                  <input
                    type="text"
                    placeholder="Enter Value"
                    class="form-control bg-keyValuePairColor py-1 border-0"
                    style="font-size: 13px;"
                    disabled
                    bind:value={readable.value}
                  />
                  <div class="me-2">
                    <EditIcon />
                  </div>
                </div>
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
        class="sortable > div"
        style="cursor:default; width:55vw; "
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
            <div class="form-check-input-container" style="width:30px;">
              {#if pairs.length - 1 != index || mode === "READ"}
                <Tooltip text={`${element.checked ? "Unselect" : "Select"}`}>
                  <input
                    class="form-check-input"
                    type="checkbox"
                    bind:checked={element.checked}
                    on:input={() => {
                      updateCheck(index);
                    }}
                  />
                </Tooltip>
              {/if}
            </div>
            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <div class="bg-keyValuePairColor d-flex rounded">
                  <input
                    type="text"
                    placeholder="Enter Variable"
                    class="form-control bg-keyValuePairColor py-1 border-0"
                    style="font-size: 13px;"
                    disabled={mode == "READ" ? true : false}
                    bind:value={element.key}
                    on:input={() => {
                      updateParam(index);
                    }}
                  />
                  <div class="me-2 edit-icon">
                    <EditIcon />
                  </div>
                </div>
              </div>
              <div class="flex-grow-1 w-100">
                <div class="bg-keyValuePairColor d-flex rounded">
                  <input
                    type="text"
                    placeholder="Enter Value"
                    class="form-control bg-keyValuePairColor py-1 border-0"
                    style="font-size: 13px;"
                    disabled={mode == "READ" ? true : false}
                    bind:value={element.value}
                    on:input={() => {
                      updateParam(index);
                    }}
                  />
                  <div class="me-2">
                    <EditIcon />
                  </div>
                </div>
              </div>
            </div>
            {#if pairs.length - 1 != index}
              <div class="h-75 pe-1 d-flex">
                <!-- <button
                class="bg-backgroundColor border-0"
                  style="width: 40px;"
                  on:click={() => {
                    lockParam(index);
                  }}
                >
                  <LockIcon locked={element.locked} />
                </button> -->
                <Tooltip text="Delete">
                  <button
                    class="border-0 delete-btn rounded"
                    style="width:30px;"
                  >
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
                </Tooltip>
              </div>
            {:else}
              <div class="h-75 pe-1 d-flex">
                <!-- <button
                  class="bg-backgroundColor border-0"
                  style="width:40px;"
                /> -->
                <button
                  class="bg-backgroundColor border-0"
                  style="width:30px;"
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
  .search-input-container {
    border: 1px solid var(--border-color);
    background: var(--background-color);
    width: 27vw;
  }

  .form-check-input {
    border-radius: 2px;
    margin: auto;
  }

  .form-check-input:checked {
    background-color: #0982d7;
  }

  .env-var-container {
    overflow-y: auto;
    height: 68vh;
  }
  .env-var-container::-webkit-scrollbar {
    width: 4px;
  }
  .env-var-container::-webkit-scrollbar-thumb {
    background: #888;
  }
  .delete-btn {
    background: transparent;
  }
  .delete-btn:hover {
    background: var(--border-color);
  }
  .delete-btn:active {
    background: var(--workspace-hover-color);
  }
</style>
