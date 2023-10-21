<script>
  import penIcon from "$lib/assets/pen.svg";

  import Headers from "../request-header-section/Headers.svelte";
  import RequestBody from "../request-body-section/RequestBody.svelte";
  import Authorization from "../request-authorization-section/Authorization.svelte";
  import ResponseBodyAction from "../response-body-section/ResponseBodyAction.svelte";
  import { Router, Route, Link } from "svelte-navigator";
  import Parameters from "../request-parameter-section/Parameters.svelte";
  import Loader from "$lib/components/Transition/Loader.svelte";
  import ResponseBody from "../response-body-section/ResponseBody.svelte";
  import ResponseHeader from "../response-body-section/ResponseHeader.svelte";

  export let onclickState;
  let selectedTab = "parameters";

  let visible = true;
</script>

{#if onclickState}
  <div
    class="d-flex align-items-start justify-content-between p-4"
    style="width:calc(100%-280px);"
  >
    <div class="d-flex flex-column align-items-top justify-content-center">
      <div
        style="width: 480px;"
        class=" d-flex pt-1 pe-5 ps-2 align-items-start justify-content-between text-requestBodyColor"
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
        style="width: 480px; height: 64vh;border-left:1px solid #313233;"
      >
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
        <div
          data-tauri-drag-region
          class="d-flex align-items-center justify-content-between ps-3"
          style="d-flex;align-items:center; justify-content:center;width:480px;height:28px;gap: 12px;"
        >
          <div class="d-flex gap-4 text-requestBodyColor">
            <Link
              to="response"
              style="font-size: 12px;font-weight:500"
              class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
              ><span
                on:click={() => (selectedTab = "response")}
                class="team-menu__link d-flex pb-1"
                class:tab-active={selectedTab === "response"}
                >Response Body
              </span>
            </Link>

            <Link
              to="headers/response"
              style="font-size: 12px;font-weight:500"
              class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
              ><span
                on:click={() => (selectedTab = "headers/response")}
                class="team-menu__link d-flex pb-1"
                class:tab-active={selectedTab === "headers/response"}
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
        <ResponseBodyAction />
      </div>
    </div>
  </div>
{:else}
  <div
    class="d-flex flex-column align-items-start justify-content-between p-4"
    style="width:calc(100%-280px);"
  >
    <div class="d-flex flex-column align-items-top justify-content-center">
      <div
        style="width: 480px;"
        class=" d-flex pt-1 pe-5 ps-2 align-items-start justify-content-between text-requestBodyColor"
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
        <Route path="/response"><RequestBody /></Route>
        <Route path="/headers"><Headers /></Route>
        <Route path="/authorization"><Authorization /></Route>
      </div>
    </div>
    <div>
      <div
        class="d-flex flex-column"
        style="width: 100%; height: 64vh;border-top:2px solid #313233;"
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
          data-tauri-drag-region
          class="d-flex align-items-center justify-content-between pt-4"
          style="d-flex;align-items:center; justify-content:center;width:970px;height:28px;gap: 12px;"
        >
          <div class="d-flex gap-4 text-requestBodyColor">
            <Link
              to="response"
              style="font-size: 12px;font-weight:500"
              class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
              ><span
                on:click={() => (selectedTab = "response")}
                class="team-menu__link d-flex pb-1"
                class:tab-active={selectedTab === "response"}
                >Response Body
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
            <div>
              <Route path="/response"><ResponseBody /></Route>
              <Route path="/headers/response"><ResponseHeader /></Route>
            </div>
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
        <ResponseBodyAction />
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
  }

  .btn-primary2 {
    background: var(--button-color);
  }
  .btn-primary3 {
    background: var(--button-color);
  }
</style>
