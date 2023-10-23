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
  } from "$lib/store/requestSection";

  //this is for horizaontal and
  let isHorizontalVerticalMode;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  //this for active link tab
  let selectedTab = "requestbody";
  let selectedTab1 = "response";

  //this is for expand collaps condition
  let isCollaps;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });

  // let visible = true;
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
          to="requestbody"
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "requestbody")}
            class="team-menu__link d-flex pb-1"
            class:tab-active={selectedTab === "requestbody"}
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
        <Route path="/requestbody"><RequestBody /></Route>
        <Route path="/headers"><Headers /></Route>
        <Route path="/authorization"><Authorization /></Route>
      </div>
    </div>

    <div
      style="width:{isCollaps
        ? '50%'
        : '50%'};border-left:1px solid #313233;height:50vh"
      class={isCollaps ? "ps-3 pt-3 pe-3" : "pt-3 ps-2 pe-3"}
    >
      <div class="d-flex flex-column">
        <!-- this is for loading the response -->
        <!-- <Loader {visible} /> -->

        <!-- This code will be by defualt untill we don't request api -->
        <!-- <div
          class="d-flex text-requestBodyColor flex-column align-items-center justify-content-between py-3 ps-3"
        >
          <div
            class="d-flex align-items-center justify-content-center mb-4 mt-5"
          >
            <h4 style="font-weight: 500;">Click send to get a Response</h4>
          </div>
          <div
            style="font-family: Roboto Mono;font-size: 12px;font-weight: 400;line-height: 18px;letter-spacing: 0em;text-align: left;"
            class="d-flex flex-column"
          >
            <h5 style="font-weight: 700;text-align:center">Few shortcuts</h5>
            <div
              class="d-flex align-items-center text-left justify-content-between gap-5 mb-2 mt-2"
            >
              <p class="mb-0">Send Request</p>
              <button
                disabled
                class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
              >
                ctrl + Enter
              </button>
            </div>
            <div
              class="d-flex align-items-center justify-content-between gap-5 mb-2"
            >
              <p class="mb-0">Save Request</p>
              <button
                disabled
                class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
              >
                ctrl + S
              </button>
            </div>
            <div
              class="d-flex align-items-center justify-content-between gap-5 mb-2"
            >
              <p class="mb-0">New Request</p>
              <button
                disabled
                class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
              >
                ctrl + N
              </button>
            </div>
            <div
              class="d-flex align-items-center justify-content-between gap-5 mb-2"
            >
              <p class="mb-0">Edit link</p>
              <button
                disabled
                class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
              >
                alt + L
              </button>
            </div>
            <div
              class="d-flex align-items-center justify-content-between gap-5 mb-2"
            >
              <p class="mb-0">Add Parameter</p>
              <button
                disabled
                class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
              >
                alt + P
              </button>
            </div>
            <div
              class="d-flex align-items-center justify-content-between gap-5 mb-2"
            >
              <p class="mb-0">Add Header</p>
              <button
                disabled
                class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
              >
                alt + H
              </button>
            </div>
            <div
              class="d-flex align-items-center justify-content-between gap-5 mb-2"
            >
              <p class="mb-0">Edit Body</p>
              <button
                disabled
                class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
              >
                alt + B
              </button>
            </div>
          </div>
        </div> -->
        <!-- This code will be there when we do api request request api -->
        <div class="d-flex flex-column justify-content-between w-100">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex gap-4 text-requestBodyColor">
              <Link
                to="response"
                style="font-size: 12px;font-weight:500"
                class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
                ><span
                  on:click={() => (selectedTab1 = "response")}
                  class="team-menu__link d-flex pb-1"
                  class:tab-active={selectedTab1 === "response"}
                  >Response Body
                </span>
              </Link>

              <Link
                to="resheader"
                style="font-size: 12px;font-weight:500"
                class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
                ><span
                  on:click={() => (selectedTab1 = "resheader")}
                  class="team-menu__link d-flex pb-1"
                  class:tab-active={selectedTab1 === "resheader"}
                  >Headers
                  <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
                    (4)
                  </p>
                </span>
              </Link>
            </div>

            <div class="d-flex gap-3">
              <button
                class=" d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary1"
                style="font-size: 12px; font-weight:600"
              >
                <span>200</span>
                <p class="mb-0">OK</p>
              </button>
              <button
                class="d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary2"
                style="font-size: 12px;font-weight:600"
              >
                <span>300</span>
                <p class="mb-0">ms</p>
              </button>
              <button
                class="d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary3"
                style="font-size: 12px;font-weight:600"
              >
                <span>6.8</span>
                <p class="mb-0">KB</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-center">
        <Route path="/response"><ResponseBody /></Route>
        <Route path="/resheader"><ResponseHeader /></Route>
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
          : 'ps-1'} d-flex align-items-start justify-content-between text-requestBodyColor"
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
          to="requestbody"
          style="font-size: 12px;font-weight:500"
          class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
          ><span
            on:click={() => (selectedTab = "requestbody")}
            class="team-menu__link d-flex pb-1"
            class:tab-active={selectedTab === "requestbody"}
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
        <Route path="/requestbody"><RequestBody /></Route>
        <Route path="/headers"><Headers /></Route>
        <Route path="/authorization"><Authorization /></Route>
      </div>
    </div>
    <div>
      <div
        class="d-flex flex-column"
        style="width:{isCollaps
          ? '100%'
          : '100%'};border-top:2px solid #313233;"
      >
        <!-- this is default page for response page -->
        <!-- <div
          class="d-flex flex-column align-items-center justify-content-between py-3 ps-3"
        >
          <div>
            <h4 style="font-weight: 500;">Click send to get a Response</h4>
          </div>
          <div>
            <h5 style="font-weight: 700;">Few shortcuts</h5>
            <div />
          </div>
        </div> -->
        <div
          style="width:{isCollaps ? '100%' : '100%'};"
          class="d-flex align-items-center justify-content-between pt-2"
        >
          <div
            style="width:{isCollaps ? '50%' : '50%'};"
            class="d-flex align-items-center gap-4 text-requestBodyColor"
          >
            <Link
              to="response"
              style="font-size: 12px;font-weight:500"
              class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
              ><span
                on:click={() => (selectedTab1 = "response")}
                class="team-menu__link d-flex pb-1"
                class:tab-active={selectedTab1 === "response"}
                >Response Body
              </span>
            </Link>

            <Link
              to="resheader"
              style="font-size: 12px;font-weight:500"
              class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
              ><span
                on:click={() => (selectedTab1 = "resheader")}
                class="team-menu__link d-flex pb-1"
                class:tab-active={selectedTab1 === "resheader"}
                >Headers
                <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
                  (4)
                </p>
              </span>
            </Link>
          </div>
          <div class="d-flex gap-3">
            <button
              class="d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary1"
              style="font-size: 12px; font-weight:600"
            >
              <span>200</span>
              <p class="mb-0">OK</p>
            </button>
            <button
              class="d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary2"
              style="font-size: 12px;font-weight:600"
            >
              <span>300</span>
              <p class="mb-0">ms</p>
            </button>
            <button
              class="d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary3"
              style="font-size: 12px;font-weight:600"
            >
              <span>6.8</span>
              <p class="mb-0">KB</p>
            </button>
          </div>
        </div>
        <div class="d-flex align-items-center justify-content-center">
          <Route path="/response"><ResponseBody /></Route>
          <Route path="/resheader"><ResponseHeader /></Route>
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

  .btn-primary1 {
    background: var(--success-color);

    padding-top: 1px;
    padding-bottom: 1px;
  }

  .btn-primary2 {
    background: var(--button-color);
  }
  .btn-primary3 {
    background: var(--button-color);
  }
</style>
