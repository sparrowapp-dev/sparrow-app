<script lang="ts">
  import { inview } from "svelte-inview";
  import { trashIcon as trashIcon } from "@sparrow/library/assets";
  import { CodeMirrorInput } from "../";
  import { Tooltip } from "@sparrow/library/ui";
  import type {
    ObserverEventDetails,
    ScrollDirection,
    Options,
  } from "svelte-inview";

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
  aria-label="Toggle Hover"
  class="sortable > div pair-container lazy-element"
  style=" width:100%;"
  data-list-key={JSON.stringify({
    name: element.key,
    description: element.value,
    checked: element.checked,
  })}
>
  {#if isInView}
    <div
      style="padding-top: 1px;  display: flex;flex-direction: column;width:100%;"
    >
      <div
        class="d-flex w-100 align-items-center justify-content-center gap-3 pair-container"
        style="padding-top:3px; padding-bottom:3px; height:24px;"
      >
        <div style="width:30px; height: 14px;">
          {#if pairs.length - 1 != index || !isInputBoxEditable}
            <!-- checkbox should be visible to last row in readonly mode -->
            <label class="container">
              <input
                type="checkbox"
                bind:checked={element.checked}
                on:input={() => {
                  updateCheck(index);
                }}
                disabled={!isCheckBoxEditable}
              />
              <span class="checkmark"></span>
            </label>
          {/if}
        </div>

        <div class=" d-flex gap-0" style="width:calc(100% - 120px);">
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
          <!-- {/if} -->
        </div>
        <div class="h-70 d-flex justify-content-center align-items-center">
          <div style="width:40px;">
            <div style=" margin-left: 10px; margin-right: 6px;">
              {#if pairs.length - 1 != index}
                <!-- lists first to last second row -->
                {#if isInputBoxEditable}
                  <Tooltip
                    title={"Delete"}
                    placement={"bottom-left"}
                    distance={10}
                  >
                    <button
                      class="bg-secondary-700 d-flex justify-content-center align-items-center border-0"
                      style="width: 24px; height:16px; padding-end"
                      on:click={() => {
                        deleteParam(index);
                      }}
                    >
                      <img class="trash-icon" src={trashIcon} alt="" />
                    </button>
                  </Tooltip>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
  {#if !isInView}
    <div class="skelton-parent"></div>
  {/if}
</div>

<style>
  .keyValuePair {
    background-color: transparent;
    border-radius: 0;
    border: 1px solid transparent;
  }
  .pair-container:nth-child(odd) {
    margin-top: -1px;
  }

  /* The container */
  .container {
    display: block;
    position: relative;
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
    background-color: var(--bg-primary-300);
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
    border: solid var(--text-secondary-800);
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  .trash-icon:hover {
    background-color: var(--bg-secondary-500);
  }

  .skelton-parent {
    display: flex;
    height: 24px;
    padding: 2px 20px 2px 0px;
    margin: 0px;
    gap: 10%;
  }
</style>
