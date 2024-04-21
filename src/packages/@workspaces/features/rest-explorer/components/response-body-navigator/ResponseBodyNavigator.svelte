<script lang="ts">
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  import copyToClipBoard from "$lib/utils/copyToClipboard";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import {
    RequestDataType,
    ResponseFormatter,
    ResponseStatusCode,
  } from "$lib/utils/enums/request.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { v4 as uuidv4 } from "uuid";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import StatusSuccess from "$lib/assets/status-success.svelte";
  import StatusError from "$lib/assets/status-error.svelte";
  import { Select } from "$lib/components/inputs";

  export let response;
  export let apiState;
  export let onUpdateRequestState;
  export let onClearResponse;

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
    onUpdateRequestState({ responseBodyLanguage: tab });
  };

  $: {
    if (apiState) {
      if (apiState.responseBodyLanguage === RequestDataType.JSON) {
        fileExtension = "json";
      } else if (apiState.responseBodyLanguage === RequestDataType.XML) {
        fileExtension = "xml";
      } else if (apiState.responseBodyLanguage === RequestDataType.HTML) {
        fileExtension = "html";
      } else if (apiState.responseBodyLanguage === RequestDataType.TEXT) {
        fileExtension = "txt";
      } else if (apiState.responseBodyLanguage === RequestDataType.JAVASCRIPT) {
        fileExtension = "js";
      }
    }
  }

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

<div class="d-flex flex-column align-items-start justify-content-between w-100">
  <div
    class="response-container d-flex align-items-center justify-content-between pb-3 w-100 z-1 position-sticky"
    style="top:55.4px; background-color: var(--background-color); margin-top: -1px;"
  >
    <div class="d-flex gap-4 align-items-center justify-content-center">
      <div class="bg-dullBackground rounded my-2" style="height: 22px;">
        <button
          on:click={() => {
            onUpdateRequestState({
              responseBodyFormatter: ResponseFormatter.PRETTY,
            });
          }}
          class="rounded btn-formatter {apiState.responseBodyFormatter ===
          ResponseFormatter.PRETTY
            ? 'bg-labelColor text-blackColor'
            : ''}"
        >
          Pretty
        </button>
        <button
          on:click={() => {
            onUpdateRequestState({
              responseBodyFormatter: ResponseFormatter.RAW,
            });
          }}
          class="rounded btn-formatter {apiState.responseBodyFormatter ===
          ResponseFormatter.RAW
            ? 'bg-labelColor text-blackColor'
            : ''}">Raw</button
        >
      </div>
      {#if apiState.responseBodyFormatter === ResponseFormatter.PRETTY}
        <button
          class="d-flex align-items-center justify-content-center gap-2 bg-backgroundColor border-0"
        >
          <Select
            id={"hash565"}
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
            titleId={apiState.responseBodyLanguage}
            onclick={handleTypeDropdown}
            headerTheme={"transparent"}
            borderType={"none"}
            borderActiveType={"bottom"}
            borderHighlight={"hover-active"}
            headerHighlight={"active"}
            minBodyWidth={"150px"}
            borderRounded={false}
            menuItem={"v2"}
          />
        </button>
      {/if}
    </div>
    <div class="d-flex align-items-center gap-2">
      <!-- insert controller here -->
      <div class="d-flex gap-2">
        <button
          class="statuscode position-relative cursor-pointer ps-1 pe-1 border-0 rounded d-flex align-items-center justify-content-center text-backgroundColor gap-1 {response.status ===
            '200 OK' || response.status === '201 Created'
            ? 'status-primary1'
            : 'status-danger'} "
          style="font-size: 10px;"
        >
          {#if response.status?.length > 12}
            <div class="position-absolute tooltip-statuscode">
              <span class="ellipsis">
                <span class="me-1">
                  {#if response.status === ResponseStatusCode.OK || response.status === ResponseStatusCode.CREATED}
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
                {response.status}</span
              >
            </div>
          {/if}
          <span class="ellipsis">
            <span class="me-1">
              {#if response.status === ResponseStatusCode.OK || response.status === ResponseStatusCode.CREATED}
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
            {response.status}</span
          >
        </button>
        <button
          class="d-flex align-items-center ps-1 pe-1 border-0 justify-content-center rounded text-backgroundColor gap-1 time-primary1"
          style="font-size: 10px;"
        >
          <span>{response.time}</span>
          <p class="mb-0">ms</p>
        </button>
        <button
          class="d-flex align-items-center ps-1 pe-1 justify-content-center rounded border-0 text-backgroundColor gap-1 size-primary1"
          style="font-size: 10px;"
        >
          <span>{response.size?.toFixed(2)}</span>
          <p class="mb-0">KB</p>
        </button>
        <button
          class="clear-button d-flex align-items-center justify-content-center rounded border-0 gap-1"
          style="font-size: 10px;"
          on:click={() => {
            onClearResponse();
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
