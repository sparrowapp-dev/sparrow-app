<script lang="ts">
  import { trashIcon } from "@sparrow/library/assets";
  import editIcon from "../../features/rest-explorer/assets/icons/edit.svg";
  import moreOptions from "../../features/rest-explorer/assets/icons/moreOptions.svg";
  import type {
    KeyValuePair,
    KeyValuePairWithBase,
  } from "@sparrow/common/interfaces/request.interface";
  import type { KeyValueChecked } from "@sparrow/common/types/workspace";
  import { partition } from "rxjs";

  /**
   * tabular pair entries
   */
  export let keyValue: KeyValuePair[] | KeyValuePairWithBase[];
  /**
   * callback to update entries
   */
  export let callback: (pairs: KeyValuePair[]) => void;
  /**
   * search text to filter the pairs
   */
  export let search: string;

  /**
   * disabled flag to disable the input, delete, and checkbox
   */
  export let disabled = false;
  let pairs: KeyValueChecked[] = keyValue;
  let controller: boolean = false;

  $: {
    if (keyValue) {
      identifySelectAllState();
    }
  }

  /**
   * @description - calculates the select all checkbox state - weather checked or not
   */
  const identifySelectAllState = () => {
    pairs = [];
    pairs = keyValue;
    controller = false;
    if (pairs.length > 1) {
      let isUncheckedExist: boolean = false;
      for (let i = 0; i < pairs.length - 1; i++) {
        if (pairs[i].checked === false) {
          isUncheckedExist = true;
          break;
        }
      }
      if (isUncheckedExist) {
        controller = false;
      } else {
        controller = true;
      }
    }
  };

  /**
   * @description - updates pair values
   * @param index - index of the pairs that needs to be updated
   */
  const updatePairs = (index: number): void => {
    pairs = pairs;
    if (
      pairs.length - 1 === index &&
      (pairs[index].key !== "" || pairs[index].value !== "")
    ) {
      pairs[pairs.length - 1].checked = true;
      pairs.push({
        key: "",
        value: "",
        checked: false,
      });
      pairs = pairs;
    }
    callback(pairs);
  };

  /**
   * @description - delete pairs
   * @param index - index of the pairs that needs to be deleted
   */
  const deletePairs = (index: number): void => {
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

  /**
   * @description - updates check mark
   * @param index - index of the pairs that needs to be checked or unchecked
   */
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

  /**
   * @description - updates all the checkbox to checked or unchecked
   */
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
</script>

<div
  class="mb-0 me-0 w-100 bg-secondary-700 ps-3 py-0 border-radius-2 section-layout"
>
  <div class="d-flex gap-3 align-items-center w-100 pe-2" style="height: 26px;">
    <div style="width:30px; margin-left: 0px;">
      <label
        class="container d-block position-relative"
        style={search !== "" ? "opacity:0!important ;" : null}
      >
        <input
          type="checkbox"
          disabled={pairs.length === 1 || disabled}
          bind:checked={controller}
          on:input={handleCheckAll}
        />
        <span class="checkmark"></span>
      </label>
    </div>
    <div
      class="d-flex pair-title bg-secondary-700 align-items-center w-100"
      style="font-size: 12px; font-weight: 500;"
    >
      <p class="mb-0 w-50 text-secondary-200 text-fs-12 p-1">Variable</p>
      <p class="mb-0 w-50 text-secondary-200 text-fs-12 p-1 ps-4">Value</p>
    </div>
    <div class="pe-1 d-flex">
      <button class="bg-transparent border-0 d-flex d-none" style="">
        <p
          class="text-nowrap text-primary-300 mb-0 me-2"
          style="font-size: 10px;"
        >
          Bulk Edit
        </p>
        <img
          class="my-auto d-none"
          src={editIcon}
          alt="Edit Icon"
          style="height: 10px; width: 10px;"
        />
      </button>
      <button class="bg-transparent border-0 d-flex d-none" style="">
        <img
          class="my-auto"
          src={moreOptions}
          alt="Edit Icon"
          style="height: 10px; width: 10px;"
        />
      </button>
      <div class="h-75 pe-1">
        <button class="border-0" style="width:40px;" />
      </div>
    </div>
  </div>

  <div class="w-100 d-block position-relative">
    {#if pairs}
      {#each pairs as element, index}
        <div
          aria-label="Toggle Hover"
          class="w-100 {element.key
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          element.value.toLowerCase().includes(search.toLowerCase())
            ? ''
            : 'd-none'}"
        >
          <div
            class="d-flex flex-column w-100"
            style="padding-top: 1px; height:24px;"
          >
            <div
              class="d-flex w-100 align-items-center justify-content-center gap-3 pair-container"
            >
              <div style="width:30px;">
                {#if pairs.length - 1 != index}
                  <label class="container d-block position-relative">
                    <input
                      type="checkbox"
                      bind:checked={element.checked}
                      on:input={() => {
                        updateCheck(index);
                      }}
                      {disabled}
                    />
                    <span class="checkmark"></span>
                  </label>
                {/if}
              </div>

              <div class=" d-flex gap-0 w-100">
                <div class="w-50 position-relative">
                  <input
                    type="text"
                    bind:value={element.key}
                    on:input={() => {
                      updatePairs(index);
                    }}
                    placeholder="Add Variable"
                    class="table-input-v2 w-100 text-fs-12 placeholder-color"
                    {disabled}
                  />
                </div>

                <div class="w-50 position-relative">
                  <input
                    type="text"
                    bind:value={element.value}
                    on:input={() => {
                      updatePairs(index);
                    }}
                    placeholder={"Add Value"}
                    class="w-100 text-fs-12 placeholder-color"
                    {disabled}
                  />
                </div>
              </div>
              {#if pairs.length - 1 != index && !disabled}
                <div class="h-75 pe-1">
                  <button
                    class="bg-secondary-700 border-0"
                    style="width:20px;"
                    on:click={() => {
                      deletePairs(index);
                    }}
                  >
                    <img src={trashIcon} alt="" />
                  </button>
                </div>
              {:else}
                <div class="h-75 pe-1">
                  <button
                    class="bg-backgroundColor border-0"
                    style="width:20px;"
                  />
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
{#if pairs?.filter((element) => {
  if (element.key.toLowerCase().includes(search.toLowerCase()) || element.value
      .toLowerCase()
      .includes(search.toLowerCase())) {
    return true;
  }
  return false;
}).length === 0 && search !== ""}
  <p class="text-fs-12 mt-3 ps-2">
    No such variable found in this environment. Please check the spelling.
  </p>
{/if}

<style>
  .pair-container:nth-child(odd) {
    margin-top: -1px;
  }
  .section-layout {
    border-top: 1px solid var(--border-secondary-500);
    border-bottom: 1px solid var(--border-secondary-500);
  }

  /* The container */
  .container {
    padding-left: 35px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Hide the browser's default checkbox */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    background-color: transparent;
    border: 2px solid var(--text-secondary-500);
  }

  /* Create a custom checkbox */
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 14px;
    width: 14px;
    border-radius: 3px;
    background-color: transparent;
    border: 2px solid var(--text-secondary-500);
  }

  /* On mouse-over, add a grey background color */
  /* .container:hover input ~ .checkmark {
    background-color: #ccc;
  } */

  /* When the checkbox is checked, add a blue background */
  .container input:checked ~ .checkmark {
    border: none;
    background-color: var(--text-primary-200);
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .container input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .container .checkmark:after {
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid var(--text-secondary-850);
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  input[type="text"] {
    background-color: transparent;
    border: 0;
    outline: none;
    height: 18px;
    padding-left: 8px;
    padding-right: 8px;
  }
  input[type="text"]:focus {
    background-color: var(--bg-secondary-500);
    outline: 1px solid var(--border-primary-300);
  }

  .placeholder-color::placeholder {
    color: var(--text-secondary-300);
  }
</style>
