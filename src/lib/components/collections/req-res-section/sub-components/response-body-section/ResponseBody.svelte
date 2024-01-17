<script lang="ts">
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import copyToClipBoard from "$lib/utils/copyToClipboard";
  import { notifications } from "$lib/utils/notifications";
  import {
    RequestDataType,
    ResponseFormatter,
  } from "$lib/utils/enums/request.enum";
  import MonacoEditorResponse from "$lib/components/monaco-editor/MonacoEditorResponse.svelte";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { v4 as uuidv4 } from "uuid";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { RequestProperty } from "$lib/utils/enums/request.enum";
  import StatusSuccess from "$lib/assets/status-success.svelte";
  import StatusError from "$lib/assets/status-error.svelte";

  export let response;
  export let apiState;
  export let collectionsMethods: CollectionsMethods;
  export let currentTabId;
  export let sizeinKb;
  export let timeTaken;
  export let statusCode;

  let fileExtension: string;
  /**
   * @description Copy API response to users clipboard.
   */
  const handleCopy = async () => {
    const jsonString = response?.body;
    await copyToClipBoard(jsonString);
    notifications.success("Copied to Clipboard");
    MixpanelEvent(Events.COPY_API_RESPONSE);
  };

  const handleTypeDropdown: (tab: string) => void = (tab) => {
    collectionsMethods.updateRequestState(tab, "responseRaw");
  };

  $: {
    if (apiState) {
      if (apiState.responseRaw === RequestDataType.JSON) {
        fileExtension = "json";
      } else if (apiState.responseRaw === RequestDataType.XML) {
        fileExtension = "xml";
      } else if (apiState.responseRaw === RequestDataType.HTML) {
        fileExtension = "html";
      } else if (apiState.responseRaw === RequestDataType.TEXT) {
        fileExtension = "txt";
      } else if (apiState.responseRaw === RequestDataType.JAVASCRIPT) {
        fileExtension = "js";
      }
    }
  }

  /**
   * @description Configures and populates the save-as popup on the user's screen.
   */
  const handleDownloaded = async () => {
    const newHandle = await window.showSaveFilePicker({
      suggestedName: `api_response_${
        response?.status ? response?.status : ""
      }_${response?.time ? response?.time : "0"}ms_${
        response?.size ? response?.size : "0"
      }kb.${fileExtension}`,
      accept: {
        extensions: ["txt", "json", "xml", "js", "html"],
      },
    });
    const writableStream = await newHandle.createWritable();
    // write our file
    await writableStream.write(response?.body);
    await writableStream.close();
    notifications.success("Response downloaded");
    MixpanelEvent(Events.DOWNLOAD_API_RESPONSE);
  };
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between mt-2 w-100"
>
  <div
    class="response-container d-flex align-items-center justify-content-between mb-2 w-100"
  >
    <div class="d-flex gap-4 align-items-center justify-content-center">
      <div class="bg-dullBackground rounded" style="height: 22px;">
        <button
          on:click={() => {
            collectionsMethods.updateRequestState(
              ResponseFormatter.PRETTY,
              "responseFormatter",
            );
          }}
          class="rounded btn-formatter {apiState.responseFormatter ===
          ResponseFormatter.PRETTY
            ? 'bg-labelColor text-blackColor'
            : ''}"
        >
          Pretty
        </button>
        <button
          on:click={() => {
            collectionsMethods.updateRequestState(
              ResponseFormatter.RAW,
              "responseFormatter",
            );
          }}
          class="rounded btn-formatter {apiState.responseFormatter ===
          ResponseFormatter.RAW
            ? 'bg-labelColor text-blackColor'
            : ''}">Raw</button
        >
      </div>
      {#if apiState.responseFormatter === ResponseFormatter.PRETTY}
        <button
          class="d-flex align-items-center justify-content-center gap-2 bg-backgroundColor border-0"
        >
          <Dropdown
            dropdownId={"hash565"}
            title={apiState.responseRaw}
            data={[
              {
                name: "JSON",
                id: RequestDataType.JSON,
              },
              {
                name: "XML",
                id: RequestDataType.XML,
              },
              {
                name: "HTML",
                id: RequestDataType.HTML,
              },
              {
                name: "Javascript",
                id: RequestDataType.JAVASCRIPT,
              },
              {
                name: "Text",
                id: RequestDataType.TEXT,
              },
            ]}
            onclick={handleTypeDropdown}
          />
        </button>
      {/if}
    </div>
    <div class="d-flex align-items-center gap-2">
      <!-- insert controller here -->
      <div class="d-flex gap-2">
        <button
          class="statuscode position-relative cursor-pointer ps-1 pe-1 border-0 rounded d-flex align-items-center justify-content-center text-backgroundColor gap-1 {statusCode ===
          '200 OK'
            ? 'status-primary1'
            : 'status-danger'} "
          style="font-size: 10px;"
        >
          {#if statusCode?.length > 12}
            <div class="position-absolute tooltip-statuscode">
              <span class="ellipsis">
                <span class="me-1">
                  {#if statusCode === "200 OK"}
                    <StatusSuccess
                      height={8}
                      width={8}
                      backgroundColor={"var(--success-color)"}
                      textColor={"var(--background-color)"}
                    />
                  {:else}
                    <StatusError
                      height={8}
                      width={8}
                      backgroundColor={"var(--request-delete)"}
                      textColor={"var(--background-color)"}
                    />
                  {/if}
                </span>
                {statusCode}</span
              >
            </div>
          {/if}
          <span class="ellipsis">
            <span class="me-1">
              {#if statusCode === "200 OK"}
                <StatusSuccess
                  height={8}
                  width={8}
                  backgroundColor={"var(--success-color)"}
                  textColor={"var(--background-color)"}
                />
              {:else}
                <StatusError
                  height={8}
                  width={8}
                  backgroundColor={"var(--request-delete)"}
                  textColor={"var(--background-color)"}
                />
              {/if}
            </span>
            {statusCode}</span
          >
        </button>
        <button
          class="d-flex align-items-center ps-1 pe-1 border-0 justify-content-center rounded text-backgroundColor gap-1 time-primary1"
          style="font-size: 10px;"
        >
          <span>{timeTaken}</span>
          <p class="mb-0">ms</p>
        </button>
        <button
          class="d-flex align-items-center ps-1 pe-1 justify-content-center rounded border-0 text-backgroundColor gap-1 size-primary1"
          style="font-size: 10px;"
        >
          <span>{sizeinKb?.toFixed(2)}</span>
          <p class="mb-0">KB</p>
        </button>
        <button
          class="clear-button d-flex align-items-center justify-content-center rounded border-0 gap-1"
          style="font-size: 10px;"
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
      <button on:click={handleDownloaded} class=" bg-backgroundColor border-0">
        <img src={downloadIcon} alt="" />
      </button>

      <button class=" bg-backgroundColor border-0" on:click={handleCopy}>
        <img src={copyIcon} alt="" />
      </button>
    </div>
  </div>
  <div class="w-100 mt-3 backgroundColor">
    <MonacoEditorResponse
      rawTab={apiState.responseRaw}
      rawValue={response.body}
      formatter={apiState.responseFormatter}
      {currentTabId}
    />
  </div>
</div>

<style>
  .response-container {
    flex-wrap: wrap;
  }
  .btn-formatter {
    outline: none;
    background-color: transparent;
    border: none;
    font-size: 12px;
    padding: 2px 4px;
    width: 46px;
    height: 22px;
    transform: translateY(-3px);
  }

  .status-primary1 {
    color: var(--success-color) !important;
    background-color: transparent;
    padding-top: 1px;
    padding-bottom: 1px;
    max-width: 100px;
  }
  .status-danger {
    color: var(--request-delete) !important;
    background-color: transparent;
    padding-top: 1px;
    padding-bottom: 1px;
    max-width: 100px;
  }
  .status-danger:hover,
  .status-primary1:hover {
    background-color: var(--background-light) !important;
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
    color: var(--send-button) !important;
    background-color: transparent;
  }
  .size-primary1 {
    color: var(--request-post) !important;
    background-color: transparent;
  }
  .tooltip-statuscode {
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--background-light) !important;
    padding: 4px 8px;
    border-radius: 4px;
    display: none;
    transition: 0.2s ease-in-out;
  }
  .statuscode {
    padding: 4px 8px;
  }
  .statuscode:hover .tooltip-statuscode {
    display: block;
    transition: 0.2s ease-in-out;
  }
</style>
