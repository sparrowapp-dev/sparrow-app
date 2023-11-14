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
  import { onDestroy, onMount } from "svelte";
  import { JSONEditor, Mode } from "svelte-jsoneditor";
  import { CodeEditor } from "petrel";
  import { RequestDataset, RequestDataType } from "$lib/utils/enums/request.enum";
  import type {
    NewTab,
    KeyValuePair,
    KeyValuePairWithBase,
  } from "$lib/utils/interfaces/request.interface";
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";
  import KeyValueFile from "$lib/components/key-value/KeyValueFile.svelte";
  
  let bodyData: string = "";
  let currentTabId: string | null = null;
  let mainTab: string;
  let rawTab: string;
  let tabList: NewTab[] = [];
  let rawValue: string = "";
  let urlEncoded: KeyValuePair[] = [];
  let formDataText: KeyValuePair[] = [];
  let formDataFile: KeyValuePairWithBase[] = [];
  let content = {
    text: "",
    json: undefined,
  };

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

  let handleRawDropDown = (tab: string) => {
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

  // onMount(()=>{
  //   const codeEditor = new CodeEditor(document.getElementById("code-editor"))
  //   codeEditor.create();
  // });
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
        RequestDataset.NONE,
        RequestDataset.RAW,
        RequestDataset.FORMDATA,
        RequestDataset.URLENCODED,
      ]}
      onclick={handleDropdown}
    />
    <span class="pe-3" />
    {#if mainTab === RequestDataset.RAW}
      <Dropdown
        title={rawTab}
        data={[
          RequestDataType.HTML,
          RequestDataType.JSON,
          RequestDataType.JAVASCRIPT,
          RequestDataType.TEXT,
          RequestDataType.XML,
        ]}
        onclick={handleRawDropDown}
      />
    {/if}
  </div>
  {#if mainTab === RequestDataset.RAW && rawTab === RequestDataType.JSON}
    <div
      style="height:{isHorizontalVerticalMode ? '200px' : '400px'}"
      class="my-json-editor --jse-contents-background-color me-0 editor jse-theme-dark my-json-editor mt-0"
    >
      <JSONEditor
        bind:content
        onChange={handleChange}
        mainMenuBar={false}
        navigationBar={false}
        mode={Mode.text}
      />
    </div>
  {:else if mainTab === RequestDataset.RAW && (rawTab === RequestDataType.HTML || rawTab === RequestDataType.XML || RequestDataType.JAVASCRIPT || RequestDataType.TEXT)}
    <div id="code-editor" style="width: 100%">
      <textarea
        rows="8"
        style="color: aliceblue; width: 100%; background-color: #000000"
        class="outline-0"
        bind:value={rawValue}
        on:input={handleRawChange}
      />
    </div>
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
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";

  .--jse-contents-background-color {
    --jse-background-color: black;
  }

  .my-json-editor {
    --jse-theme-color-highlight: black;
  }
</style>
