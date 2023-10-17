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

  let selectedTab = "parameters";
</script>

<div class="d-flex align-items-start justify-content-between p-4">
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
          <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">(4)</p>
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
          <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">(4)</p>
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
          >Authorization <img src={penIcon} alt="penIcon" class="w-100 h-100" />
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
    <ResponseTab />
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
</style>
