<script lang="ts">
  import { downloadIcon } from "@sparrow/library/assets";
  import { copyIcon } from "@sparrow/library/assets";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { notifications } from "@sparrow/library/ui";
  import {
    RequestDataType,
    ResponseFormatter,
  } from "@sparrow/common/enums/request.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { ResponseFormatterEnum } from "@sparrow/common/types/workspace";
  import { beautifyIcon as BeautifyIcon } from "@sparrow/library/assets";
  import js_beautify, { html_beautify } from "js-beautify";
  import { WithSelectV3 } from "@sparrow/workspaces/hoc";
  import { invoke } from "@tauri-apps/api/core";
  import { save } from "@tauri-apps/plugin-dialog";

  export let response;
  export let apiState;
  export let onUpdateResponseState;
  export let onClearResponse;

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
    notifications.success("Copied to Clipboard");
    MixpanelEvent(Events.COPY_API_RESPONSE);
  };

  const handleTypeDropdown: (tab: string) => void = (tab) => {
    onUpdateResponseState("responseBodyLanguage", tab);
  };

  $: {
    if (apiState) {
      if (apiState.bodyLanguage === RequestDataType.JSON) {
        fileExtension = "json";
      } else if (apiState.bodyLanguage === RequestDataType.XML) {
        fileExtension = "xml";
      } else if (apiState.bodyLanguage === RequestDataType.HTML) {
        fileExtension = "html";
      } else if (apiState.bodyLanguage === RequestDataType.TEXT) {
        fileExtension = "txt";
      } else if (apiState.bodyLanguage === RequestDataType.JAVASCRIPT) {
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

  // const handleDownloaded = async () => {
  //   const blobToBase64 = async (blob: Blob) => {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         resolve((reader.result as string).split(",")[1]);
  //       };
  //       reader.onerror = reject;
  //       reader.readAsDataURL(blob);
  //     });
  //   };

  //   const saveFile = async (blob: Blob, fileName: string) => {
  //     if (window.isTauri) {
  //       const base64Data = await blobToBase64(blob);
  //       await invoke(`save_file`, { filename: fileName, data: base64Data });
  //     } else {
  //       // saveAs(blob, fileName);
  //     }
  //   };

  //   return { saveFile };
  // };

  const handleDownloaded = async () => {
    // Open a save file dialog
    const newHandle = await save({
      defaultPath: `api_response_${response?.status || ""}_${response?.time || "0"}ms_${response?.size || "0"}kb.${fileExtension}`,
      filters: [
        {
          name: "Text Files",
          extensions: ["txt", "json", "xml", "js", "html"],
        },
      ],
    });
    console.log(newHandle);
    // if (newHandle) {
    //   // Create a writable stream
    //   const writableStream = await newHandle.createWritable();

    //   // Write the file content
    //   await writableStream.write(formatCode(response?.body));

    //   // Close the writable stream
    //   await writableStream.close();

    //   // Notify the user of success
    //   notifications.success("Response downloaded successfully.");

    //   // Track the download event
    //   MixpanelEvent(Events.DOWNLOAD_API_RESPONSE);
    // } else {
    //   // Handle the case where the user canceled the save dialog
    //   console.log("Save operation was canceled.");
    // }
  };

  // const handleDownloaded = async () => {
  //   console.log("HETY");
  //   const newHandle = await window.showSaveFilePicker({
  //     suggestedName: `api_response_${
  //       response?.status ? response?.status : ""
  //     }_${response?.time ? response?.time : "0"}ms_${
  //       response?.size ? response?.size : "0"
  //     }kb.${fileExtension}`,
  //     accept: {
  //       extensions: ["txt", "json", "xml", "js", "html"],
  //     },
  //   });
  //   const writableStream = await newHandle.createWritable();
  //   // write our file
  //   await writableStream.write(formatCode(response?.body));
  //   await writableStream.close();
  //   notifications.success("Response downloaded successfully.");
  //   MixpanelEvent(Events.DOWNLOAD_API_RESPONSE);
  // };
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
          class="rounded text-fs-12 border-radius-2 px-3 me-3 py-1 btn-formatter {apiState.bodyFormatter ===
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
          class="d-none border-radius-2 px-3 text-fs-12 py-1 btn-formatter {apiState.bodyFormatter ===
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
          class="rounded px-2 text-fs-12 py-1 btn-formatter {apiState.bodyFormatter ===
          ResponseFormatterEnum.PREVIEW
            ? 'bg-tertiary-500 text-secondary-100'
            : ''}">Preview</span
        >
      </div>

      {#if apiState.bodyFormatter === ResponseFormatter.PRETTY}
        <span class="">
          <WithSelectV3
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
            titleId={apiState.bodyLanguage}
            onclick={handleTypeDropdown}
            zIndex={499}
            disabled={false}
          />
        </span>
      {/if}
    </div>
    {#if apiState.bodyFormatter !== ResponseFormatterEnum.PREVIEW}
      <div class="d-flex align-items-center gap-3" style=" height: 32px;">
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

        <!-- Download button -->
        <div
          on:click={handleDownloaded}
          role="button"
          class="icon-container d-flex align-items-center justify-content-center border-radius-2"
          style="height: 32px; width: 32px;"
        >
          <img src={downloadIcon} style="height:16px; width:16px;" />
        </div>
        <!-- Copy button -->
        <div
          on:click={handleCopy}
          role="button"
          class="icon-container d-flex align-items-center justify-content-center border-radius-2"
          style="height: 32px; width: 32px;"
        >
          <img src={copyIcon} style="height:16px; width:16px;" />
        </div>
        <!-- Prettier button -->
        <div
          on:click={() => {
            notifications.success("Code formatted successfully.");
          }}
          role="button"
          class="icon-container d-flex align-items-center justify-content-center border-radius-2"
          style="height: 32px; width: 32px;"
        >
          <img src={BeautifyIcon} style="height:12px; width:12px;" />
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
