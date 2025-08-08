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
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { Checkbox } from "@sparrow/library/forms";
  import { DeleteRegular, ReOrderDotsRegular } from "@sparrow/library/icons";
  import { CodeMirrorInput } from "..";
  import { TabularInputTheme } from "../../utils";
  import { DismissRegular } from "@sparrow/library/icons";
  import { CheckMarkIcon } from "@sparrow/library/icons";

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
  export let isGeneratedVariable = false;
  let pairs: KeyValueChecked[] = keyValue;
  let controller: boolean = false;
  const theme = new TabularInputTheme().build();

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

<div class="mb-0 me-0 w-100 py-0 section-layout">
  <div
    class="d-flex align-items-center w-100 px-1 header-box"
    style="height: 28px; background-color:var(--bg-ds-surface-400); gap:11px;"
  >
    <div style="width:24px; margin-left: 4px;">
      {#if !isGeneratedVariable}
        <Checkbox
          disabled={pairs.length === 1 || disabled}
          checked={controller}
          on:input={handleCheckAll}
        />
      {/if}
    </div>
    <div
      class="d-flex pair-title align-items-center w-100"
      style="font-size: 12px; font-weight: 500;"
    >
      <p class="mb-0 w-50 header-text p-1">Key</p>
      <p
        class="mb-0 w-50 header-text"
        style="padding-left: {isGeneratedVariable
          ? '5px'
          : '17px'}; padding-right:4px"
      >
        Value
      </p>
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
      <div class="h-75 pe-1 invisible">
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
            : 'd-none'} value-pair-rows px-1"
        >
          <div
            class="d-flex flex-column w-100 align-items-center justify-content-center"
            style="height:28px;"
          >
            <div
              class="d-flex w-100 px-1 align-items-center justify-content-center gap-2 pair-container position-relative"
              style="height: 28px;"
            >
              <div class="d-flex justify-content-center align-items-center">
                <!-- <div class="button-container">
                  <Button
                    size="extra-small"
                    type="teritiary-regular"
                    startIcon={ReOrderDotsRegular}
                  />
                </div> -->
                <div style="width:24px;">
                  {#if pairs.length - 1 != index && !isGeneratedVariable}
                    <Checkbox
                      checked={element.checked}
                      on:input={() => {
                        updateCheck(index);
                      }}
                      {disabled}
                    />
                  {/if}
                </div>
              </div>

              <div class="w-50">
                <div
                  class="position-absolute top-0"
                  style="width: calc(50% - {isGeneratedVariable
                    ? '45px'
                    : '33px'} );"
                >
                  <CodeMirrorInput
                    bind:value={element.key}
                    onUpdateInput={() => {
                      updatePairs(index);
                    }}
                    {disabled}
                    placeholder={"Add Variable"}
                    {theme}
                    enableEnvironmentHighlighting={false}
                  />
                </div>
              </div>

              <div class="w-50">
                <div
                  class="position-absolute top-0"
                  style="width: calc(50% - {isGeneratedVariable
                    ? '45px'
                    : '33px'});"
                >
                  <CodeMirrorInput
                    bind:value={element.value}
                    onUpdateInput={() => {
                      updatePairs(index);
                    }}
                    {disabled}
                    placeholder={"Add Value"}
                    {theme}
                    enableEnvironmentHighlighting={false}
                  />
                </div>
              </div>

              {#if pairs.length - 1 != index && !disabled && !isGeneratedVariable}
                <Tooltip
                  title={"Delete"}
                  placement={"bottom-right"}
                  distance={10}
                >
                  <div class="button-container">
                    <Button
                      buttonClassProp=""
                      size="extra-small"
                      type="teritiary-regular"
                      startIcon={DeleteRegular}
                      onClick={() => {
                        deletePairs(index);
                      }}
                    />
                  </div>
                </Tooltip>
              {:else if isGeneratedVariable}
                <div class="d-flex gap-1">
                  <button
                    class="generate-action-button reject"
                    on:click|stopPropagation={() => {
                      console.log("accept it------>");
                    }}
                  >
                    <CheckMarkIcon
                      size="12"
                      color={"var(--icon-ds-success-300)"}
                    />
                  </button>
                  <button
                    class="generate-action-button reject"
                    on:click|stopPropagation={() => {
                      deletePairs(index);
                    }}
                  >
                    <DismissRegular
                      size="12"
                      color={"var(--icon-ds-danger-300)"}
                    />
                  </button>
                </div>
              {:else}
                <div class="h-75 pe-1">
                  <button
                    class="bg-backgroundColor border-0"
                    style="width:20px;"
                  ></button>
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
  <p class="text-fs-12 mt-3 ps-2 no-data-found">
    The variable <span style="color:var(--text-ds-neutral-100)">'{search}'</span
    > is not found in this environment. Add the variable or try searching in a different
    environment.
  </p>
{/if}

<style>
  .header-box {
    height: 28px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  .value-pair-rows {
    background-color: var(--bg-ds-surface-600);
    border-top: 1px solid var(--bg-ds-surface-400);
  }
  .value-pair-rows:hover .button-container {
    opacity: 1;
    visibility: visible;
  }
  .value-pair-rows:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .value-pair-rows:hover {
    background-color: var(--bg-ds-surface-500);
  }
  .header-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
  }
  .button-container {
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.1s ease-in-out,
      visibility 0.1s;
  }
  .no-data-found {
    text-align: center;
    color: var(--text-ds-neutral-400);
    line-height: 18px;
  }
  .generate-action-button {
    width: 24px;
    height: 24px;
    background-color: transparent;
    color: var(--text-ds-neutral-100);
    background-color: transparent;
    border: 0px;
    border-radius: 4px;
  }
  .generate-action-button:hover {
    color: var(--text-ds-neutral-50);
    background-color: var(--bg-ds-surface-300);
    border: 0px;
  }
  .generate-action-button:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    color: var(--text-ds-neutral-100);
    outline: none;
  }
  .generate-action-button:active {
    color: var(--text-ds-primary-300);
    background-color: var(--bg-ds-surface-400);
    border: 0px;
  }
</style>
