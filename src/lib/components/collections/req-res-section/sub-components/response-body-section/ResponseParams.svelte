<script lang="ts">
  import {
    RequestProperty,
    ResponseSection,
  } from "$lib/utils/enums/request.enum";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import ResponseBody from "./ResponseBody.svelte";
  import { v4 as uuidv4 } from "uuid";

  import ResponseHeader from "./ResponseHeader.svelte";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { notifications } from "$lib/utils/notifications";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";

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
      <button
        class="clear-button d-flex align-items-center justify-content-center rounded border-0 gap-1"
        style="font-size: 12px;font-weight:600"
        on:click={() => {
          const response = generateSampleRequest(
            UntrackedItems.UNTRACKED + uuidv4(),
            new Date().toString(),
          ).property.request.response;
          collectionsMethods.updateRequestProperty(
            response,
            RequestProperty.RESPONSE,
            currentTabId,
          );
          notifications.success("Response Cleared");
          MixpanelEvent(Events.CLEAR_API_RESPONSE);
        }}
      >
        Clear
      </button>
    </div>
  </div>
</div>

<div class="d-flex align-items-center justify-content-center w-100">
  {#if apiState.responseSection === ResponseSection.RESPONSE}
    <ResponseBody {apiState} {collectionsMethods} {response} {currentTabId} />
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

  .clear-button {
    background: var(--border-color);
    color: var(--workspace-hover-color);
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: center;
    padding: 4px 8px 4px 8px;
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
