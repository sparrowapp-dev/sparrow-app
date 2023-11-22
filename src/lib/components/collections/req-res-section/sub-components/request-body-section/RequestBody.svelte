<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { isHorizontalVertical } from "$lib/store/request-response-section";
  import { onDestroy } from "svelte";
  import {
    RequestDataset,
    RequestDataType,
  } from "$lib/utils/enums/request.enum";
  import type {
    KeyValuePair,
    KeyValuePairWithBase,
  } from "$lib/utils/interfaces/request.interface";
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";
  import KeyValueFile from "$lib/components/key-value/KeyValueFile.svelte";
  import type { TabDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Observable } from "rxjs";

  export let collectionsMethods: CollectionsMethods;
  export let activeTab: Observable<TabDocument>;

  import MonacoEditor from "./MonacoEditor.svelte";

  let currentTabId: string = "";
  let mainTab: string;
  let rawTab: RequestDataType;
  let rawValue: string = "";
  let urlEncoded: KeyValuePair[] = [];
  let formDataText: KeyValuePair[] = [];
  let formDataFile: KeyValuePairWithBase[] = [];

  
  let inputValue: string = "";

  const tabSubscribe = activeTab.subscribe((event: TabDocument) => {
    currentTabId = event?.get("id");
    rawValue = event?.get("property").request.body.raw;
    urlEncoded = event?.get("property").request.body.urlencoded;
    formDataText = event?.get("property").request.body.formdata.text;
    formDataFile = event?.get("property").request.body.formdata.file;
   
    mainTab = event?.get("property").request.state.dataset;

    rawTab = event?.get("property").request.state.raw;
  });

  let handleDropdown = (tab: string) => {
    collectionsMethods.updateRequestState(tab, "dataset");
  };

  let handleRawDropDown = (tab: string) => {
    collectionsMethods.updateRequestState(tab, "raw");
  };

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

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
    tabSubscribe.unsubscribe();
  });
</script>

<div
  class="ps-0 {isHorizontalVerticalMode ? 'pt-3' : 'pt-2'} pe-0 rounded w-100"
>
  <div class="mb-2 d-flex">
    <p class="team-menu__link pb-1" style="font-size: 12px; margin-top:4px;">
      Data Types:
    </p>
    <span class="pe-3" />
    <Dropdown
      title={mainTab}
      data={[
        {
          name: "None",
          id: RequestDataset.NONE,
        },
        {
          name: "Raw",
          id: RequestDataset.RAW,
        },
        {
          name: "Form Data",
          id: RequestDataset.FORMDATA,
        },
        {
          name: "URL Encoded",
          id: RequestDataset.URLENCODED,
        },
      ]}
      onclick={handleDropdown}
    />
    <span class="pe-3" />
    {#if mainTab === RequestDataset.RAW}
      <Dropdown
        title={rawTab}
        data={[
          {
            name: "HTML",
            id: RequestDataType.HTML,
          },
          {
            name: "JSON",
            id: RequestDataType.JSON,
          },
          {
            name: "JavaScript",
            id: RequestDataType.JAVASCRIPT,
          },
          {
            name: "Text",
            id: RequestDataType.TEXT,
          },
          {
            name: "XML",
            id: RequestDataType.XML,
          },
        ]}
        onclick={handleRawDropDown}
      />
    {/if}
  </div>
  {#if mainTab === RequestDataset.RAW}
    <MonacoEditor
      bind:value={inputValue}
      callback={handleRawChange}
      {rawTab}
      {rawValue}
      {currentTabId}
    />
  {:else if mainTab === RequestDataset.NONE}
    <p class="team-menu__link pb-1" style="font-size: 12px; margin-top:4px;">
      No Data type is selected. Check your API provider’s documentation to see
      if you need to send body.
    </p>
  {:else if mainTab === RequestDataset.URLENCODED}
    <KeyValue keyValue={urlEncoded} callback={handleUrlEncodeChange} />
  {:else if mainTab === RequestDataset.FORMDATA}
    <p>Text</p>
    <KeyValue keyValue={formDataText} callback={handleFormDataTextChange} />
    <p>File</p>
    <KeyValueFile keyValue={formDataFile} callback={handleFormDataFileChange} />
  {/if}
</div>
