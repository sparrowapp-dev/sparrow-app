<script lang="ts">
  import penIcon from "$lib/assets/pen.svg";
  import Headers from "../request-header-section/Headers.svelte";
  import RequestBody from "../request-body-section/RequestBody.svelte";
  import Authorization from "../request-authorization-section/Authorization.svelte";
  import { Route, Link } from "svelte-navigator";
  import Parameters from "../request-parameter-section/Parameters.svelte";
  // import Loader from "$lib/components/Transition/Loader.svelte";
  import ResponseBody from "../response-body-section/ResponseBody.svelte";
  import ResponseHeader from "../response-body-section/ResponseHeader.svelte";

  import {
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/request-response-section";
  import { responseText } from "$lib/store/api-request";
  import ResponseParams from "../response-body-section/ResponseParams.svelte";
  import DefaultPage from "../response-body-section/DefaultPage.svelte";
  import Loader from "$lib/components/Transition/Loader.svelte";
    import { onDestroy } from "svelte";

  //this is for horizaontal and
  let isHorizontalVerticalMode;
  const isHorizontalVerticalUnsubscribe = isHorizontalVertical.subscribe(
    (value) => {
      isHorizontalVerticalMode = value
      console.log(value);
    }
  );

  //this for active link tab
  let selectedTab : string = "parameters";
  
  //this is for expand collaps condition
  let isCollaps;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });

  let visible = true;

  let jsonText;
  let showResponse = false;
  responseText.subscribe((value) => {
    jsonText = value;
    // console.log(jsonText.response);
    if (jsonText.response)
      setTimeout(() => {
        showResponse = true;
      }, 2000);
  });

  onDestroy(isHorizontalVerticalUnsubscribe);
</script>

  <div class="d-flex align-items-start {isHorizontalVerticalMode ? 'flex-column' : 'flex-row'} justify-content-between w-100">
    <div
      class="right-panel d-flex flex-column align-items-top justify-content-center pt-3 px-4"
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
            <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
              (4)
            </p>
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
            <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
              (4)
            </p>
          </span>
        </span>

        <span
          style="font-size: 12px;font-weight:500; margin-right:15px;"
          class="cursor-pointer d-flex align-items-center justify-content-center gap-1 text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "authorization")}
            class="team-menu__link d-flex pb-1 gap-1 align-items-center"
            class:tab-active={selectedTab === "authorization"}
            >Authorization <img
              src={penIcon}
              alt="penIcon"
              class="w-100 h-100"
            />
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
        : '50%'};border-left:1px solid #313233;height:100vh"
      class='left-panel pt-3 px-4'
    >
      <div class="d-flex flex-column">
        {#if jsonText.response && !showResponse}
          <Loader {visible} />
        {:else if showResponse}
          <ResponseParams />
        {:else}
          <DefaultPage />
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
  .cursor-pointer{
    cursor:pointer;
  }
</style>
