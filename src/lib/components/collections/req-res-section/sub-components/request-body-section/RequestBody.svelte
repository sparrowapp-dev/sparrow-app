<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { bodyText, requestType } from "$lib/store/api-request";
  import { apiRequest, currentTab, isHorizontalVertical, tabs } from "$lib/store/request-response-section";
  import type { RequestBody } from "$lib/utils/dto/requestbody";
    import { onDestroy } from "svelte";
  import { JSONEditor, Mode } from "svelte-jsoneditor";
  import { CodeEditor } from 'petrel';

  let bodyData = "";
  let currentTabId = null;
  let mainTab = "None";
  let rawTab= "JSON";
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
        }
      });
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
    apiRequest.update(value => {
      if(value.length === 1) {
        let temp = value;
        temp[0].request = tab;
        return temp;
      }
    });
  };

  let handleRawDropDown = (tab: string) => { 
    rawTab = tab;
    apiRequest.update(value => { 
      if(value.length === 1) { 
        let temp = value;
        if(tab === "JSON") { 
          temp[0].request = "JSON";
        } else { 
          temp[0].request = "TEXT";
        }
        return temp;
      }
    })
  }
  
  // apiRequest.subscribe(value => bodyData = value[0].body);

  

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  const handleChange = (updatedContent: RequestBody) => {
    tabs.update(value => {
        let temp = value.map((elem)=>{
          if(elem.id === currentTabId){
            elem.request.body = updatedContent.text;
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
          elem.request.body = item;
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
    <Dropdown data={["None", "Raw", "Form data", "Encoded URL"]} onclick={handleDropdown} />
    <span class="pe-3" />
    {#if mainTab === "Raw"}
    <Dropdown data={["JSON", "XML", "HTML", "Text"]} onclick={handleRawDropDown} />
    {/if}
    
  </div>
  <div
    style="height:{isHorizontalVerticalMode ? '200px' : '400px'}"
    class="my-json-editor --jse-contents-background-color me-0 editor jse-theme-dark my-json-editor mt-0"
  > 
  {#if mainTab === "Raw" && rawTab === "JSON"}
  <JSONEditor
    bind:content
    onChange={handleChange}
    mainMenuBar={false}
    navigationBar={false}
    mode={Mode.text}
  />
  {:else if mainTab === "Raw" && (rawTab === "HTML" || rawTab === "XML")}
  <div id="code-editor" style="min-height: 600px; width: 100%">
    <textarea style="color: aliceblue; min-height: 400px; width: 100%; background-color: #000000" oninput={handleRawChange} bind:value={rawValue}></textarea>
  </div>
  {:else if mainTab === "None"}
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
