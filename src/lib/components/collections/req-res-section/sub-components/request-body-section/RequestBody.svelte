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
    NewTab,
  } from "$lib/utils/interfaces/request.interface";
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";
  import KeyValueFile from "$lib/components/key-value/KeyValueFile.svelte";
  import type { TabDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Observable } from "rxjs";
  import infoIcon from "$lib/assets/info-color-blue.svg";
  import crossIcon from "$lib/assets/cross.svg";
  export let collectionsMethods: CollectionsMethods;
  export let activeTab;

  import MonacoEditor from "./MonacoEditor.svelte";

  let currentTabId: string = "";
  let mainTab: string;
  let rawTab: RequestDataType;
  let rawValue: string = "";
  let urlEncoded: KeyValuePair[] = [];
  let formDataText: KeyValuePair[] = [];
  let formDataFile: KeyValuePairWithBase[] = [];
  let method: string;
  let inputValue: string = "";
  let getMessage : boolean = true;
  let deleteMessage : boolean = true;

  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    if(event?.id && currentTabId != event?.id){
      getMessage = true;
      deleteMessage = true;
    }
    currentTabId = event?.id;
    rawValue = event?.property.request.body.raw;
    urlEncoded = event?.property.request.body.urlencoded;
    formDataText = event?.property.request.body.formdata.text;
    formDataFile = event?.property.request.body.formdata.file;
    method = event?.property.request.method;
    mainTab = event?.property.request.state.dataset;
    rawTab = event?.property.request.state.raw;
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
    tabSubscribe();
  });
</script>

<div
  class="ps-0 {isHorizontalVerticalMode ? 'pt-3' : 'pt-2'} pe-0 rounded w-100"
>
  <div>
    {#if method === "GET" && getMessage}
      <div class="d-flex error-message py-1 mb-2">
        <div
          class="info-button d-flex align-items-center justify-content-center"
        >
          <img src={infoIcon} alt="info" />
        </div>
        <small class="w-100"
          >For GET requests, it's uncommon to use a request body. Some
          frameworks support the request body for GET method, but it is
          generally not recommended to use.</small
        >
        <div
          class="cross-button d-flex align-items-center justify-content-center"
        >
          <img src={crossIcon} alt="info"
          class="cursor-pointer" on:click={()=>{
            getMessage = false;
          }} />
        </div>
      </div>
    {:else if method === "DELETE" && deleteMessage}
      <div class="d-flex error-message py-1 mb-2">
        <div
          class="info-button d-flex align-items-center justify-content-center"
        >
          <img src={infoIcon} alt="info" />
        </div>
        <small class="w-100"
          >For DELETE requests, it's uncommon to use a request body. Some
          frameworks support the request body for DELETE method, but it is
          generally not recommended to use.</small
        >
        <div
          class="cross-button d-flex align-items-center justify-content-center"
        >
          <img src={crossIcon} alt="info"
          class="cursor-pointer"
          on:click={()=>{
            deleteMessage = false;
          }} />
        </div>
      </div>
    {/if}
  </div>
  <div class="mb-2 d-flex">
    <p class="team-menu__link pb-1 mb-0" style="font-size: 12px; margin-top:4px;">
      Data Types:
    </p>
    <span class="pe-3" />
    <Dropdown
      dropdownId={"hash124"}
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
        dropdownId = {"hash987"}
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

<style>
  .error-message {
    background-color: #11253a;
  }
  .error-message small {
    font-size: 12px;
  }
  .info-button,
  .cross-button {
    width: 36px;
  }
  .cursor-pointer{
    cursor: pointer;
  }
</style>
