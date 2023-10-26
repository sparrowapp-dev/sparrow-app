<script>
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

  //this is for horizaontal and
  let isHorizontalVerticalMode;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  //this for active link tab
  let selectedTab = "";
  let selectedTab1 = "response";

  //this is for expand collaps condition
  let isCollaps;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });

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
</script>

{#if isHorizontalVerticalMode}
  <div class="d-flex align-items-start justify-content-between w-100">
    <div
      class="d-flex flex-column align-items-top justify-content-center {isCollaps
        ? 'ps-5 pt-3 pe-1'
        : 'pt-3 ps-4 pe-2'}"
      style="width:{isCollaps ? '50%' : '50%'};"
    >
      <div
        class="{isCollaps
          ? 'ps-2 pt-2 pe-5'
          : 'pt-1 ps-1 pe-5'} d-flex align-items-start justify-content-between text-requestBodyColor"
      >
        <Link
          to="parameters"
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "parameters")}
            class="team-menu__link d-flex pb-1"
            class:tab-active={selectedTab === "parameters"}
            >Parameters
            <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
              (4)
            </p>
          </span>
        </Link>

        <Link
          to=""
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "")}
            class="team-menu__link d-flex pb-1"
            class:tab-active={selectedTab === ""}
            >Request Body
          </span>
        </Link>

        <Link
          to="headers"
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "headers")}
            class="team-menu__link d-flex pb-1"
            class:tab-active={selectedTab === "headers"}
            >Headers
            <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
              (4)
            </p>
          </span>
        </Link>

        <Link
          to="authorization"
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center gap-1 text-requestBodyColor text-decoration-none"
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
        </Link>
      </div>
      <div class="d-flex align-items-center justify-content-start">
        <Route path="/parameters"><Parameters /></Route>
        <Route path="/"><RequestBody /></Route>
        <Route path="/headers"><Headers /></Route>
        <Route path="/authorization"><Authorization /></Route>
      </div>
    </div>

    <div
      style="width:{isCollaps
        ? '50%'
        : '50%'};border-left:1px solid #313233;height:100vh"
      class={isCollaps ? "ps-3 pt-3 pe-3" : "pt-3 ps-2 pe-3"}
    >
      <div class="d-flex flex-column">
        <!-- {#if !jsonText.response && !showResponse}
          <Loader /> -->
        {#if jsonText.response}
          <ResponseParams />
        {:else}
          <DefaultPage />
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div
    class="d-flex flex-column align-items-start justify-content-between {isCollaps
      ? 'pt-3 ps-5'
      : 'pt-3 ps-3'}"
    style="width:{isCollaps ? '100%' : '100%'};"
  >
    <div
      class="d-flex flex-column align-items-top justify-content-center"
      style="width:{isCollaps ? '100%' : '100%'};"
    >
      <div
        style="width:{isCollaps ? '50%' : '50%'};"
        class="{isCollaps
          ? ' ps-2 pe-5'
          : 'ps-1'} d-flex mb-3 align-items-start justify-content-between text-requestBodyColor"
      >
        <Link
          to="parameters"
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "parameters")}
            class="team-menu__link d-flex pb-1"
            class:tab-active={selectedTab === "parameters"}
            >Parameters
            <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
              (4)
            </p>
          </span>
        </Link>

        <Link
          to=""
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "")}
            class="team-menu__link d-flex pb-1"
            class:tab-active={selectedTab === ""}
            >Request Body
          </span>
        </Link>

        <Link
          to="headers"
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "headers")}
            class="team-menu__link d-flex pb-1"
            class:tab-active={selectedTab === "headers"}
            >Headers
            <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
              (4)
            </p>
          </span>
        </Link>

        <Link
          to="authorization"
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center gap-1 text-requestBodyColor text-decoration-none"
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
        </Link>
      </div>
      <div class="d-flex align-items-center justify-content-start w-100">
        <Route path="/parameters"><Parameters /></Route>
        <Route path="/"><RequestBody /></Route>
        <Route path="/headers"><Headers /></Route>
        <Route path="/authorization"><Authorization /></Route>
      </div>
    </div>
    <div style="width:{isCollaps ? '100%' : '100%'}">
      <div
        class="d-flex flex-column mt-2 pe-0 ps-0"
        style="width:{isCollaps
          ? '100%'
          : '100%'};border-top:2px solid #313233;"
      >
        <div class="d-flex flex-column mt-2 pe-2 ps-0">
          {#if jsonText.response}
            <ResponseParams />
          {:else}
            <DefaultPage />
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .team-menu__link {
    color: #8a9299;
  }

  .tab-active {
    color: white;

    border-bottom: 3px solid #85c2ff;
  }
</style>
