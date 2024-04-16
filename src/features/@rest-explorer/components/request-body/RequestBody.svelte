<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { isHorizontal } from "$lib/store/request-response-section";
  import { onDestroy } from "svelte";
  import {
    RequestDataset,
    RequestDataType,
  } from "$lib/utils/enums/request.enum";
  import type {
    KeyValuePair,
    KeyValuePairWithBase,
    NewTab,
  } from "$lib/utils/interfaces/request.interface";
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";
  import type { TabDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

  import {
    FormData,
    None,
    Raw,
    RequestBodyNavigator,
    UrlEncoded,
    WarningScreen,
  } from "./sub-body";

  export let environmentVariables = [];
  export let body;
  export let requestState;
  export let onUpdateRequestBody;
  export let onUpdateRequestState;
  export let method;

  let isHorizontalMode: boolean;
  isHorizontal.subscribe((value) => (isHorizontalMode = value));
</script>

<div class="ps-0 pe-0 rounded w-100 h-100 position-relative">
  <RequestBodyNavigator
    method={$method}
    {onUpdateRequestState}
    {requestState}
  />
  {#if requestState.dataset === RequestDataset.RAW}
    <Raw {onUpdateRequestBody} lang={requestState.raw} value={$body.raw} />
  {:else if requestState.dataset === RequestDataset.NONE}
    <None />
  {:else if requestState.dataset === RequestDataset.URLENCODED}
    <UrlEncoded
      value={$body.urlencoded}
      {onUpdateRequestBody}
      {environmentVariables}
    />
  {:else if requestState.dataset === RequestDataset.FORMDATA}
    <FormData
      textValue={$body.formdata.text}
      fileValue={$body.formdata.file}
      {onUpdateRequestBody}
      {environmentVariables}
      formData={$body.formdata}
    />
  {/if}
</div>
