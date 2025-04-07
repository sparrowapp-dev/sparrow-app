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

  export let environmentVariables;
  export let body;
  export let requestState: any = {};
  export let method;
  export let onUpdateRequestState;

  let isBodyBeautified = false;

  const updateBeautifiedState = (value: boolean) => {
    isBodyBeautified = value;
  };

  const handleUpdateRequestBody = (
    key: "requestBodyNavigation" | "requestBodyLanguage",
    value: string,
  ) => {
    requestState = { ...requestState, [key]: value };
    onUpdateRequestState(key, value);
  };
</script>

<div class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative">
  <RequestBodyNavigator
    {method}
    {requestState}
    {updateBeautifiedState}
    onUpdateRequestState={handleUpdateRequestBody}
    onUpdateRequestBodyLanguage={handleUpdateRequestBody}
  />
  <div style="flex:1; overflow:auto;">
    {#if requestState.requestBodyNavigation === RequestDataset.RAW}
      <Raw
        onUpdateRequestBody={(e) => {
          onUpdateRequestState("raw", e);
        }}
        lang={requestState?.requestBodyLanguage ?? "JSON"}
        value={body?.raw}
        {isBodyBeautified}
        {updateBeautifiedState}
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.NONE}
      <None />
    {:else if requestState.requestBodyNavigation === RequestDataset.URLENCODED}
      <UrlEncoded
        value={body.urlencoded}
        {environmentVariables}
        onUpdateRequestBody={(pairs) => {
          onUpdateRequestState("urlencoded", pairs);
        }}
        onUpdateEnvironment={() => {}}
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.BINARY}
      <Binary />
    {:else if requestState.requestBodyNavigation === RequestDataset.FORMDATA}
      <FormData
        keyValue={body?.formdata?.text}
        {environmentVariables}
        onUpdateRequestBody={(pairs) => {
          onUpdateRequestState("formdata", { text: pairs, file: [] });
        }}
        onUpdateEnvironment={() => {}}
      />
    {/if}
  </div>
</div>
