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
        >Parameters
        <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
          (4)
        </p></Link
      >

      <Link
        to="requesbody"
        style="font-size: 12px;font-weight:500"
        class="d-flex text-requestBodyColor text-decoration-none"
        >Request Body
      </Link>

      <Link
        to="headers"
        style="font-size: 12px;font-weight:500"
        class="d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
        >Headers
        <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
          (8)
        </p></Link
      >

      <Link
        to="authorization"
        style="font-size: 12px;font-weight:500"
        class="d-flex align-items-center justify-content-center gap-1 text-requestBodyColor text-decoration-none"
        >Authorization <img src={penIcon} alt="penIcon" class="w-100 h-100" />
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
</style>
