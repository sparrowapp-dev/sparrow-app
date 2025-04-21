<script lang="ts">
  import { RequestDataset } from "@sparrow/common/enums/request.enum";
  import {
    Binary,
    FormData,
    None,
    Raw,
    RequestBodyNavigator,
    UrlEncoded,
  } from "./sub-body";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";

  export let environmentVariables = [];
  export let onUpdateEnvironment;
  export let body;
  export let requestState;
  export let onUpdateRequestBody;
  export let onUpdateRequestState;
  export let method;
  export let isWebApp = false;
  let isBodyBeautified = false;
  const updateBeautifiedState = (value: boolean) => {
    isBodyBeautified = value;
  };

  export let isMergeViewEnabled = false;
  export let mergeViewRequestDatasetType: RequestDataset;
  export let newModifiedContent: string | KeyValuePair[];

  // Wrapper variables for each component type
  $: rawMergeEnabled =
    isMergeViewEnabled && mergeViewRequestDatasetType === RequestDataset.RAW;
  $: rawModifiedContent =
    mergeViewRequestDatasetType === RequestDataset.RAW
      ? newModifiedContent
      : null;

  $: urlencodedMergeEnabled =
    isMergeViewEnabled &&
    mergeViewRequestDatasetType === RequestDataset.URLENCODED;
  $: urlencodedModifiedContent =
    mergeViewRequestDatasetType === RequestDataset.URLENCODED
      ? newModifiedContent
      : null;

  // Add similar variables for other component types as needed

  // Handler functions to synchronize changes back to parent variables
  function updateMergeEnabled(value: boolean) {
    isMergeViewEnabled = value;
    console.log("sync isMergeViewEnabled :>> ", isMergeViewEnabled);
  }

  function updateModifiedContent(value: string | KeyValuePair[]) {
    newModifiedContent = value;
    console.log("sync newModifiedContent :>> ", newModifiedContent);
  }
</script>

<div class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative">
  <RequestBodyNavigator
    {method}
    {onUpdateRequestState}
    {requestState}
    {updateBeautifiedState}
  />
  <div style="flex:1; overflow:auto;">
    {#if requestState.requestBodyNavigation === RequestDataset.RAW}
      <Raw
        {onUpdateRequestBody}
        lang={requestState.requestBodyLanguage}
        value={body.raw}
        {isBodyBeautified}
        {updateBeautifiedState}
        bind:isMergeViewEnabled={rawMergeEnabled}
        bind:newModifiedContent={rawModifiedContent}
        on:mergeViewStateChange={(e) =>
          mergeViewRequestDatasetType === RequestDataset.RAW &&
          updateMergeEnabled(e.detail)}
        on:mergeViewContentChange={(e) =>
          mergeViewRequestDatasetType === RequestDataset.RAW &&
          updateModifiedContent(e.detail)}
      />
      <!-- bind:isMergeViewEnabled
        bind:newModifiedContent -->
    {:else if requestState.requestBodyNavigation === RequestDataset.NONE}
      <None />
    {:else if requestState.requestBodyNavigation === RequestDataset.URLENCODED}
      <UrlEncoded
        value={body.urlencoded}
        {onUpdateRequestBody}
        {onUpdateEnvironment}
        {environmentVariables}
        bind:isMergeViewEnabled={urlencodedMergeEnabled}
        bind:newModifiedContent={urlencodedModifiedContent}
        on:mergeViewStateChange={(e) =>
          mergeViewRequestDatasetType === RequestDataset.URLENCODED &&
          updateMergeEnabled(e.detail)}
        on:mergeViewContentChange={(e) =>
          mergeViewRequestDatasetType === RequestDataset.URLENCODED &&
          updateModifiedContent(e.detail)}
      />
      <!-- bind:isMergeViewEnabled
        bind:newModifiedContent -->
    {:else if requestState.requestBodyNavigation === RequestDataset.FORMDATA}
      <FormData
        keyValue={body.formdata}
        {onUpdateRequestBody}
        {environmentVariables}
        {onUpdateEnvironment}
        formData={body.formdata}
        {isWebApp}
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.BINARY}
      <Binary />
    {/if}
  </div>
</div>
