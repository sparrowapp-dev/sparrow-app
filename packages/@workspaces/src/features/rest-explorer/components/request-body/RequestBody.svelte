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

  export let environmentVariables = [];
  export let onUpdateEnvironment;
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
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.NONE}
      <None />
    {:else if requestState.requestBodyNavigation === RequestDataset.URLENCODED}
      <UrlEncoded
        value={body.urlencoded}
        {onUpdateRequestBody}
        {onUpdateEnvironment}
        {environmentVariables}
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.FORMDATA}
      <FormData
        keyValue={body.formdata}
        {onUpdateRequestBody}
        {environmentVariables}
        {onUpdateEnvironment}
        formData={body.formdata}
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.BINARY}
      <Binary />
    {/if}
  </div>
</div>
