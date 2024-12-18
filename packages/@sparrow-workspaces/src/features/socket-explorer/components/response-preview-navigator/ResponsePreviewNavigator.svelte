<script lang="ts">
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { notifications } from "@sparrow/library/ui";
  import {
    RequestDataType,
    ResponseFormatter,
  } from "@sparrow/common/enums/request.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { ResponseFormatterEnum } from "@sparrow/common/types/workspace";
  import js_beautify, { html_beautify } from "js-beautify";
  import {
    WithButtonV4,
    WithSelect,
    WithSelectV2,
  } from "@sparrow/workspaces/hoc";
  import { Tooltip } from "@sparrow/library/ui";
  import { CopyIcon, DownloadIcon2 } from "@sparrow/library/icons";
  import type { WebSocketMessage } from "../../store/websocket";
  import { save } from "@tauri-apps/plugin-dialog";
  import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";

  export let webSocket;
  export let onUpdateContentType;
  export let isWebApp = false;

  let fileExtension: string;
  let MessageTransmitter = "Type";

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
   * find socket response message data with id
   * @param uuid - unique id of a message
   */
  const currentMessage = (uuid: string) => {
    if (webSocket) {
      const message = webSocket.messages.find(
        (message: WebSocketMessage) => message.uuid === uuid,
      );
      return message?.data;
    }
    return "";
  };
  /**
   * @description Copy API response to users clipboard.
   */

  const handleCopy = async () => {
    const selectedMessage = currentMessage(webSocket?.body);
    await copyToClipBoard(formatCode(selectedMessage));
    notifications.success("Copied to Clipboard.");
    MixpanelEvent(Events.COPY_API_RESPONSE);
  };

  const handleTypeDropdown: (tab: string) => void = (tab) => {
    onUpdateContentType(tab);
  };

  $: {
    if (webSocket?.contentType) {
      if (webSocket?.contentType === RequestDataType.JSON) {
        fileExtension = "json";
      } else if (webSocket?.contentType === RequestDataType.XML) {
        fileExtension = "xml";
      } else if (webSocket?.contentType === RequestDataType.HTML) {
        fileExtension = "html";
      } else if (webSocket?.contentType === RequestDataType.TEXT) {
        fileExtension = "txt";
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
      defaultPath: `websocket_response.${fileExtension}`,
      filters: [
        {
          name: "Text Files",
          extensions: ["txt", "json", "xml", "js", "html"],
        },
      ],
    });
    // Check if a path was selected
    if (path) {
      const selectedMessage = currentMessage(webSocket?.body);
      const contents = formatCode(selectedMessage);
      await writeTextFile(path, contents, {
        baseDir: BaseDirectory.AppConfig,
      });
      notifications.success("Exported successfully.");
    } else {
      console.error("Save dialog was canceled or no path was selected.");
    }
  };

  const currentTransmitter = (uuid: string) => {
    if (webSocket) {
      const message = webSocket.messages.find(
        (message: WebSocketMessage) => message.uuid === uuid,
      );
      if (message?.transmitter === "connecter") {
        return "Connected";
      } else if (message?.transmitter === "disconnector") {
        return "Disconnected";
      } else if (message?.transmitter === "receiver") {
        return "Received";
      } else if (message?.transmitter === "sender") {
        return "Sent";
      } else {
        return "Type";
      }
    }
    return "Type";
  };

  $: {
    let uuid = webSocket?.body;
    MessageTransmitter = currentTransmitter(uuid);
  }
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between w-100 bg-tertiary-300 px-3 pt-1"
>
  <div
    class="response-container d-flex align-items-center pb-1 px-0 justify-content-between w-100 z-1 position-sticky"
    style="top:55.4px;  margin-top: -1px;"
  >
    <div class="d-flex gap-3 align-items-center justify-content-center">
      <span class="text-fs-12" style="color: var(--text-secondary-100);">
        {MessageTransmitter}
      </span>
      <span class="">
        <WithSelectV2
          id={"hashdew565"}
          data={[
            {
              name: "Text",
              id: RequestDataType.TEXT,
            },
            {
              name: "JSON",
              id: RequestDataType.JSON,
            },
            {
              name: "HTML",
              id: RequestDataType.HTML,
            },
            {
              name: "XML",
              id: RequestDataType.XML,
            },
          ]}
          titleId={webSocket?.contentType}
          onclick={handleTypeDropdown}
          zIndex={499}
          disabled={false}
        />
      </span>
    </div>

    <div class="d-flex align-items-center gap-2">
      <!-- Copy button -->
      <Tooltip title={"Copy"}>
        <WithButtonV4
          icon={CopyIcon}
          onClick={handleCopy}
          disable={false}
          loader={false}
        />
      </Tooltip>
      <!-- Download button -->

      {#if isWebApp === true}
        <Tooltip title={"Export"}>
          <WithButtonV4
            icon={DownloadIcon2}
            onClick={handleDownloaded}
            disable={false}
            loader={false}
          />
        </Tooltip>
      {/if}
    </div>
  </div>
</div>

<style>
  .response-container {
    flex-wrap: wrap;
    background-color: transparent;
  }
</style>
