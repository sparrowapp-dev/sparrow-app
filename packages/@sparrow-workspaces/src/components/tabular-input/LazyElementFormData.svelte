<script lang="ts">
  import { Checkbox } from "@sparrow/library/forms";
  import { CodeMirrorInput } from "..";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import {
    AttachRegular,
    DeleteRegular,
    MathFormulaRegular,
  } from "@sparrow/library/icons";
  import { crossIcon as close } from "@sparrow/library/assets";

  export let element;
  export let index;
  export let pairs;
  export let theme;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isInputBoxEditable;
  export let isCheckBoxEditable;
  export let updateParam;
  export let updateCheck;
  export let deleteParam;
  export let uploadFormFile;
  export let removeFormFile;

  export let handleOpenCurrentDynamicExpression;
  export let dynamicExpression = false;
  let dispatcher: any;
</script>

<div
  class="pair-data-row w-100 d-flex align-items-center px-1"
  style="position:relative"
>
  <div style="width:24px;" class="me-2">
    {#if pairs.length - 1 != index || !isInputBoxEditable}
      <Checkbox
        checked={element.checked}
        on:input={() => updateCheck(index)}
        disabled={!isCheckBoxEditable}
      />
    {/if}
  </div>

  <div
    class="d-flex gap-0"
    style="width: calc(100% - {dynamicExpression ? '120px' : '86px'});"
  >
    <div class="w-50 d-flex align-items-center">
      <!-- <div class="position-absolute top-0" style="width: calc(50% - 48px);"> -->
      <div class="position-absolute top-0" style="width: calc(50% - 60px);">
        <CodeMirrorInput
          bind:value={element.key}
          onUpdateInput={() => updateParam(index)}
          disabled={!isInputBoxEditable}
          placeholder="Add Key"
          {theme}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>

    {#if element.type === "file"}
      <div class="w-50 position-relative d-flex align-items-center">
        <div class="position-relative rounded p-1 d-flex backgroundColor">
          <div
            class="bg-keyValuePairColor d-flex h-fit rounded"
            style="padding: 1px 4px;"
          >
            <p style="font-size:10px;" class="mb-0 me-1">
              {element.value || "corrupted-file"}
            </p>
            <img
              src={close}
              alt=""
              class="my-auto"
              style="cursor:pointer; height: 10px; width: 10px;"
              on:click={() => {
                if (isInputBoxEditable) {
                  removeFormFile(index);
                }
              }}
            />
          </div>
        </div>
      </div>
    {:else}
      <div class="w-50 d-flex align-items-center">
        <div
          class="position-absolute top-0 left-6"
          style="width: calc(50% - 60px);"
        >
          <CodeMirrorInput
            bind:value={element.value}
            onUpdateInput={() => updateParam(index)}
            placeholder="Add Value"
            disabled={!isInputBoxEditable}
            {theme}
            {environmentVariables}
            {onUpdateEnvironment}
            bind:dispatcher
            handleOpenDE={(obj) => {
              handleOpenCurrentDynamicExpression({
                ...obj,
                destination: {
                  row: "value",
                  index: index,
                },
              });
            }}
          />
        </div>
      </div>
    {/if}
  </div>

  <div
    class="ms-1 d-flex align-items-center justify-content-between gap-1"
    style="width:40px;"
  >
    {#if pairs.length - 1 != index}
      {#if isInputBoxEditable}
        {#if dynamicExpression && element.type === "text"}
          <Tooltip
            title="Insert dynamic"
            placement="bottom-center"
            distance={10}
          >
            <div class="button-container">
              <Button
                size="extra-small"
                type="teritiary-regular"
                startIcon={MathFormulaRegular}
                onClick={() => {
                  handleOpenCurrentDynamicExpression({
                    destination: {
                      row: "value",
                      index: index,
                    },
                    dispatch: dispatcher,
                  });
                }}
              />
            </div>
          </Tooltip>
        {/if}
        <Tooltip
          title="Attach"
          show={isInputBoxEditable &&
            element.type == "text" &&
            element.value == ""}
          placement="bottom-center"
        >
          <button
            class="button-container d-flex align-items-center justify-content-center border-0
                {isInputBoxEditable &&
            element.type == 'text' &&
            element.value == ''
              ? 'opacity-1'
              : 'opacity-0 pe-none'}"
            style="width:16px; height:16px; padding:2px; background:transparent;"
            on:click={() => uploadFormFile(index)}
          >
            <AttachRegular size="16px" color="var(--icon-ds-neutral-100)" />
          </button>
        </Tooltip>

        <Tooltip title="Delete" placement="bottom-center" distance={10}>
          <div class="button-container">
            <Button
              size="extra-small"
              type="teritiary-regular"
              startIcon={DeleteRegular}
              onClick={() => deleteParam(index)}
            />
          </div>
        </Tooltip>
      {:else}
        <div style="width:45px;" class="opacity:0;"></div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .pair-data-row:first-child {
    border-top: none !important;
    height: 28px !important;
  }
  .pair-data-row {
    padding-top: 3px;
    padding-bottom: 3px;
    padding-right: 20px;
    padding-left: 2px;
    height: calc(28px);
    background-color: var(--bg-ds-surface-600);
    border-top: 1px solid var(--bg-ds-surface-400);
  }
  .pair-data-row:hover {
    background-color: var(--bg-ds-surface-500);
  }
  .pair-data-row:hover .button-container {
    opacity: 1;
    visibility: visible;
  }
  .button-container {
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.1s ease-in-out,
      visibility 0.1s;
  }

  /* Diff view styling */

  /* Diff/Merge View: Style for new row added */
  .diff-row.diff-added {
    /* background-color: #113b21 !important; */
    background-color: var(--bg-ds-success-800) !important ;
  }

  /* Diff/Merge View: Style for row modified */
  .diff-row.diff-modified {
    /* background-color: #113b21 !important; */
    background-color: var(--bg-ds-success-800) !important ;
  }

  /* Diff/Merge View: Style for new row deleted */
  .diff-row.diff-deleted {
    /* background-color: #3d1514 !important; */
    background-color: var(--bg-ds-danger-800) !important;
  }
</style>
