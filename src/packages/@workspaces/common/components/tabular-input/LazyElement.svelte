<script lang="ts">
  import { inview } from "svelte-inview";
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import close from "$lib/assets/close-icon.svg";
  import { CodeMirrorInput } from "../";
  import { Tooltip } from "@library/ui";
  import type {
    ObserverEventDetails,
    ScrollDirection,
    Options,
  } from "svelte-inview";
  import { Skeleton } from "@library/ui/skeleton";

  export let element;
  export let index;
  export let pairs;
  export let mode;
  export let type;
  export let theme;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let updateParam;
  export let updateCheck;
  export let removeFormFile;
  export let deleteParam;
  export let uploadFormFile;

  let isInView: boolean = false;
  let scrollDirection: ScrollDirection | any;
  const options: Options = {
    rootMargin: "50px",
    unobserveOnEnter: true,
    threshold: 0.5,
  };

  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
    isInView = detail.inView;
    scrollDirection = detail?.scrollDirection?.vertical;
    console.log("isInView : ", isInView, " : ", index, " : ", detail);
  };
</script>

<div
  use:inview={options}
  on:inview_change={handleChange}
  aria-label="Toggle Hover"
  class="sortable > div pair-container lazy-element"
  data-list-key={JSON.stringify({
    name: element.key,
    description: element.value,
    checked: element.checked,
  })}
>
  {#if isInView}
    <div
      style="padding-top: 1px; display: flex; flex-direction: column; width: 100%;"
    >
      <div
        class="d-flex w-100 align-items-center justify-content-center gap-3 pair-container"
        style="padding-top: 3px; padding-bottom: 3px; height: 24px;"
      >
        <img src={dragIcon} alt="" class="d-none" style="cursor:grabbing;" />
        <div style="width:30px;">
          {#if pairs.length - 1 != index || mode === "READ"}
            <label class="container">
              <input
                type="checkbox"
                bind:checked={element.checked}
                on:input={() => updateCheck(index)}
              />
              <span class="checkmark"></span>
            </label>
          {/if}
        </div>

        <div class="d-flex gap-0" style="width:calc(100% - 120px);">
          <div class="w-50 position-relative">
            <CodeMirrorInput
              userRole={"admin"}
              bind:value={element.key}
              onUpdateInput={() => updateParam(index)}
              disabled={mode == "READ"}
              placeholder={"Add Key"}
              {theme}
              {environmentVariables}
              {onUpdateEnvironment}
            />
          </div>
          {#if type === "file"}
            <div class="w-50">
              <div
                class="position-relative rounded p-1 d-flex backgroundColor"
                style="height: 27px;"
              >
                {#if element.value === ""}
                  <input
                    type="text"
                    class="form-control keyValuePair py-1"
                    readonly
                    style="z-index:4; font-size:13px; position: absolute; top:0; left:0; right:0; bottom:-1;"
                    placeholder="Choose File"
                  />
                  <input
                    class="form-input"
                    type="text"
                    id="formdata-file"
                    on:click={() => uploadFormFile(index)}
                    style="opacity: 0; position: absolute; top:0; left:0; right:0; bottom:0; z-index:10;"
                  />
                {:else}
                  <input
                    type="text"
                    class="keyValuePair py-1"
                    readonly
                    style="z-index:4; font-size:13px; position: absolute; top:0; left:0; right:0; bottom:-1;"
                    placeholder=""
                  />
                  <div
                    class="position-absolute"
                    style="height:18px; z-index: 5; font-size:13px; top:0; left:0px;"
                  >
                    <span style="font-size:10px;" class="m-1"
                      >{element.value}</span
                    >
                    <img
                      src={close}
                      alt=""
                      style="cursor:pointer;"
                      on:click={() => removeFormFile(index)}
                    />
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <div class="w-50 position-relative">
              <CodeMirrorInput
                bind:value={element.value}
                onUpdateInput={() => updateParam(index)}
                placeholder={"Add Value"}
                disabled={mode == "READ"}
                {theme}
                {environmentVariables}
                {onUpdateEnvironment}
              />
            </div>
          {/if}
        </div>
        {#if pairs.length - 1 != index}
          <div
            class="h-70 pe-1 d-flex justify-content-center align-items-center"
          >
            <button class="bg-secondary-700 border-0" style="width:40px;">
              {#if mode !== "READ"}
                <Tooltip title={"Delete"} placement={"left"} distance={10}>
                  <img
                    class="trash-icon"
                    src={trashIcon}
                    on:click={() => deleteParam(index)}
                    alt=""
                  />
                </Tooltip>
              {/if}
            </button>
          </div>
        {:else}
          <div class="h-75 pe-1">
            <button class="bg-backgroundColor border-0" style="width:40px;" />
          </div>
        {/if}
      </div>
    </div>
  {/if}
  {#if !isInView}
    <div class="skelton-parent">
      <Skeleton width="100%" height="18px" />
    </div>
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
