<script lang="ts">
  import { RequestDataset } from "$lib/utils/enums/request.enum";
  import {
    FormData,
    None,
    Raw,
    RequestBodyNavigator,
    UrlEncoded,
  } from "./sub-body";

  export let environmentVariables = [];
  export let body;
  export let requestState;
  export let onUpdateRequestBody;
  export let onUpdateRequestState;
  export let method;
  let isBodyBeautified = false;
  const updateBeautifiedState = (value: boolean) => {
    isBodyBeautified = value;
  };
</script>

<div class="ps-0 pe-0 rounded w-100 h-100 position-relative">
  <RequestBodyNavigator
    {method}
    {onUpdateRequestState}
    {requestState}
    {updateBeautifiedState}
  />
  {#if requestState.requestBodyNavigation === RequestDataset.RAW}
    <Raw
      {onUpdateRequestBody}
      lang={requestState.requestBodyLanguage}
      value={body.raw}
      {isBodyBeautified}
      onUpdateBeautifiedState={updateBeautifiedState}
    />
  {:else if requestState.requestBodyNavigation === RequestDataset.NONE}
    <None />
  {:else if requestState.requestBodyNavigation === RequestDataset.URLENCODED}
    <UrlEncoded
      value={body.urlencoded}
      {onUpdateRequestBody}
      {environmentVariables}
    />
  {:else if requestState.requestBodyNavigation === RequestDataset.FORMDATA}
    <FormData
      textValue={body.formdata.text}
      fileValue={body.formdata.file}
      {onUpdateRequestBody}
      {environmentVariables}
      formData={body.formdata}
    />
  {/if}
</div>
