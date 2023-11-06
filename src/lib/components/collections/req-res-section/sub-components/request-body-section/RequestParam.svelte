<script lang="ts">
  import penIcon from "$lib/assets/pen.svg";
  import Headers from "../request-header-section/Headers.svelte";
  import RequestBody from "../request-body-section/RequestBody.svelte";
  import Authorization from "../request-authorization-section/Authorization.svelte";

  import Parameters from "../request-parameter-section/Parameters.svelte";
  import Loader from "$lib/components/Transition/Loader.svelte";

  import {
    collapsibleState,
    currentTab,
    isHorizontalVertical,
    tabs,
  } from "$lib/store/request-response-section";
  import { responseText } from "$lib/store/api-request";
  import ResponseParams from "../response-body-section/ResponseParams.svelte";
  import DefaultPage from "../response-body-section/DefaultPage.svelte";

  import { onDestroy } from "svelte";

  let isHorizontalVerticalMode: boolean;
  const isHorizontalVerticalUnsubscribe = isHorizontalVertical.subscribe(
    (value) => {
      isHorizontalVerticalMode = value;
    },
  );

  let selectedTab: string = "parameters";

  let isCollaps: boolean;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });

  let jsonResponse: any = false;


  let currentTabId = null;
  let tabList = [];
  let progress : boolean = false;
  let responseBody;
  let responseHeader;

  const fetchBodyData = (id, list) => {
      list.forEach(elem => {
        if(elem.id === id){
          if(elem.request?.response){
            jsonResponse = true;
            responseBody = elem.request?.response?.body;
            responseHeader = Object.entries(JSON.parse(elem.request?.response?.headers));
          }
          else{
            jsonResponse = false;
          }
          progress = elem.requestInProgress;
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

  onDestroy(()=>{
    currentTabUnsubscribe();
    tabsUnsubscribe();
    isHorizontalVerticalUnsubscribe();
  });
</script>

<div
  class="d-flex align-items-start {isHorizontalVerticalMode
    ? 'flex-column'
    : 'flex-row'} justify-content-between w-100"
>
  <div
    class="right-panel d-flex flex-column align-items-top justify-content-center pt-3 ps-4 pe-2"
    style="width:{isHorizontalVerticalMode ? '100%' : '50%'};"
  >
    <div
      class="{isCollaps
        ? 'ps-2 pt-2 pe-5'
        : 'pt-1 ps-1 pe-5'} d-flex align-items-start text-requestBodyColor"
    >
      <span
        style="font-size: 12px;font-weight:500; margin-right:15px;"
        class="cursor-pointer d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
        ><span
          on:click={() => (selectedTab = "parameters")}
          class="team-menu__link d-flex pb-1"
          class:tab-active={selectedTab === "parameters"}
          >Parameters
          <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">(4)</p>
        </span>
      </span>

      <span
        style="font-size: 12px;font-weight:500; margin-right:15px;"
        class="cursor-pointer d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
        ><span
          on:click={() => (selectedTab = "request-body")}
          class="team-menu__link d-flex pb-1"
          class:tab-active={selectedTab === "request-body"}
          >Request Body
        </span>
      </span>

      <span
        style="font-size: 12px;font-weight:500; margin-right:15px;"
        class="cursor-pointer d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
        ><span
          on:click={() => (selectedTab = "headers")}
          class="team-menu__link d-flex pb-1"
          class:tab-active={selectedTab === "headers"}
          >Headers
          <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">(4)</p>
        </span>
      </span>

      <span
        style="font-size: 12px;font-weight:500; margin-right:15px;"
        class="cursor-pointer d-flex align-items-center justify-content-center gap-1 text-requestBodyColor text-decoration-none"
        ><span
          on:click={() => (selectedTab = "authorization")}
          class="team-menu__link d-flex pb-1 gap-1 align-items-center"
          class:tab-active={selectedTab === "authorization"}
          >Authorization <img src={penIcon} alt="penIcon" class="w-100 h-100" />
        </span>
      </span>
    </div>
    <div class="d-flex align-items-center justify-content-start">
      {#if selectedTab === "parameters"}
        <Parameters />
      {:else if selectedTab === "request-body"}
        <RequestBody />
      {:else if selectedTab === "headers"}
        <Headers />
      {:else if selectedTab === "authorization"}
        <Authorization />
      {/if}
    </div>
  </div>

  <div
    style="width:{isHorizontalVerticalMode
      ? '100%'
      : '50%'};border-left:1px solid #313233; height:calc(100vh - 200px);"
    class="left-panel pt-3 px-4 position-relative"
  >
    <div class=" d-flex flex-column" style="height:100%;">
      {#if jsonResponse}
        <ResponseParams responseBody = {responseBody} responseHeader={responseHeader} />
      {:else}
        <DefaultPage />
      {/if}
      {#if progress}
        <div class="position-absolute" style="    
          top: 10px;
          left: 0;
          right: 0;
          bottom: 0;
          z-index:999;">
          <Loader/>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .team-menu__link {
    color: #8a9299;
  }

  .tab-active {
    color: white;

    border-bottom: 3px solid #85c2ff;
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>
