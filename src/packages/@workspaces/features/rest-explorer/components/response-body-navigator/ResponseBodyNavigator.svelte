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
  import { ResponseFormatterEnum } from "@common/types/rest-explorer";
  import BeautifyIcon from "$lib/assets/beautify.svg";

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
    class="response-container d-flex align-items-center pb-1 px-0 justify-content-between w-100 z-1 position-sticky"
    style="top:55.4px;  margin-top: -1px;"
  >
    <div class="d-flex gap-3 align-items-center justify-content-center">
      <div class="d-flex align-items-center rounded mb-0 py-1">
        <span
          role="button"
          on:click={() => {
            onUpdateRequestState({
              responseBodyFormatter: ResponseFormatter.PRETTY,
            });
          }}
          class="rounded text-fs-12 border-radius-2 px-3 me-3 py-1 btn-formatter {apiState.responseBodyFormatter ===
          ResponseFormatter.PRETTY
            ? 'bg-tertiary-500 text-secondary-100'
            : ''}"
        >
          Text
        </span>
        <!--
          --
          -- Raw is set to display none
          --
          -->
        <span
          role="button"
          on:click={() => {
            onUpdateRequestState({
              responseBodyFormatter: ResponseFormatter.RAW,
            });
          }}
          class="d-none border-radius-2 px-3 text-fs-12 py-1 btn-formatter {apiState.responseBodyFormatter ===
          ResponseFormatter.RAW
            ? 'bg-tertiary-500 text-secondary-100'
            : ''}">Raw</span
        >
        <span
          role="button"
          on:click={() => {
            onUpdateRequestState({
              responseBodyFormatter: ResponseFormatterEnum.PREVIEW,
            });
          }}
          class="rounded px-2 text-fs-12 py-1 btn-formatter {apiState.responseBodyFormatter ===
          ResponseFormatterEnum.PREVIEW
            ? 'bg-tertiary-500 text-secondary-100'
            : ''}">Preview</span
        >
      </div>

      {#if apiState.responseBodyFormatter === ResponseFormatter.PRETTY}
        <span class="">
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
            headerTheme={"grey"}
            borderType={"none"}
            borderActiveType={"none"}
            borderHighlight={"hover-active"}
            headerHighlight={"hover-active"}
            minBodyWidth={"150px"}
            borderRounded={true}
            bodyTheme={"grey"}
            zIndex={200}
            checkIconColor={"var(--text-primary-200)"}
            menuItem={"v2"}
          />
        </span>
      {/if}
    </div>
    {#if apiState.responseBodyFormatter !== ResponseFormatterEnum.PREVIEW}
      <div class="d-flex align-items-center gap-2">
        <!-- insert controller here -->
        <div class="d-flex gap-2">
          <button
            class="clear-button d-flex align-items-center justify-content-center rounded border-0 gap-1 d-none"
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

        <!-- Download button -->
        <div
          on:click={handleDownloaded}
          role="button"
          class="icon-container d-flex align-items-center justify-content-center border-radius-2"
        >
          <img src={downloadIcon} style="height:12px; width:12px;" />
        </div>
        <!-- Copy button -->
        <div
          on:click={handleCopy}
          role="button"
          class="icon-container d-flex align-items-center justify-content-center border-radius-2"
        >
          <img src={copyIcon} style="height:12px; width:12px;" />
        </div>
        <!-- Prettier button -->
        <div
          on:click={() => {
            notifications.success("Code formatted successfully!");
          }}
          role="button"
          class="icon-container d-flex align-items-center justify-content-center border-radius-2"
        >
          <img src={BeautifyIcon} style="height:10px; width:10px;" />
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .response-container {
    flex-wrap: wrap;
    background-color: transparent;
  }
  .btn-formatter {
    outline: none;
    border: none;
  }

  .clear-button {
    color: var(--workspace-hover-color);
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: center;
    padding: 4px 8px 4px 8px;
  }
  .icon-container {
    height: 24px;
    width: 24px;
  }
  .icon-container:hover {
    background-color: var(--bg-secondary-550);
  }
  .icon-container:active {
    background-color: var(--bg-secondary-600);
  }
</style>
