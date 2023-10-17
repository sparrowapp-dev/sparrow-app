<script>
  import ResponseTab from "./response-body/ResponseTab.svelte";
  import penIcon from "$lib/assets/pen.svg";
  import Parameters from "./request-body/Parameters.svelte";
  import RequestBody from "./request-body/RequestBody.svelte";
  import Headers from "./request-body/Headers.svelte";
  import Authorization from "./request-body/Authorization.svelte";
  import { Router, Route, Link } from "svelte-navigator";
  import Navigate from "../../../../routing/Navigate.svelte";
  import Collections from "../Collections.svelte";
  import ResponseBodyAction from "./response-body/ResponseBodyAction.svelte";
  export let onclickState;
  let selectedTab = "parameters";
</script>


{#if onclickState}
  <div class="d-flex align-items-start justify-content-between p-4">
    <div class="d-flex flex-column align-items-top justify-content-center">
      <div
        style="width: 480px;"
        class=" d-flex pt-1 pe-5 ps-2 align-items-start justify-content-between text-requestBodyColor">
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
        <Route path="/requesbody"><RequestBody /></Route>
        <Route path="/headers"><Headers /></Route>
        <Route path="/authorization"><Authorization /></Route>
      </div>
    </div>
    <div>
      <div
        class="d-flex flex-column"
        style="width: 480px; height: 64vh;border-left:2px solid #313233;"
      >
        <div
          data-tauri-drag-region
          class="d-flex align-items-center justify-content-between ps-3"
          style="d-flex;align-items:center; justify-content:center;width:480px;height:28px;gap: 12px;"
        >
          <div class="d-flex gap-4 text-requestBodyColor">
            <a
              href="/responsebody"
              style="font-size: 12px;font-weight:500"
              class="d-flex text-requestBodyColor text-decoration-none"
              >Response Body
            </a>

            <a
              href="/headers"
              style="font-size: 12px;font-weight:500"
              class="d-flex text-requestBodyColor text-decoration-none"
              >Headers
              <p style="font-size: 13px;" class="mb-0 text-labelColor ps-1">
                (8)
              </p></a
            >
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
  <div class="d-flex flex-column align-items-start justify-content-between p-4">
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
