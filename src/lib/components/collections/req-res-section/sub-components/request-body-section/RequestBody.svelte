<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  
  import {
    isHorizontalVertical,
  } from "$lib/store/request-response-section";
  import type { RequestBody } from "$lib/utils/dto/requestbody";
  import { onDestroy, onMount } from "svelte";
  import { JSONEditor, Mode } from "svelte-jsoneditor";
  import { CodeEditor } from "petrel";
  import { RequestDataset, RequestDataType } from "$lib/utils/enums/request.enum";
  import type {
    KeyValuePair,
    KeyValuePairWithBase,
  } from "$lib/utils/interfaces/request.interface";
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";
  import KeyValueFile from "$lib/components/key-value/KeyValueFile.svelte";
    import { RequestBodyViewModel } from "./RequestBody.ViewModel";
    import type { TabDocument } from "$lib/database/app.database";
  
  const _viewModel = new RequestBodyViewModel();
  const tab = _viewModel.tab;

  let mainTab: string= "";
  let rawTab: string = "";
  let rawValue: string = "";
  let urlEncoded: KeyValuePair[] = [];
  let formDataText: KeyValuePair[] = [];
  let formDataFile: KeyValuePairWithBase[] = [];

  let content = {
    text: "",
    json: undefined,
  };

  const tabSubscribe = tab.subscribe((event: TabDocument)=>{
      rawValue = event?.get("property").request.body.raw;
      urlEncoded = event?.get("property").request.body.urlencoded;
      formDataText = event?.get("property").request.body.formdata.text;
      formDataFile = event?.get("property").request.body.formdata.file;
      content = {
          text: rawValue,
          json: undefined,
        };
        mainTab = event?.get("property").request.state.dataset;
        
        rawTab = event?.get("property").request.state.raw;
        
  });


  let handleDropdown = (tab: string) => {
    _viewModel.updateRequestState(tab, "dataset");
  };

  let handleRawDropDown = (tab: string) => {
    _viewModel.updateRequestState(tab, "raw");
  };

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  const handleChange = (updatedContent: RequestBody) => {
    _viewModel.updateRequestBody(updatedContent,"raw");
  };

  const handleRawChange = () => {
    _viewModel.updateRequestBody(rawValue,"raw");
  };

  const handleUrlEncodeChange = (pairs) => {
    _viewModel.updateRequestBody(pairs, "urlencoded");
  };
  const handleFormDataTextChange = (pairs) => {
    _viewModel.updateRequestBodyFormData(pairs, "text");
  };

  const handleFormDataFileChange = (pairs) => {
    _viewModel.updateRequestBodyFormData(pairs, "file");
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
