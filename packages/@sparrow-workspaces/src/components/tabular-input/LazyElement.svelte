<script lang="ts">
  import { inview } from "svelte-inview";
  import { CodeMirrorInput } from "../";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import type {
    ObserverEventDetails,
    ScrollDirection,
    Options,
  } from "svelte-inview";
  import { Checkbox } from "@sparrow/library/forms";
  import { DeleteRegular, MathFormulaRegular } from "@sparrow/library/icons";
  import { isDynamicExpressionModalOpen } from "../../features/testflow-explorer/store/testflow";

  export let element;
  export let dynamicExpression = false;
  export let index;
  export let pairs;
  export let theme;

  export let environmentVariables;
  export let onUpdateEnvironment;
  export let updateParam;
  export let updateCheck;
  export let deleteParam;
  export let isInputBoxEditable;
  export let isCheckBoxEditable;
  export let handleOpenCurrentDynamicExpression;
  export let customClass = "";

  let isInView: boolean = false;
  let scrollDirection: ScrollDirection | any;
  const options: Options = {
    rootMargin: "0px",
    unobserveOnEnter: true,
    threshold: 0.5,
  };

  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
    isInView = detail.inView;
    scrollDirection = detail?.scrollDirection?.vertical;
  };

  let dispatcher: any;
</script>

<div
  use:inview={options}
  on:inview_change={handleChange}
  class="pair-data-row d-flex align-items-center w-100 {customClass}"
  style="padding-right:1rem; padding-left: 4px;"
>
  {#if isInView}
    <!-- <div class="button-container">
      <Button
        size="extra-small"
        type="teritiary-regular"
        startIcon={ReOrderDotsRegular}
      />
    </div> -->
    <div style=" width: 24px;" class="me-2">
      {#if pairs.length - 1 != index || !isInputBoxEditable}
        <Checkbox
          size={"small"}
          checked={element.checked}
          on:input={() => {
            updateCheck(index);
          }}
          disabled={!isCheckBoxEditable}
        />
      {/if}
    </div>

    <div
      class="d-flex"
      style="width: calc(100% - {dynamicExpression
        ? '62px'
        : '64px'}); height:27px; margin-bottom:0px;"
    >
      <div class="w-50 position-relative text-ds-font-weight-medium">
        <CodeMirrorInput
          bind:value={element.key}
          onUpdateInput={() => {
            updateParam(index);
          }}
          disabled={!isInputBoxEditable ? true : false}
          placeholder={"Add Key"}
          {theme}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
      <div
        class="w-50 position-relative text-ds-font-weight-medium"
        style=" margin-left:0.03px;"
      >
        <CodeMirrorInput
          bind:value={element.value}
          onUpdateInput={() => {
            updateParam(index);
          }}
          placeholder={"Add Value"}
          disabled={!isInputBoxEditable ? true : false}
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

    <div class="ms-1 d-flex align-items-center justify-content-between gap-1">
      {#if pairs.length - 1 != index && isInputBoxEditable}
        {#if dynamicExpression}
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
        <Tooltip title="Delete" placement="bottom-center" distance={10}>
          <div class="button-container">
            <Button
              size="extra-small"
              type="teritiary-regular"
              startIcon={DeleteRegular}
              onClick={() => {
                deleteParam(index);
              }}
            />
          </div>
        </Tooltip>
      {/if}
    </div>
  {/if}
  {#if !isInView}
    <div class="skelton-parent"></div>
  {/if}
</div>

<style>
  .pair-data-row:first-child {
    border-top: none !important;
    height: 28px !important;
  }
  .pair-data-row:last-child {
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .pair-data-row {
    padding-top: 3px;
    padding-bottom: 3px;
    height: calc(28px);
    background-color: var(--bg-ds-surface-600);
    border-top: 1px solid var(--bg-ds-surface-400);
    transition: background-color 1ms ease;
  }
  .pair-data-row:hover {
    background-color: var(--bg-ds-surface-500);
  }
  .pair-data-row:hover .button-container {
    opacity: 1;
    visibility: visible;
  }
  .skelton-parent {
    display: flex;
    height: 24px;
    padding: 2px 20px 2px 0px;
    margin: 0px;
    gap: 10%;
  }
  .trash-icon {
    background: transparent;
  }
  .trash-icon:hover {
    background-color: var(--bg-ds-surface-300);
  }
  .button-container {
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.1s ease-in-out,
      visibility 0.1s;
  }

  /* Diff/Merge View: Style for new row added */
  .diff-row.diff-added {
    background-color: var(--bg-ds-success-800) !important ;
  }

  /* Diff/Merge View: Style for row modified */
  .diff-row.diff-modified {
    background-color: var(--bg-ds-success-800) !important ;
  }

  /* Diff/Merge View: Style for new row deleted */
  .diff-row.diff-deleted {
    background-color: var(--bg-ds-danger-800) !important;
  }
</style>