<script lang="ts">
  import { ResponseSection } from "$lib/utils/enums/request.enum";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import ResponseBody from "./ResponseBody.svelte";

  import ResponseHeader from "./ResponseHeader.svelte";

  export let response;
  export let apiState;
  export let collectionsMethods: CollectionsMethods;

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

    <div class="d-flex gap-2">
      <button
        class="cursor-pointer ps-1 pe-1 border-0 rounded d-flex align-items-center justify-content-center text-backgroundColor gap-1 status-primary1"
        style="font-size: 12px; font-weight:600"
      >
        <span>{statusCode}</span>
      </button>
      <button
        class="d-flex align-items-center ps-1 pe-1 border-0 justify-content-center rounded text-backgroundColor gap-1 time-primary1"
        style="font-size: 12px;font-weight:600"
      >
        <span>{timeTaken}</span>
        <p class="mb-0">ms</p>
      </button>
      <button
        class="d-flex align-items-center ps-1 pe-1 justify-content-center rounded border-0 text-backgroundColor gap-1 size-primary1"
        style="font-size: 12px;font-weight:600"
      >
        <span>{sizeinKb?.toFixed(2)}</span>
        <p class="mb-0">KB</p>
      </button>
    </div>
  </div>
</div>

<div class="d-flex align-items-center justify-content-center w-100">
  {#if apiState.responseSection === ResponseSection.RESPONSE}
    <ResponseBody {apiState} {collectionsMethods} {response} />
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
    border-bottom: 3px solid #85c2ff;
  }

  .status-primary1 {
    background: var(--success-color);
    padding-top: 1px;
    padding-bottom: 1px;
  }

  .time-primary1 {
    background: var(--button-color);
  }
  .size-primary1 {
    background: var(--button-color);
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>
