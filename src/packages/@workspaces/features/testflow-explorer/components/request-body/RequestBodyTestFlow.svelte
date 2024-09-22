<script lang="ts">
  import { RequestDataset } from "$lib/utils/enums/request.enum";
  import {
    Binary,
    FormData,
    None,
    Raw,
    RequestBodyNavigator,
    UrlEncoded,
  } from "./sub-body";

  export let environmentVariables;
  export let body;
  export let requestState;
  export let method;

  let isBodyBeautified = false;
  const updateBeautifiedState = (value: boolean) => {
    isBodyBeautified = value;
  };
</script>

<div class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative">
  <RequestBodyNavigator
    {method}
    {requestState}
    {updateBeautifiedState}
    onUpdateRequestState={() => {}}
  />
  <div style="flex:1; overflow:auto;">
    {#if requestState.requestBodyNavigation === RequestDataset.RAW}
      <Raw
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
        {environmentVariables}
        onUpdateEnvironment={() => {}}
        onUpdateRequestBody={() => {}}
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.FORMDATA}
      <FormData
        keyValue={body.formdata}
        {environmentVariables}
        onUpdateRequestBody={() => {}}
        onUpdateEnvironment={() => {}}
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.BINARY}
      <Binary />
    {/if}
  </div>
</div>
