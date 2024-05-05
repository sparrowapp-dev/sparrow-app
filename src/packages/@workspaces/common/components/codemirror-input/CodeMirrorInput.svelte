<script lang="ts">
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import type { EditorSelection } from "@codemirror/state";
  import { editLink } from "$lib/store/api-request";
  import { v4 as uuidv4 } from "uuid";
  import { CodeMirrorHandler } from "./sub-input";
  import { EnvironmentPicker, MissedEnvironment, ReviewEnvironment } from "../";

  export let environmentVariables;
  console.log(environmentVariables);
  export let onUpdateEnvironment;
  export let onUpdateRequestUrl;
  export let urlText: string = "";
  export let placeholder;
  export let theme;
  export let disabled = false;
  export let codeId = "";

  const environmentHelper = new EnvironmentHeper();
  let inputElement: HTMLInputElement;
  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let environmentAxisY: number;
  let environmentAxisX: number;
  let dialogType = false;
  let localEnvKey: string;
  let filterData = [];
  let id = uuidv4() + codeId;

  $: {
    if (trackCursor) {
      if (trackParanthesis.length === 2)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables.filtered,
          urlText,
          trackParanthesis,
          trackCursor,
        );
    }
    if (trackParanthesis) {
      if (trackParanthesis.length === 2 && trackCursor)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables.filtered,
          urlText,
          trackParanthesis,
          trackCursor,
        );
    }
  }

  let handleInputValue = () => {
    onUpdateRequestUrl(urlText);
    trackParanthesis = environmentHelper.balanceParanthesis(urlText);
  };

  let handleFocusValue = () => {
    handleInputValue();
  };
  let handleBlurValue = () => {
    setTimeout(() => {
      trackParanthesis = [];
      trackCursor = undefined;
      filterData = [];
    }, 300);
  };
  let handleInputChange = (text: string) => {
    urlText = text;
  };
  let handleKeyUpValue = (e: EditorSelection) => {
    trackCursor = e.main.head;
  };

  const handleKeyPress = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    } else if (event.altKey && event.code === "KeyL") {
      inputElement?.focus();
      editLink.set(uuidv4());
    }
  };

  const handleEnvironmentBox = (change: string, envKey: string) => {
    dialogType = change;
    localEnvKey = envKey;
  };
</script>

<!-- <div {id} class="w-100"> -->
<CodeMirrorHandler
  rawValue={urlText}
  handleRawChange={handleInputValue}
  handleFocusChange={handleFocusValue}
  handleBlurChange={handleBlurValue}
  {handleInputChange}
  handleKeyUpChange={handleKeyUpValue}
  handleKeyDownChange={handleKeyPress}
  codeMirrorEditorDiv={inputElement}
  filterData={environmentVariables.filtered}
  bind:environmentAxisX
  bind:environmentAxisY
  {handleEnvironmentBox}
  {theme}
  {placeholder}
  {disabled}
  {id}
/>
<!-- </div> -->

{#if trackParanthesis.length === 2 && filterData.length > 0}
  <EnvironmentPicker
    {environmentAxisX}
    {environmentAxisY}
    {filterData}
    inputText={urlText}
    {trackCursor}
    {trackParanthesis}
    updateText={(txt) => {
      urlText = txt;
    }}
    {handleInputValue}
  />
{:else if dialogType === "env-not-found"}
  <MissedEnvironment
    {environmentAxisX}
    {environmentAxisY}
    {onUpdateEnvironment}
    {handleEnvironmentBox}
    {environmentVariables}
    {localEnvKey}
    {id}
  />
  <!-- {localEnvKey} -->
{:else if dialogType === "env-found"}
  <ReviewEnvironment
    {environmentAxisX}
    {environmentAxisY}
    {localEnvKey}
    {environmentVariables}
    {handleEnvironmentBox}
    {id}
  />
{/if}

<svelte:window on:keydown={handleKeyPress} />

<style>
  .btn-primary {
    background: var(--sparrow-blue);
  }

  .view-active {
    filter: invert(60%) sepia(99%) saturate(302%) hue-rotate(183deg)
      brightness(102%) contrast(105%);
  }

  .btn-primary:hover {
    background: var(--send1-hoverbutton);
  }

  .btn-primary1 {
    background: var(--background-color);
    border: 1px solid var(--border-color);
  }

  .border-red:focus {
    border: 5px solid black;
  }

  .btn-primary1:hover {
    background: var(--border-color);
  }

  .input-outline {
    border-radius: 0%;
  }

  .input-outline:focus {
    outline: 2px solid var(--sparrow-blue);
  }
  .url-input {
    background-color: var(--background-dark);
    border: 1px solid #272727 !important;
    font-size: 12px;
  }
</style>
