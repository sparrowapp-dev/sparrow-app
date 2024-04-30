<script lang="ts">
  import { isHorizontal } from "$lib/store/request-response-section";
  import { onDestroy } from "svelte";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import type { EditorSelection } from "@codemirror/state";
  import { editLink } from "$lib/store/api-request";
  import { v4 as uuidv4 } from "uuid";
  import { CodeMirrorHandler } from "./sub-input";
  import AddEnvironment from "$lib/components/collections/req-res-section/sub-components/add-environment-popup/AddEnvironment.svelte";
  import EnvironmentPicker from "$lib/components/collections/req-res-section/sub-components/environment-picker/EnvironmentPicker.svelte";

  export let environmentVariables = [];
  export let onUpdateRequestUrl;
  export let urlText: string = "";
  export let placeholder;
  export let theme;
  export let disabled = false;

  const environmentHelper = new EnvironmentHeper();
  let inputElement: HTMLInputElement;
  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let environmentAxisY: number;
  let environmentAxisX: number;
  let envMissing = false;
  let localEnvKey: string;
  let filterData = [];

  $: {
    if (trackCursor) {
      if (trackParanthesis.length === 2)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          urlText,
          trackParanthesis,
          trackCursor,
        );
    }
    if (trackParanthesis) {
      if (trackParanthesis.length === 2 && trackCursor)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
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
    const elem = document.getElementById("input-request-url");
    if (elem) {
      environmentAxisY = elem.getBoundingClientRect().top + 40;
      environmentAxisX = elem.getBoundingClientRect().left;
    }
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

  const handleResize = () => {
    const windowWidth = window.innerWidth;

    if (windowWidth <= 1300) {
      document.querySelector<HTMLElement>("#barIcon").click();
      isHorizontal.set(true);
    } else {
      document.querySelector<HTMLElement>("#lineIcon").click();
      isHorizontal.set(false);
    }
  };
  window.addEventListener("resize", handleResize);

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
  });

  const handleKeyPress = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    } else if (event.altKey && event.code === "KeyL") {
      inputElement?.focus();
      editLink.set(uuidv4());
    }
  };

  const handleEnvironmentBox = (change: boolean, envKey: string) => {
    envMissing = change;
    localEnvKey = envKey;
  };
</script>

<CodeMirrorHandler
  rawValue={urlText}
  handleRawChange={handleInputValue}
  handleFocusChange={handleFocusValue}
  handleBlurChange={handleBlurValue}
  {handleInputChange}
  handleKeyUpChange={handleKeyUpValue}
  handleKeyDownChange={handleKeyPress}
  codeMirrorEditorDiv={inputElement}
  filterData={environmentVariables}
  {handleEnvironmentBox}
  {theme}
  {placeholder}
  {disabled}
/>

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
{/if}
<!-- {#if envMissing && trackParanthesis.length == 0}
    <AddEnvironment
      {environmentAxisX}
      {environmentAxisY}
      updateEnvironment={collectionsMethods.updateEnvironment}
      {currentWorkspaceId}
      {currentEnvironment}
      {globalEnvironment}
      {handleEnvironmentBox}
      {localEnvKey}
    />
  {/if} -->

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
