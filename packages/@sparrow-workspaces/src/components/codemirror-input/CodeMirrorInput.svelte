<script lang="ts">
  import { EnvironmentHeper } from "@sparrow/common/utils/environment.helper";
  import type { EditorSelection } from "@codemirror/state";
  import { v4 as uuidv4 } from "uuid";
  import { CodeMirrorHandler } from "./sub-input";
  import { EnvironmentPicker, MissedEnvironment, ReviewEnvironment } from "../";
  import { WorkspaceRole } from "@sparrow/common/enums";

  /**
   * environment events
   */
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let onUpdateInput;
  /**
   * input value to be rendered on codemirror
   */
  export let value: string = "";
  /**
   * input codemirror states
   */
  export let placeholder;
  export let theme;
  export let disabled = false;
  /**
   * unique id used to focus codemirror input
   */
  export let codeId = "";
  let componentClass = "";
  export { componentClass as class };
  export let userRole: WorkspaceRole | undefined = undefined;
  export let isFocusedOnMount = false;

  const environmentHelper = new EnvironmentHeper();
  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let environmentAxisY: number;
  let environmentAxisX: number;
  let dialogType = "";
  let localEnvKey: string;
  let filterData = [];
  let id = uuidv4() + codeId;

  $: {
    if (trackCursor) {
      if (trackParanthesis.length === 2)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables.filtered,
          value,
          trackParanthesis,
          trackCursor,
        );
    }
    if (trackParanthesis) {
      if (trackParanthesis.length === 2 && trackCursor)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables.filtered,
          value,
          trackParanthesis,
          trackCursor,
        );
    }
  }

  let handleInputValue = () => {
    onUpdateInput(value);
    trackParanthesis = environmentHelper.balanceParanthesis(value);
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
    value = text;
  };
  let handleKeyUpValue = (e: EditorSelection) => {
    trackCursor = e.main.head;
  };

  const handleKeyPress = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
  };

  const handleEnvironmentBox = (change: string, envKey: string) => {
    dialogType = change;
    localEnvKey = envKey;
  };
</script>

<CodeMirrorHandler
  rawValue={value}
  handleRawChange={handleInputValue}
  handleFocusChange={handleFocusValue}
  handleBlurChange={handleBlurValue}
  {handleInputChange}
  handleKeyUpChange={handleKeyUpValue}
  handleKeyDownChange={handleKeyPress}
  filterData={environmentVariables.filtered}
  bind:environmentAxisX
  bind:environmentAxisY
  {handleEnvironmentBox}
  {theme}
  {placeholder}
  {disabled}
  {id}
  {componentClass}
  {isFocusedOnMount}
/>

{#if trackParanthesis.length === 2 && filterData.length > 0}
  <EnvironmentPicker
    {environmentAxisX}
    {environmentAxisY}
    {filterData}
    inputText={value}
    {trackCursor}
    {trackParanthesis}
    updateText={(txt) => {
      value = txt;
    }}
    {handleInputValue}
  />
{:else if dialogType === "env-not-found" && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
  <MissedEnvironment
    {environmentAxisX}
    {environmentAxisY}
    {onUpdateEnvironment}
    {handleEnvironmentBox}
    {environmentVariables}
    {localEnvKey}
    {id}
  />
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
