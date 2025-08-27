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
  import {
    ArrowHookRegular,
    DeleteRegular,
    ReOrderDotsRegular,
    ArrowUndoRegular,
  } from "@sparrow/library/icons";
  import { CodeMirrorInput } from "..";
  import { TabularInputTheme } from "../../utils";
  import { DismissRegular } from "@sparrow/library/icons";
  import { CheckMarkIcon } from "@sparrow/library/icons";
  import SparkleFilled from "../../../../@sparrow-library/src/icons/SparkleFilled.svelte";
  import { onDestroy } from "svelte";

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
  export let onUpdateVariableSelection: (type?: string, id?: string) => void;

  export let isRevertEnabled = false;

  let pairs: KeyValueChecked[] = keyValue;
  let controller: boolean = false;
  const theme = new TabularInputTheme().build();

  // Undo functionality state - now using IDs instead of indices
  let undoTimers: Map<string, NodeJS.Timeout> = new Map();
  let undoCountdowns: Map<string, number> = new Map();
  let countdownIntervals: Map<string, NodeJS.Timeout> = new Map();

  $: {
    if (keyValue) {
      pairs = keyValue;
      identifySelectAllState();
    }
  }

  // Clean up timers on component destroy
  onDestroy(() => {
    undoTimers.forEach((timer) => clearTimeout(timer));
    countdownIntervals.forEach((interval) => clearInterval(interval));
  });

  /**
   * @description - calculates the select all checkbox state - weather checked or not
   */
  const identifySelectAllState = () => {
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
        type: "user-generated",
        id: crypto.randomUUID(),
        undo: false,
      });
      pairs = pairs;
    }
    callback(pairs);
  };

  /**
   * @description - start undo countdown for generated variables
   * @param id - unique ID of the pairs that needs to be marked for deletion
   */
  const startUndoCountdown = (id: string): void => {
    // Set the undo state using the callback function
    onUpdateVariableSelection("undo", id);
    // Start countdown
    undoCountdowns.set(id, 10);
    // Start countdown interval
    const countdownInterval = setInterval(() => {
      const currentCount = undoCountdowns.get(id);
      if (currentCount && currentCount > 1) {
        undoCountdowns.set(id, currentCount - 1);
        pairs = pairs;
      } else {
        clearInterval(countdownInterval);
        countdownIntervals.delete(id);
      }
    }, 1000);
    countdownIntervals.set(id, countdownInterval);

    // Set timer for permanent deletion
    const undoTimer = setTimeout(() => {
      permanentlyDeleteItem(id);
    }, 10000);

    undoTimers.set(id, undoTimer);
  };

  /**
   * @description - permanently delete the item after timeout
   * @param id - unique ID of the pairs that needs to be permanently deleted
   */
  const permanentlyDeleteItem = (id: string): void => {
    // Clean up timers and state
    const timer = undoTimers.get(id);
    const interval = countdownIntervals.get(id);
    if (timer) {
      clearTimeout(timer);
      undoTimers.delete(id);
    }
    if (interval) {
      clearInterval(interval);
      countdownIntervals.delete(id);
    }
    undoCountdowns.delete(id);

    // Remove the item permanently using the callback
    onUpdateVariableSelection("remove", id);
  };

  /**
   * @description - undo the deletion of a generated variable
   * @param id - unique ID of the pairs that needs to be restored
   */
  const undoGeneratedDelete = (id: string): void => {
    // Clear the timers
    const timer = undoTimers.get(id);
    const interval = countdownIntervals.get(id);
    if (timer) {
      clearTimeout(timer);
      undoTimers.delete(id);
    }
    if (interval) {
      clearInterval(interval);
      countdownIntervals.delete(id);
    }
    undoCountdowns.delete(id);

    // Remove undo state using the callback
    onUpdateVariableSelection("removeUndo", id);
  };

  /**
   * @description - delete pairs
   * @param index - index of the pairs that needs to be deleted
   */
  const deletePairs = (index: number): void => {
    if (pairs.length > 1 || isGeneratedVariable) {
      if (isGeneratedVariable) {
        // For generated variables, start the undo countdown using the item's ID
        const itemId = pairs[index].id;
        if (itemId) {
          startUndoCountdown(itemId);
        }
      } else {
        // For regular variables, delete immediately
        let filteredKeyValue = pairs.filter((elem, i) => {
          if (i !== index) {
            return true;
          }
          return false;
        });
        pairs = filteredKeyValue;
        callback(pairs);
      }
    }
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
    class="d-flex align-items-center w-100 px-1 header-box gap-2"
    style="height: 28px; background-color:var(--bg-ds-surface-400);"
  >
    <div style="width:50px; padding-left: 28px;">
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
      <p class="mb-0 w-50 header-text" style="padding-left: 16px;">Key</p>
      <p class="mb-0 w-50 header-text" style="padding-left: 30px;">Value</p>
    </div>
    <div class="d-flex justify-content-end pe-2" style="width: 100px;">
      {#if isGeneratedVariable}
        {#if isGeneratedVariable && pairs.length > 0}
          <button
            class="bg-transparent border-0 d-flex text-nowrap common-text align-items-center"
            style="color: var(--text-ds-primary-300);"
            on:click={() => onUpdateVariableSelection("accept-all")}
            >Accept All</button
          >
        {:else if isRevertEnabled}
          <button
            class="bg-transparent border-0 d-flex text-nowrap common-text align-items-center"
            style="color: var(--text-ds-neutral-300); text-decoration: underline;"
            on:click={() => onUpdateVariableSelection("revert-all")}
            >Revert Changes</button
          >
        {/if}
      {:else}
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
      {/if}
    </div>
  </div>

  <div class="w-100 d-block position-relative">
    {#if pairs}
      {#each pairs as element, index (element.id || `fallback-${index}`)}
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
              <div
                class="d-flex justify-content-center align-items-center"
                style="width:50px;"
              >
                <div class="d-flex w-100">
                  <span style="width: 25px;">
                    {#if element.type === "ai-generated"}
                      <Tooltip
                        title={"Generated Variable"}
                        placement={"top-right"}
                        distance={10}
                      >
                        <button
                          class="generate-action-button sparkle-icon-parent accept"
                          on:click|stopPropagation={() => {}}
                        >
                          <SparkleFilled size="12px" color="" />
                        </button>
                      </Tooltip>
                    {/if}
                  </span>

                  <span style="width: 25px;">
                    {#if pairs.length - 1 != index && !isGeneratedVariable}
                      <Checkbox
                        checked={element.checked}
                        on:input={() => {
                          updateCheck(index);
                        }}
                        {disabled}
                      />
                    {/if}
                  </span>
                </div>
              </div>
              <div
                class="d-flex"
                style="width: calc(100% - 100px); height:28px;"
              >
                <div class="w-50 position-relative">
                  <div
                    class="position-absolute w-100 top-0 left-0 right-0"
                    style="width: calc(50% - {isGeneratedVariable
                      ? '45px'
                      : '33px'} );"
                  >
                    <CodeMirrorInput
                      bind:value={element.key}
                      onUpdateInput={() => {
                        updatePairs(index);
                      }}
                      disabled={disabled || element.undo}
                      placeholder={"Add Variable"}
                      {theme}
                      enableEnvironmentHighlighting={false}
                    />
                  </div>
                </div>

                <div class="w-50 position-relative">
                  <div
                    class="position-absolute w-100 top-0 left-0 right-0"
                    style="width: calc(50% - {isGeneratedVariable
                      ? '45px'
                      : '33px'});"
                  >
                    <CodeMirrorInput
                      bind:value={element.value}
                      onUpdateInput={() => {
                        updatePairs(index);
                      }}
                      disabled={disabled || element.undo}
                      placeholder={"Add Value"}
                      {theme}
                      enableEnvironmentHighlighting={false}
                    />
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-end" style="width: 50px;">
                {#if pairs.length - 1 != index && !disabled && !isGeneratedVariable}
                  <span style="width: 25px;">
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
                  </span>
                  <span style="width: 25px;">
                    {#if element.lifespan === "short"}
                      <Tooltip
                        title={"Revert"}
                        placement={"top-right"}
                        distance={10}
                      >
                        <button
                          class="generate-action-button accept"
                          on:click|stopPropagation={() => {
                            onUpdateVariableSelection("revert", index);
                          }}
                        >
                          <ArrowHookRegular
                            size="12px"
                            color="var(--text-ds-neutral-100)"
                          />
                        </button>
                      </Tooltip>
                    {/if}
                  </span>
                {:else if isGeneratedVariable}
                  {#if element?.undo}
                    <div class="d-flex align-items-center gap-1">
                      <Tooltip
                        title={"Undo delete"}
                        placement={"top-right"}
                        distance={10}
                      >
                        <button
                          class="generate-action-button undo"
                          on:click|stopPropagation={() =>
                            undoGeneratedDelete(element.id)}
                        >
                          <ArrowUndoRegular
                            size="12"
                            color={"var(--icon-ds-neutral-50)"}
                          />
                        </button>
                      </Tooltip>
                    </div>
                  {:else}
                    <div class="d-flex gap-1">
                      <Tooltip
                        title={"Add"}
                        placement={"top-right"}
                        distance={10}
                      >
                        <button
                          class="generate-action-button accept"
                          on:click|stopPropagation={() => {
                            onUpdateVariableSelection("accept", index);
                          }}
                        >
                          <CheckMarkIcon
                            size="12"
                            color={"var(--icon-ds-success-300)"}
                          />
                        </button>
                      </Tooltip>
                      <Tooltip
                        title={"Remove"}
                        placement={"top-right"}
                        distance={10}
                      >
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
                      </Tooltip>
                    </div>
                  {/if}
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
  .countdown-text {
    font-size: 10px;
    color: var(--text-ds-neutral-300);
    min-width: 20px;
    text-align: center;
  }
  .common-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-style: normal;
    font-size: 12px;
    line-height: 130%;
    letter-spacing: 0;
    text-align: center;
    vertical-align: middle;
  }
  .sparkle-icon-parent {
    color: var(--text-ds-neutral-400);
  }
  .sparkle-icon-parent:hover {
    color: var(--text-ds-neutral-100);
  }
</style>
