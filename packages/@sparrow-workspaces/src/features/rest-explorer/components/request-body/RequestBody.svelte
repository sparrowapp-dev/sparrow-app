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
  import { Loader } from "@sparrow/library/ui";
  import { RequestDatasetEnum } from "@sparrow/common/types/workspace";

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
  export let isMergeViewLoading = false;
  export let mergeViewRequestDatasetType: RequestDatasetEnum;
  export let newModifiedContent: string | KeyValuePair[];
</script>

<div class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative">
  <RequestBodyNavigator
    {method}
    {onUpdateRequestState}
    {requestState}
    {updateBeautifiedState}
  />

  {#if isMergeViewLoading}
    <div
      class=""
      style="top: 0px; left: 0; right: 0; bottom: 0; z-index:3; position:absolute;"
    >
      <Loader loaderSize={"20px"} />
    </div>
  {/if}

  <div style="flex:1; overflow:auto;" class="ding-ding">
    {#if requestState.requestBodyNavigation === RequestDataset.RAW}
      {#if isMergeViewEnabled && mergeViewRequestDatasetType === RequestDatasetEnum.RAW}
        <Raw
          {onUpdateRequestBody}
          lang={requestState.requestBodyLanguage}
          value={body.raw}
          {isBodyBeautified}
          {updateBeautifiedState}
          bind:isMergeViewEnabled
          bind:isMergeViewLoading
          bind:newModifiedContent
        />
      {:else}
        <Raw
          {onUpdateRequestBody}
          lang={requestState.requestBodyLanguage}
          value={body.raw}
          {isBodyBeautified}
          {updateBeautifiedState}
        />
      {/if}
    {:else if requestState.requestBodyNavigation === RequestDataset.NONE}
      <None />
    {:else if requestState.requestBodyNavigation === RequestDataset.URLENCODED}
      {#if isMergeViewEnabled && mergeViewRequestDatasetType === RequestDatasetEnum.URLENCODED}
        <UrlEncoded
          value={body.urlencoded}
          {onUpdateRequestBody}
          {onUpdateEnvironment}
          {environmentVariables}
          bind:isMergeViewEnabled
          bind:isMergeViewLoading
          bind:newModifiedContent
        />
      {:else}
        <UrlEncoded
          value={body.urlencoded}
          {onUpdateRequestBody}
          {onUpdateEnvironment}
          {environmentVariables}
        />
      {/if}
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
