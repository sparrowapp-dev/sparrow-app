<script lang="ts">
  import { enableBodyScroll, disableBodyScroll } from "body-scroll-lock";
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { currentTab, isHorizontalVertical, tabs, updateQueryParams, updateURL } from "$lib/store/request-response-section";
  import { sortable } from "svelte-agnostic-draggable";
    import { onDestroy } from "svelte";
    import type { QueryParams } from "$lib/utils/dto";
    import type { NewTab } from "$lib/utils/interfaces/request.interface";
    import { ItemType } from "$lib/utils/enums/item-type.enum";

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  let ListView
  function onSortableUpdate() {
    let newListElements = []
      let ItemViewList = ListView.children
      for (let i = 0, l = ItemViewList.length; i < l; i++) {
        let ListKey = ItemViewList[i].dataset.listKey
        if (ListKey != null) { newListElements.push(JSON.parse(ListKey) ) }
      }
    
    params=newListElements;
    updateURL(extractQueryParamstoURL(params), currentTabId); 
    updateQueryParams(params, currentTabId);
  }

  let isHovered: boolean = false;


  function toggleHover() {
    isHovered = !isHovered;
  }

  let currentTabId = null;
  let tabList = [];
  let params : QueryParams[] = []; 
 
  let url : string = "";
  const fetchComponentData = (id, list) => {
    list.forEach((elem:NewTab) => {
      if (elem.id === id && elem.type!==ItemType.WORKSPACE) {
        params = elem.request.queryParams;
        url = elem.request.url;
      }
    });
  };
  const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      currentTabId = value.id;
      fetchComponentData(currentTabId, tabList);
    }
  });
  const tabsUnsubscribe = tabs.subscribe((value) => {
    tabList = value;
    if (currentTabId && tabList) {
      fetchComponentData(currentTabId, tabList);
    }
  });

  const extractQueryParamstoURL = (params) => {
    let response="";
    let urlString : string = "";
    for(let i = 0; i < url.length; i++){
      if(url[i] === "?"){
        break;
      } 
      urlString += url[i];
    }
    let queryString : string = "";
    let count : number = 0;
    for (let param of params) {
      if (param.checked) {
        count++;
        queryString +=  `${param.name}=${param.description}&`;   
      }
    }
    if(count !== 0){
      queryString = queryString.slice(0, -1); 
    }
    response  += urlString;
    if(queryString!== ""){
      response += `?${queryString}`;
    }
    return response;
  }

  const updateParam = (index) => {
    
    params.forEach((elem, i)=>{
      if(i == index){
        elem.checked = true;
      }
    });
    params = params;
    if(params.length - 1 === index ){
      params.push({name : "", description : "", checked : false});
      params = params;
    }
    updateQueryParams(params, currentTabId);
      updateURL(extractQueryParamstoURL(params), currentTabId);  
  }

  const deleteParam = (index) => {
    if(params.length > 1){
      let filteredParam = params.filter((elem, i)=>{
        if(i != index){
          return true;
        }
        return false;
      });
      params = filteredParam;
    }
    updateQueryParams(params, currentTabId);
      updateURL(extractQueryParamstoURL(params), currentTabId);
  }
  const updateCheck = (index) =>{
    let filteredParam = params.map((elem, i)=>{
        if(i == index){
            elem.checked = !elem.checked;
        }
        return elem;
      });
      params = filteredParam;
      updateQueryParams(params, currentTabId);
      updateURL(extractQueryParamstoURL(params), currentTabId);
  }

  onDestroy(() => {
    currentTabUnsubscribe();
    tabsUnsubscribe();
  });
</script>

<div class="mt-3 me-0 w-100">
  <div class="d-flex gap-2">
    <div style="width:40px;"></div>
    <div
      class=" d-flex gap-2 text-requestBodyColor align-items-center"
      style="font-size: 12px; font-weight: 500; width:100%;"
    >
      <p class="flex-grow-1 w-100">Key</p>
      <p class="flex-grow-1 w-100">Value</p>
    </div>
    <div style="width:60px;"></div>
  </div>
  
  <div
    class="w-100"
    style="display:block; position:relative;
    width:200px;
    "
    bind:this={ListView}
  >
  {#each params as param  , index}
  <div
    aria-label="Toggle Hover"
    class="sortable > div"
    style="cursor:default; width: {isHorizontalVerticalMode ? '100%' : '100%'};"
    data-list-key={JSON.stringify({name : param.name, description : param.description, checked : param.checked})}
  >
    <div
      on:mouseenter={toggleHover}
      on:mouseleave={toggleHover}
      style="padding-top: 1px; background-color:backgroundColor;display: flex;flex-direction: column;width: {isHorizontalVerticalMode
        ? '100%'
        : '100%'};"
    >
      <div
        class="d-flex w-100 align-items-center justify-content-center gap-3 mb-2"
      >
        <img src={dragIcon} alt=""  class="d-none"
        style="cursor:grabbing;" />
        <div style="width:30px;">
          <input
            class="form-check-input"
            type="checkbox"
            on:mouseenter={toggleHover}
            on:mouseleave={toggleHover}
            bind:checked={param.checked}
            on:input={()=>{
              updateCheck(index)
            }}
          />
        </div>

        <div class="w-100 d-flex gap-2">
          <div class="flex-grow-1 w-100">
            <input
              on:mouseenter={toggleHover}
              on:mouseleave={toggleHover}
              type="text"
              placeholder="Enter Key"
              class="form-control bg-blackColor py-1 border-0"
              style="font-size: 13px;"
              bind:value={param.name}
  
              on:input={()=>{
                updateParam(index)
              }}
            
              />
          </div>
          <div class="flex-grow-1 w-100">
            <input
              on:mouseenter={toggleHover}
              on:mouseleave={toggleHover}
              type="text"
              placeholder="Enter Value"
              class="form-control bg-blackColor py-1 border-0"
              style="font-size: 13px;"
              bind:value={param.description}
              on:input={
              ()=>{
  
                updateParam(index)}
              }
            />
          </div>
        </div>
        {#if params.length - 1 != index}
        <div class="h-75 pe-1" >
          <button class="bg-backgroundColor border-0" style="width:40px;">
            <img src={trashIcon} on:click={()=>{
              deleteParam(index)
            }} alt="" />
          </button>
        </div>
        {:else}
        <div class="h-75 pe-1" >
          <button class="bg-backgroundColor border-0" style="width:40px;">
            <img src="" alt="" />
          </button>
        </div>
        {/if}
      </div>
    </div>
  </div>
    {/each}
  </div>
</div>

<style>
  .sortable > div {
    -webkit-touch-callout: none;
    -ms-touch-action: none;
    touch-action: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  div:global(.ui-sortable-placeholder) { height:30px }
</style>
