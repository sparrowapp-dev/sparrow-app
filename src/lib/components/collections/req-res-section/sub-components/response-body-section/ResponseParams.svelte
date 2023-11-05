<script>
  import ResponseBody from "./ResponseBody.svelte";
  import ResponseHeader from "./ResponseHeader.svelte";
  let selectedTab1 = "response";
  export let responseBody;
  export let responseHeader;
</script>

<div class="d-flex flex-column justify-content-between w-100">
  <div class="d-flex align-items-center justify-content-between">
    <div class="d-flex gap-4 text-requestBodyColor">
      <span
        style="font-size: 12px;font-weight:500"
        class="cursor-pointer d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
        ><span
          on:click={() => (selectedTab1 = "response")}
          class="team-menu__link d-flex pb-1"
          class:tab-active={selectedTab1 === "response"}
          >Response Body
        </span>
      </span>

      <span
        style="font-size: 12px;font-weight:500"
        class="cursor-pointer d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
        ><span
          on:click={() => (selectedTab1 = "resheader")}
          class="team-menu__link d-flex pb-1"
          class:tab-active={selectedTab1 === "resheader"}
          >Headers
          <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">(4)</p>
        </span>
      </span>
    </div>

    <div class="d-flex gap-3">
      <button
        class="cursor-pointer d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary1"
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

<div class="d-flex align-items-center justify-content-center w-100">
  {#if selectedTab1 === "response"}
    <ResponseBody responseBody= {responseBody} />
  {:else if selectedTab1 === "resheader"}
    <ResponseHeader responseHeader = {responseHeader} />
  {/if}
</div>

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
  .cursor-pointer {
    cursor: pointer;
  }
</style>
