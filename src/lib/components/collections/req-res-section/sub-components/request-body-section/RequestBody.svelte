<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { bodyText, requestType } from "$lib/store/api-request";
  import { apiRequest, currentTab, isHorizontalVertical, tabs } from "$lib/store/request-response-section";
  import type { RequestBody } from "$lib/utils/dto/requestbody";
    import { onDestroy } from "svelte";
  import { JSONEditor } from "svelte-jsoneditor";

  let bodyData = "";
  let currentTabId = null;
  let tabList = []

  let content = {
    text: "",
    json: undefined,
  };
  
  const fetchBodyData = (id, list) => {
      list.forEach(elem => {
        if(elem.id === id){
          bodyData = elem.body;
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
    apiRequest.update(value => {
      if(value.length === 1) {
        let temp = value;
        temp[0].request = tab;
        return temp;
      }
    });
  };
  
  // apiRequest.subscribe(value => bodyData = value[0].body);

  

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  const handleChange = (updatedContent: RequestBody) => {
    tabs.update(value => {
        let temp = value.map((elem)=>{
          if(elem.id === currentTabId){
            elem.body = updatedContent.text;
            if(updatedContent.text !== ""){
              elem.save = false; 
            }
          } 
          return elem;
        });
        return temp;
    });
  };

  onDestroy(()=>{
    currentTabUnsubscribe();
    tabsUnsubscribe();
  });
</script>

<div
  class="ps-0 {isHorizontalVerticalMode ? 'pt-3' : 'pt-2'} pe-0 rounded w-100"
>
  <div class="mb-2">
    <Dropdown data={["Pretty"]} onclick={handleDropdown} />
    <span class="pe-3" />
    <Dropdown data={["JSON", "XML", "RAW"]} onclick={handleDropdown} />
  </div>
  <div
    style="height:{isHorizontalVerticalMode ? '200px' : '400px'}"
    class="my-json-editor --jse-contents-background-color me-0 editor jse-theme-dark my-json-editor mt-0"
  >
    <JSONEditor
      bind:content
      onChange={handleChange}
      mainMenuBar={false}
      navigationBar={false}
      mode="text"
    />
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
