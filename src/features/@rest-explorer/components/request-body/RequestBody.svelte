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
  } from "./sub-request-body";

  //   export let collectionsMethods: CollectionsMethods;

  export let environmentVariables = [];

  export let body;
  export let requestState;
  export let onUpdateRequestBody;
  export let onUpdateRequestState;
  export let method;

  import CodeMirror from "$lib/components/editor/CodeMirror.svelte";

  let currentTabId: string = "";
  let mainTab: string;
  let rawTab: RequestDataType;
  let rawValue: string = "";
  let urlEncoded: KeyValuePair[] = [];
  let formDataText: KeyValuePair[] = [];
  let formDataFile: KeyValuePairWithBase[] = [];
  let inputValue: string = "";
  let getMessage: boolean = true;
  let deleteMessage: boolean = true;

  //   const tabSubscribe = activeTab.subscribe((event: NewTab) => {
  //     if (event?.id && currentTabId != event?.id) {
  //       getMessage = true;
  //       deleteMessage = true;
  //     }
  //     if (event && event.property) {
  //       currentTabId = event?.id;
  //       rawValue = event?.property?.request?.body?.raw;
  //       urlEncoded = event?.property?.request?.body?.urlencoded;
  //       formDataText = event?.property?.request?.body?.formdata?.text;
  //       formDataFile = event?.property?.request?.body?.formdata?.file;
  //       mainTab = event?.property?.request?.state?.dataset;
  //       rawTab = event?.property?.request?.state?.raw;
  //     }
  //   });

  let isHorizontalMode: boolean;
  isHorizontal.subscribe((value) => (isHorizontalMode = value));

  const handleRawChange = (rawValue) => {
    collectionsMethods.updateRequestBody(rawValue, "raw");
  };
  const handleUrlEncodeChange = (pairs) => {
    collectionsMethods.updateRequestBody(pairs, "urlencoded");
  };
  const handleFormDataTextChange = (pairs) => {
    collectionsMethods.updateRequestBodyFormData(pairs, "text");
  };

  const handleFormDataFileChange = (pairs) => {
    collectionsMethods.updateRequestBodyFormData(pairs, "file");
  };

  onDestroy(() => {
    // tabSubscribe();
  });
</script>

<div class="ps-0 pe-0 rounded w-100">
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
    <!-- <KeyValue
      keyValue={urlEncoded}
      callback={handleUrlEncodeChange}
      {environmentVariables}
    /> -->
  {:else if requestState.dataset === RequestDataset.FORMDATA}
    <p>Text</p>
    <!-- <KeyValue
      keyValue={formDataText}
      callback={handleFormDataTextChange}
      {environmentVariables}
    /> -->
    <p>File</p>
    <!-- <KeyValue
      keyValue={formDataFile}
      callback={handleFormDataFileChange}
      {environmentVariables}
      type="file"
    /> -->
  {/if}
</div>

<style>
  .cursor-pointer {
    cursor: pointer;
  }
</style>
