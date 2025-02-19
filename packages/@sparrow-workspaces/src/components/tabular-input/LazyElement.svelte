<script lang="ts">
  import { inview } from "svelte-inview";
  import { trashIcon as trashIcon } from "@sparrow/library/assets";
  import { CodeMirrorInput } from "../";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import type {
    ObserverEventDetails,
    ScrollDirection,
    Options,
  } from "svelte-inview";
  import { Checkbox } from "@sparrow/library/forms";
  import { DeleteIcon2 } from "@sparrow/library/icons";

  export let element;
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
</script>

<div
  use:inview={options}
  on:inview_change={handleChange}
  class="w-100 pair-data-row px-3 d-flex align-items-center"
>
  {#if isInView}
    <div style=" width: 24px;" class="me-3">
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

    <div class="d-flex" style="width: calc(100% - 64px);">
      <div class="w-50 position-relative">
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
      <div class="w-50 position-relative">
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
        />
      </div>
    </div>
    <div
      style="width:16px;"
      class="ms-3 d-flex justify-content-center align-items-center"
    >
      <div class="d-flex" style="width:16px;">
        <div class="d-flex">
          {#if pairs.length - 1 != index}
            <!-- lists first to last second row -->
            {#if isInputBoxEditable}
              <Tooltip
                title={"Delete"}
                placement={"bottom-center"}
                distance={10}
              >
                <button
                  class="trash-icon border-radius-2 d-flex justify-content-center align-items-center p-0 border-0"
                  style="width: 24px; height:24px;"
                  on:click={() => {
                    deleteParam(index);
                  }}
                >
                  <DeleteIcon2 />
                </button>
                <!-- <Button
                  buttonClassProp=""
                  size="extra-small"
                  type="teritiary-regular"
                  startIcon={DeleteIcon2}
                  onClick={() => deleteParam(index)}
                /> -->
              </Tooltip>
            {/if}
          {/if}
        </div>
      </div>
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
  .pair-data-row {
    padding-top: 3px;
    padding-bottom: 3px;
    height: calc(28px);
    background-color: var(--bg-ds-surface-600);
    border-top: 1px solid var(--bg-ds-surface-400);
  }
  .pair-data-row:hover {
    background-color: var(--bg-ds-surface-500);
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
</style>
