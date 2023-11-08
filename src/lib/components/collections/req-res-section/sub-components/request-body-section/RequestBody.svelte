<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { bodyText, requestType } from "$lib/store/api-request";
  import { apiRequest, currentTab, handleRequestDatasetTabChange, handleRequestTypeTabChange, isHorizontalVertical, tabs } from "$lib/store/request-response-section";
  import type { RequestBody } from "$lib/utils/dto/requestbody";
    import { onDestroy } from "svelte";
  import { JSONEditor, Mode } from "svelte-jsoneditor";
  import { CodeEditor } from 'petrel';
    import { RequestDataset, RequestType } from "$lib/utils/enums/request.enum";

  let bodyData = "";
  let currentTabId = null;
  let mainTab : string;
  let rawTab : string;
  let tabList = []
  let rawValue = "";

  let content = {
    text: "",
    json: undefined,
  };
  
  const fetchBodyData = (id, list) => {
      list.forEach(elem => {
        if(elem.id === id){
          bodyData = elem.request.body;
          content = {
            text: bodyData,
            json: undefined
          };
          let {raw, dataset} = elem.request.additions;
          mainTab = dataset;
          rawTab = raw;
        }
      });
      console.log(mainTab, rawTab);
  }

  const tabsUnsubscribe = tabs.subscribe((value)=>{
    tabList = value;
    if(currentTabId && tabList){
      fetchBodyData(currentTabId, tabList);
    }
  });
  
  const currentTabUnsubscribe = currentTab.subscribe((value)=>{
    if(value && value.id){
      currentTabId = value.id;
      if(currentTabId && tabList){
        fetchBodyData(currentTabId, tabList);
      }
    }
  });



  let handleDropdown = (tab: string) => {
    mainTab = tab;
    handleRequestDatasetTabChange(mainTab, currentTabId);
  };

  let handleRawDropDown = (tab: string) => { 
    rawTab = tab;
    handleRequestTypeTabChange(rawTab, currentTabId)
  }
  

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  const handleChange = (updatedContent: RequestBody) => {
    tabs.update(value => {
        let temp = value.map((elem)=>{
          if(elem.id === currentTabId){
            elem.request.body.raw = updatedContent.text;
            if(updatedContent.text !== ""){
              elem.save = false; 
            }
          } 
          return elem;
        });
        return temp;
    });
  };

  const handleRawChange = (item: string) => { 
    tabs.update(value => { 
      let temp = value.map((elem) => { 
        if(elem.id === currentTabId) { 
          elem.request.body.raw = item;
          if(item !== "") { 
            elem.save = false;
          }
        }
        return elem;
      })
      return temp;
    })
  }

  const codeEditor = new CodeEditor(document.getElementById("code-editor"))
    codeEditor.create();
  onDestroy(()=>{
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
    <Dropdown title={mainTab} data={[RequestDataset.NONE, RequestDataset.RAW, RequestDataset.FORMDATA, RequestDataset.URLENCODED]} onclick={handleDropdown} />
    <span class="pe-3" />
    {#if mainTab === RequestDataset.RAW}
    <Dropdown title={rawTab} data={[RequestType.HTML, RequestType.JSON, RequestType.JavaScript, RequestType.Text, RequestType.XML]} onclick={handleRawDropDown} />
    {/if}
    
  </div>
  <div
    style="height:{isHorizontalVerticalMode ? '200px' : '400px'}"
    class="my-json-editor --jse-contents-background-color me-0 editor jse-theme-dark my-json-editor mt-0"
  > 
  {#if mainTab === RequestDataset.RAW && rawTab === RequestType.JSON}
  <JSONEditor
    bind:content
    onChange={handleChange}
    mainMenuBar={false}
    navigationBar={false}
    mode={Mode.text}
  />
  {:else if mainTab === RequestDataset.RAW && (rawTab === RequestType.HTML || rawTab === RequestType.XML)}
  <div id="code-editor" style="min-height: 600px; width: 100%">
    <textarea style="color: aliceblue; min-height: 400px; width: 100%; background-color: #000000" on:input= {handleRawChange} bind:value={rawValue}></textarea>
  </div>
  {:else if mainTab === RequestDataset.NONE}
  <p class="team-menu__link pb-1" style="font-size: 12px; margin-top:4px;">
    No Data type is selected. Check your API provider’s documentation to see if you need to send body.
  </p>
  {/if}
    
  </div>
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
