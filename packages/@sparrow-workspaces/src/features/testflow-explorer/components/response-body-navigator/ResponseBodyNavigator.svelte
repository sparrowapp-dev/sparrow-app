<script lang="ts">
  import { CopyRegular, ArrowDownloadRegular } from "@sparrow/library/icons";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { notifications, Tooltip } from "@sparrow/library/ui";
  import {
    RequestDataType,
    ResponseFormatter,
  } from "@sparrow/common/enums/request.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { ResponseFormatterEnum } from "@sparrow/common/types/workspace";
  import { beautifyIcon as BeautifyIcon } from "@sparrow/library/assets";
  import js_beautify, { html_beautify } from "js-beautify";
  import { WithButtonV6, WithSelectV3 } from "@sparrow/workspaces/hoc";
  import { save } from "@tauri-apps/plugin-dialog";
  import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
  import { responseBodyDataFormatTypes } from "../../../../../../@sparrow-common/src/utils/testFlow.helper";
  import { onMount } from "svelte";

  export let response;
  export let apiState: any;
  export let onUpdateResponseState;
  export let onClearResponse;
  export let isWebApp;

  let fileExtension: string;

  /**
   * @description - formats the code
   * @param _data - un-formatted data
   */
  const formatCode = (_data: string) => {
    return fileExtension === "json" || fileExtension === "js"
      ? js_beautify(_data)
      : fileExtension === "xml" || fileExtension === "html"
        ? html_beautify(_data)
        : removeIndentation(_data);
  };
  /**
   * @description Copy API response to users clipboard.
   */

  const handleCopy = async () => {
    await copyToClipBoard(formatCode(response?.body));
    notifications.success("Copied to Clipboard.");
    MixpanelEvent(Events.COPY_API_RESPONSE);
  };

  const handleTypeDropdown = (tab: string) => {
    onUpdateResponseState("responseBodyLanguage", tab);
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
  /**
   * @description - remove indentation from the string
   * @param code - text that should be shown on code mirror view
   * @returns - plain text code without indentation
   */
  const removeIndentation = (str: string) => {
    // Split the code into lines
    const lines = str.split("\n");
    // Remove leading whitespace from each line
    const unindentedLines = lines.map((line) => line.trim());
    // Join the lines back together
    return unindentedLines.join("\n");
  };

  const handleDownloaded = async () => {
    // Open a save file dialog
    const path = await save({
      defaultPath: `api_response_${
        response?.status ? response?.status : ""
      }_${response?.time ? response?.time : "0"}ms_${
        response?.size ? response?.size : "0"
      }kb.${fileExtension}`,
      filters: [
        {
          name: "Text Files",
          extensions: ["txt", "json", "xml", "js", "html"],
        },
      ],
    });
    // Check if a path was selected
    if (path) {
      const contents = formatCode(response?.body);
      await writeTextFile(path, contents, {
        baseDir: BaseDirectory.AppConfig,
      });
      notifications.success("Exported successfully.");
    } else {
      console.error("Save dialog was canceled or no path was selected.");
    }
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
            onUpdateResponseState(
              "responseBodyFormatter",
              ResponseFormatter.PRETTY,
            );
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
            onUpdateResponseState(
              "responseBodyFormatter",
              ResponseFormatter.RAW,
            );
          }}
          class="d-none border-radius-2 px-3 text-fs-12 py-1 btn-formatter {apiState.responseBodyFormatter ===
          ResponseFormatter.RAW
            ? 'bg-tertiary-500 text-secondary-100'
            : ''}">Raw</span
        >
        <span
          role="button"
          on:click={() => {
            onUpdateResponseState(
              "responseBodyFormatter",
              ResponseFormatterEnum.PREVIEW,
            );
          }}
          class="rounded px-2 text-fs-12 py-1 btn-formatter {apiState.responseBodyFormatter ===
          ResponseFormatterEnum.PREVIEW
            ? 'bg-tertiary-500 text-secondary-100'
            : ''}">Preview</span
        >
      </div>

      {#if apiState.responseBodyFormatter === ResponseFormatter.PRETTY}
        <span class="">
          <WithSelectV3
            id={"hash565"}
            data={responseBodyDataFormatTypes}
            titleId={apiState.responseBodyLanguage}
            onclick={handleTypeDropdown}
            zIndex={499}
            disabled={false}
          />
        </span>
      {/if}
    </div>
    {#if apiState.responseBodyFormatter !== ResponseFormatterEnum.PREVIEW}
      <div class="d-flex align-items-center gap-2" style=" height: 32px;">
        <!-- insert controller here -->
        <div class="d-flex gap-2">
          <button
            class="clear-button d-flex align-items-center justify-content-center rounded border-0 gap-1 d-none"
            style="font-size: 10px;"
            on:click={() => {
              onClearResponse();
              notifications.success("Response cleared successfully.");
              MixpanelEvent(Events.CLEAR_API_RESPONSE);
            }}
          >
            Clear
          </button>
        </div>

        <!-- Copy button -->
        <Tooltip title={"Copy"}>
          <WithButtonV6
            icon={CopyRegular}
            onClick={handleCopy}
            disable={false}
            loader={false}
          />
        </Tooltip>
        <!-- Download button -->
        {#if !isWebApp}
          <Tooltip title={"Export"}>
            <WithButtonV6
              icon={ArrowDownloadRegular}
              onClick={handleDownloaded}
              disable={false}
              loader={false}
            />
          </Tooltip>
        {/if}
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
