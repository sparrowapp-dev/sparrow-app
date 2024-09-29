<script lang="ts">
  import downloadIcon from "@deprecate/assets/download.svg";
  import copyIcon from "@deprecate/assets/copy.svg";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { notifications } from "@sparrow/library/ui";
  import {
    RequestDataType,
    ResponseFormatter,
  } from "@deprecate/utils/enums/request.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
  import { ResponseFormatterEnum } from "@sparrow/common/types/workspace";
  import BeautifyIcon from "@deprecate/assets/beautify.svg";
  import js_beautify, { html_beautify } from "js-beautify";
  import {
    WithButtonV4,
    WithSelect,
    WithSelectV2,
  } from "@sparrow/workspaces/common/hoc";
  import { Tooltip } from "@sparrow/library/ui";
  import { CopyIcon, DownloadIcon } from "@sparrow/library/icons";
  import type { WebSocketMessage } from "../../store/websocket";

  export let webSocket;
  export let onUpdateContentType;

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
   * @description Copy API response to users clipboard.
   */

  const handleCopy = async () => {
    await copyToClipBoard(formatCode(webSocket?.body));
    notifications.success("Copied to clipboard");
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
    const newHandle = await window.showSaveFilePicker({
      suggestedName: `api_response.${fileExtension}`,
      accept: {
        extensions: ["txt", "json", "xml", "js", "html"],
      },
    });
    const writableStream = await newHandle.createWritable();
    // write our file
    await writableStream.write(formatCode(webSocket?.body));
    await writableStream.close();
    notifications.success("Exported successfully.");
    MixpanelEvent(Events.DOWNLOAD_API_RESPONSE);
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
        return "Send";
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
      <span class="text-fs-12"> {MessageTransmitter} </span>
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
        <!-- <div
          on:click={handleCopy}
          role="button"
          class="icon-container d-flex align-items-center justify-content-center border-radius-2"
        >
          <img src={copyIcon} style="height:12px; width:12px;" />
        </div> -->
        <WithButtonV4
          icon={CopyIcon}
          onClick={handleCopy}
          disable={false}
          loader={false}
        />
      </Tooltip>
      <!-- Download button -->
      <Tooltip title={"Download"}>
        <WithButtonV4
          icon={DownloadIcon}
          onClick={handleDownloaded}
          disable={false}
          loader={false}
        />
      </Tooltip>
    </div>
  </div>
</div>

<style>
  .response-container {
    flex-wrap: wrap;
    background-color: transparent;
  }
</style>
