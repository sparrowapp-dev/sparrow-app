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
  export let onUpdateEnvironment;
  export let isWebApp;

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
  export let handleOpenCurrentDynamicExpression;

  let dispatcher;
</script>

<div
  class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative"
  style="overflow: auto;"
>
  <RequestBodyNavigator
    {method}
    {requestState}
    {updateBeautifiedState}
    onUpdateRequestState={handleUpdateRequestBody}
    onUpdateRequestBodyLanguage={handleUpdateRequestBody}
    bind:dispatcher
    {handleOpenCurrentDynamicExpression}
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
        bind:dispatcher
        {handleOpenCurrentDynamicExpression}
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
        {handleOpenCurrentDynamicExpression}
        {onUpdateEnvironment}
      />
    {:else if requestState.requestBodyNavigation === RequestDataset.BINARY}
      <Binary />
    {:else if requestState.requestBodyNavigation === RequestDataset.FORMDATA}
      <FormData
        keyValue={[
          ...(body?.formdata?.file?.map((f) => ({ ...f, type: "file" })) || []),
          ...(body?.formdata?.text?.map((t) => ({ ...t, type: "text" })) || []),
        ]}
        {environmentVariables}
        onUpdateRequestBody={(pairs) => {
          const fileLength = body?.formdata?.file?.length || 0;
          const filePairs = pairs
            .slice(0, fileLength)
            .map(({ type, ...rest }) => rest);
          const textPairs = pairs
            .slice(fileLength)
            .map(({ type, ...rest }) => rest);

          onUpdateRequestState("formdata", {
            file: filePairs,
            text: textPairs,
          });
        }}
        {handleOpenCurrentDynamicExpression}
        {onUpdateEnvironment}
        {isWebApp}
      />
    {/if}
  </div>
</div>
