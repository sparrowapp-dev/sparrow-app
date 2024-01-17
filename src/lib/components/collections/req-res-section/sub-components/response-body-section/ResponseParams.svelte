<script lang="ts">
  import { ResponseSection } from "$lib/utils/enums/request.enum";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import ResponseBody from "./ResponseBody.svelte";

  import ResponseHeader from "./ResponseHeader.svelte";

  export let response;
  export let apiState;
  export let collectionsMethods: CollectionsMethods;
  export let currentTabId;

  let responseBody;
  let responseHeader;
  let statusCode: string;
  let timeTaken: number;
  let sizeinKb: number;

  $: {
    if (response) {
      statusCode = response?.status;
      timeTaken = response?.time;
      sizeinKb = response?.size;
      responseBody = response?.body;
      responseHeader = Object.entries(JSON.parse(response?.headers || "{}"));
    }
  }
</script>

<div class="d-flex flex-column gap-2 justify-content-center w-100">
  <div class="d-flex align-items-center justify-content-between">
    <div class="d-flex gap-3 text-requestBodyColor">
      <span
        style="font-size: 12px;font-weight:500"
        class="cursor-pointer d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
        ><span
          on:click={() => {
            collectionsMethods.updateRequestState(
              ResponseSection.RESPONSE,
              "responseSection",
            );
          }}
          class="team-menu__link d-flex pb-1"
          class:tab-active={apiState.responseSection ===
            ResponseSection.RESPONSE}
          >Response
        </span>
      </span>

      <span
        style="font-size: 12px;font-weight:500"
        class="cursor-pointer d-flex align-items-center justify-content-center text-requestBodyColor text-decoration-none"
        ><span
          on:click={() => {
            collectionsMethods.updateRequestState(
              ResponseSection.HEADERS,
              "responseSection",
            );
          }}
          class="team-menu__link d-flex pb-1"
          class:tab-active={apiState.responseSection ===
            ResponseSection.HEADERS}
          >Headers
          <p style="font-size: 12px;" class="mb-0 text-labelColor ps-1">
            ({responseHeader.length})
          </p>
        </span>
      </span>
    </div>
  </div>
</div>

<div class="d-flex align-items-center justify-content-center w-100">
  {#if apiState.responseSection === ResponseSection.RESPONSE}
    <ResponseBody
      {apiState}
      {collectionsMethods}
      {response}
      {currentTabId}
      {sizeinKb}
      {timeTaken}
      {statusCode}
    />
  {:else if apiState.responseSection === ResponseSection.HEADERS}
    <ResponseHeader {responseHeader} />
  {/if}
</div>

<style>
  .team-menu__link {
    color: #8a9299;
  }

  .tab-active {
    color: white;
    border-bottom: 3px solid var(--send-button);
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
