<script lang="ts">
  import { enableBodyScroll, disableBodyScroll } from "body-scroll-lock";
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { currentTab, isHorizontalVertical, tabs, updateQueryParams, updateURL } from "$lib/store/request-response-section";
  import { sortable } from "svelte-agnostic-draggable";
    import { onDestroy } from "svelte";
    import type { QueryParams } from "$lib/utils/dto";

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  function onSortableInit() {}

  function onSortableActivate() {
    disableBodyScroll(document.body);
  }

  function onSortStart() {}

  function onSortMove() {}

  function onSortStop() {}

  function onSortableOver() {}

  function onSortableChange() {}

  function onSortableRemove() {}

  function onSortableReceive() {}

  function onSortableUpdate() {}

  function onSortableOut() {}

  function onSortableDeactivate() {
    enableBodyScroll(document.body);
  }

  function onSortableDestroy() {}

  let isHovered: boolean = false;
  let rows = [{ key: "", value: "" }];

  function toggleHover() {
    isHovered = !isHovered;
  }

  let currentTabId = null;
  let tabList = [];
  let params : QueryParams[] = []; 
  let url : string = "";
  const fetchComponentData = (id, list) => {
    list.forEach((elem) => {
      if (elem.id === id) {
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

  $: {
    if (params) {
      // updateQueryParams(params, currentTabId);
      // updateURL(extractQueryParamstoURL(params), currentTabId);
    }
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

<div class="d-flex flex-column mt-3 me-0 w-100">
  <div
    class="d-flex text-requestBodyColor align-items-center justify-content-between"
    style="font-size: 12px; font-weight: 500; width:{isHorizontalVerticalMode
      ? '50%'
      : '50%'}"
  >
    <p class="ps-5 ms-4">Key</p>
    <p style="margin-left: 130px;">Value</p>
  </div>

  <div
    class="w-100 sortable"
    use:sortable={{
      cursor: "grabbing",
    }}
    style="margin-bottom: 1px;
    "
    on:sortable:init={onSortableInit}
    on:sortable:destroy={onSortableActivate}
    on:sortable:activate={onSortableActivate}
    on:sortable:deactivate={onSortableDeactivate}
    on:sort:start={onSortStart}
    on:sort:move={onSortMove}
    on:sort:stop={onSortStop}
    on:sortable:over={onSortableOver}
    on:sortable:out={onSortableOut}
    on:sortable:change={onSortableChange}
    on:sortable:update={onSortableUpdate}
    on:sortable:remove={onSortableRemove}
    on:sortable:receive={onSortableReceive}
  >
    {#each params as param, index}
      <div
        role="button"
        aria-label="Toggle Hover"
        class="sortable > div"
        style="width: {isHorizontalVerticalMode ? '100%' : '100%'};"
      >
        <div
          on:mouseenter={toggleHover}
          on:mouseleave={toggleHover}
          style="padding-top: 1px;cursor: grab;background-color:backgroundColor;display: flex;flex-direction: column;width: {isHorizontalVerticalMode
            ? '100%'
            : '100%'};"
        >
          <div
            class="d-flex {isHorizontalVerticalMode
              ? 'w-100'
              : 'w-100'} align-items-center justify-content-center gap-3 mb-2"
          >
            <img src={dragIcon} alt="" style="cursor:grabbing;" />
            <div>
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
            <div class="w-75 h-75 pe-1">
              <button class="bg-backgroundColor border-0">
                <img src={trashIcon} on:click={()=>{
                  deleteParam(index)
                }} alt="" />
              </button>
            </div>
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
</style>
