<script lang="ts">
  import { SearchIcon, EditIcon } from "$lib/assets/app.asset";
  import Crossicon from "$lib/assets/crossicon.svelte";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import type { EnvValuePair } from "$lib/utils/interfaces/request.interface";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import Tooltip from "../tooltip/Tooltip.svelte";
  type Mode = "READ" | "WRITE";

  export let keyValue: EnvValuePair[];
  export let callback: (pairs: EnvValuePair[]) => void;
  export let mode: Mode = "WRITE";
  export let readable: { key: string; value: string } = {
    key: "",
    value: "",
  };
  let filterText: string = "";
  let pairs: EnvValuePair[] = keyValue;
  let filteredKeyValuePairs: EnvValuePair[] = pairs;
  const updateFilteredKeyValuePairs = (pairs: EnvValuePair[]) => {
    return (filteredKeyValuePairs = pairs.filter((elem, index) => {
      if (
        elem.key.includes(filterText) ||
        elem.value.includes(filterText) ||
        filterText == ""
      )
        return true;
    }));
  };
  let controller: boolean = false;
  $: {
    if (keyValue) {
      pairs = keyValue;
      updateFilteredKeyValuePairs(pairs);
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
    updateFilteredKeyValuePairs(pairs);
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
    updateFilteredKeyValuePairs(pairs);
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
    updateFilteredKeyValuePairs(pairs);
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
    updateFilteredKeyValuePairs(pairs);
  };
  const handleFilterTextChange = (e) => {
    filterText = e.target.value;
    updateFilteredKeyValuePairs(pairs);
  };
  const handleEraseSearch = () => {
    filterText = "";
    updateFilteredKeyValuePairs(pairs);
    document.getElementById("search-input").focus();
  };
</script>

<div class="mt-3 me-0">
  <div class={`d-flex search-input-container rounded py-2 px-2 mb-4`}>
    <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
    <input
      type="text"
      id="search-input"
      class={`bg-transparent w-100 border-0 my-auto`}
      placeholder="Search environment variables"
      bind:value={filterText}
      on:input={(e) => handleFilterTextChange(e)}
      on:click={() => MixpanelEvent(Events.SEARCH_ENVIRONMENT_VARIABLES)}
    />
    {#if filterText !== ""}
      <button class="border-0 bg-transparent ms-2" on:click={handleEraseSearch}>
        <Crossicon color="#45494D" />
      </button>
    {/if}
  </div>
  <div class="d-flex gap-4">
    <div
      class="form-check-input-container"
      style="width:27.5px; margin-top: -3px;"
    >
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
      class="d-flex pe-5 text-requestBodyColor align-items-center w-100"
      style="font-size: 12px; font-weight: 500; "
    >
      <p class="flex-grow-1 w-100 ps-2">Variable</p>
      <p class="flex-grow-1 w-100 ps-2">Value</p>
    </div>
  </div>

  <div
    class="w-100 env-var-container sparrow-thin-scrollbar"
    style="display:block;
        "
  >
    {#if readable.key || readable.value}
      <div
        aria-label="Toggle Hover"
        class="sortable > div"
        style="cursor:default;"
      >
        <div
          style="padding-top: 1px; background-color:backgroundColor;display: flex;flex-direction: column;width:100%;"
        >
          <div
            class="d-flex w-100 align-items-center justify-content-center gap-3 mb-2"
          >
            <div class="form-check-input-container" style="width:30px;">
              <input class="form-check-input" type="checkbox" disabled />
            </div>

            <div class="w-100 d-flex gap-2">
              <div class="flex-grow-1 w-100">
                <div class="bg-keyValuePairColor d-flex rounded">
                  <input
                    type="text"
                    placeholder="Enter Variable"
                    class="form-control py-1"
                    style="font-size: 13px;"
                    disabled
                    bind:value={readable.key}
                  />
                  <div class="me-2 my-auto edit-icon">
                    <EditIcon />
                  </div>
                </div>
              </div>
              <div class="flex-grow-1 w-100">
                <div class="bg-keyValuePairColor d-flex rounded">
                  <input
                    type="text"
                    placeholder="Enter Value"
                    class="form-control py-1"
                    style="font-size: 13px;"
                    disabled
                    bind:value={readable.value}
                  />
                  <div class="me-2 my-auto edit-icon">
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
    {#if filteredKeyValuePairs.length > 0}
      {#each filteredKeyValuePairs as element, index}
        <div
          aria-label="Toggle Hover"
          class="sortable > div"
          style="cursor:default; "
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
              <div class="form-check-input-container" style="width:30px; ">
                {#if filteredKeyValuePairs.length - 1 != index || mode === "READ"}
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
              <div class="w-100 d-flex gap-2">
                <div class="flex-grow-1 w-100">
                  <div
                    class="bg-keyValuePairColor input-container d-flex rounded"
                  >
                    <input
                      type="text"
                      placeholder="Enter Variable"
                      class="form-control py-1"
                      style="font-size: 13px;"
                      disabled={mode == "READ" ? true : false}
                      bind:value={element.key}
                      on:input={(e) => {
                        updateParam(index);
                      }}
                    />
                    <div class="me-2 my-auto edit-icon">
                      <EditIcon />
                    </div>
                  </div>
                </div>

                <div class="flex-grow-1 w-100">
                  <div class="bg-keyValuePairColor d-flex rounded">
                    <input
                      type="text"
                      placeholder="Enter Value"
                      class="form-control py-1"
                      style="font-size: 13px;"
                      disabled={mode == "READ" ? true : false}
                      bind:value={element.value}
                      on:input={() => {
                        updateParam(index);
                      }}
                    />
                    <div class="me-2 my-auto edit-icon">
                      <EditIcon />
                    </div>
                  </div>
                </div>
              </div>
              {#if filteredKeyValuePairs.length - 1 != index}
                <div class="h-75 pe-1 d-flex">
                  <button
                    class="border-0 delete-btn pb-1 rounded"
                    style="width:30px;"
                  >
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
                <div class="h-75 pe-1 d-flex">
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
    {:else}
      <span class="p-2" style="color: #8A9299; font-size: 12px;"
        >No such variable found in this environment. Please check the spelling.</span
      >
    {/if}
  </div>
</div>

<style>
  .search-input-container {
    border: 1px solid var(--border-color);
    background: var(--background-color);
    max-width: 400px;
    font-size: 12px;
  }
  .search-input-container > input:focus {
    outline: none;
    caret-color: var(--workspace-hover-color);
  }
  .search-input-container:focus-within {
    border: 1px solid var(--workspace-hover-color);
  }
  .search-input-container:focus-within svg {
    visibility: hidden;
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

  .delete-btn {
    background: transparent;
  }
  .delete-btn:hover {
    background: var(--border-color);
  }
  .delete-btn:active {
    background: var(--workspace-hover-color);
  }

  .edit-icon {
    opacity: 0;
  }
  .bg-keyValuePairColor:hover .edit-icon {
    opacity: 1;
  }

  .bg-keyValuePairColor > input:focus {
    box-shadow: none;
  }

  .bg-keyValuePairColor,
  .bg-keyValuePairColor > input {
    caret-color: #85c2ff;
    background-color: var(--keyvalue-pair);
    border: 1px solid transparent;
  }

  .bg-keyValuePairColor:focus-within {
    border: 1px solid var(--workspace-hover-color);
  }
  .form-check-input-container:hover {
    background-color: var(--keyvalue-pair);
  }
  .form-check-input-container {
    height: 25px;
    background-color: transparent;
    padding: 5px 0px;
  }
  .form-check-input {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
