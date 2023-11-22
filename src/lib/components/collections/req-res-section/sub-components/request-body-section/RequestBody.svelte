<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import {
    currentTab,
    handleRawDataChange,
    handleRequestStateChange,
    isHorizontalVertical,
    tabs,
    updateFormDataFile,
    updateFormDataText,
    updateUrlEncode,
  } from "$lib/store/request-response-section";
  import type { RequestBody } from "$lib/utils/dto/requestbody";
  import { onDestroy } from "svelte";
  import { RequestDataset, RequestDataType } from "$lib/utils/enums/request.enum";
  import type {
    NewTab,
    KeyValuePair,
    KeyValuePairWithBase,
  } from "$lib/utils/interfaces/request.interface";
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";
  import KeyValueFile from "$lib/components/key-value/KeyValueFile.svelte";
import MonacoEditor from "./MonacoEditor.svelte";
  let bodyData: string = "";
  let currentTabId: string | null = null;
  let mainTab: string;
  let rawTab:RequestDataType;
  let tabList: NewTab[] = [];
  let rawValue: string = "";
  let urlEncoded: KeyValuePair[] = [];
  let formDataText: KeyValuePair[] = [];
  let formDataFile: KeyValuePairWithBase[] = [];
  let content = {
    text: "",
    json: undefined,
  };
  let inputValue:string="";

  const fetchBodyData = (id, list) => {
    list.forEach((elem) => {
      if (elem.id === id) {
        bodyData = elem.request.body.raw;
        rawValue = elem.request.body.raw;
        urlEncoded = elem.request.body.urlencoded;
        formDataText = elem.request.body.formdata.text;
        formDataFile = elem.request.body.formdata.file;
        content = {
          text: bodyData,
          json: undefined,
        };
        let { raw, dataset } = elem.request.state;
        mainTab = dataset;
        rawTab = raw;
      }
    });
  };

  const tabsUnsubscribe = tabs.subscribe((value) => {
    tabList = value;
    if (currentTabId && tabList) {
      fetchBodyData(currentTabId, tabList);
    }
  });

  const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      currentTabId = value.id;
      if (currentTabId && tabList) {
        fetchBodyData(currentTabId, tabList);
      }
    }
  });

  let handleDropdown = (tab: string) => {
    mainTab = tab;
    handleRequestStateChange(mainTab, "dataset", currentTabId);
  };

  let handleRawDropDown = (tab: RequestDataType) => {
    rawTab = tab;
    handleRequestStateChange(rawTab, "raw", currentTabId);
  };

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  const handleChange = (updatedContent: RequestBody) => {
    tabs.update((value) => {
      let temp = value.map((elem) => {
        if (elem.id === currentTabId) {
          elem.request.body.raw = updatedContent.text;
        }
        return elem;
      });
      return temp;
    });
  };

  const handleRawChange = () => {
    handleRawDataChange(rawValue, currentTabId);
  };
  const handleUrlEncodeChange = (pairs) => {
    updateUrlEncode(pairs, currentTabId);
  };
  const handleFormDataTextChange = (pairs) => {
    updateFormDataText(pairs, currentTabId);
  };

  const handleFormDataFileChange = (pairs) => {
    updateFormDataFile(pairs, currentTabId);
  };

  onDestroy(() => {
    currentTabUnsubscribe();
    tabsUnsubscribe();
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
          id: RequestDataset.NONE
        },
        {
          name: "Raw",
          id: RequestDataset.RAW
        },
        {
          name: "Form Data",
          id: RequestDataset.FORMDATA
        },
        {
          name: "URL Encoded",
          id: RequestDataset.URLENCODED
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
            id: RequestDataType.HTML 
          },
          {
            name: "JSON",
            id: RequestDataType.JSON
          },
          {
            name: "JavaScript",
            id: RequestDataType.JAVASCRIPT 
          },
          {
            name: "Text",
            id: RequestDataType.TEXT 
          },
          {
            name: "XML",
            id: RequestDataType.XML 
          }
        ]}
        onclick={handleRawDropDown}
      />
    {/if}
  </div>
  {#if mainTab === RequestDataset.RAW}
      <MonacoEditor bind:value={inputValue}  rawTab={rawTab} currentTabId={currentTabId} tabList={tabList} ></MonacoEditor>
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


