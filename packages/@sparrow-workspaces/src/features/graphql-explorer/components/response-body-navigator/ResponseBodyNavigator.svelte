<script lang="ts">
  import { downloadIcon } from "@sparrow/library/assets";
  import { copyIcon } from "@sparrow/library/assets";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { notifications } from "@sparrow/library/ui";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { beautifyIcon as BeautifyIcon } from "@sparrow/library/assets";
  import js_beautify, { html_beautify } from "js-beautify";
  import { save } from "@tauri-apps/plugin-dialog";
  import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";

  export let response;

  let fileExtension: "json";

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
      defaultPath: `api_response_${response?.status || ""}_${response?.time || "0"}ms_${response?.size || "0"}kb.${fileExtension}`,
      filters: [
        {
          name: "Text Files",
          extensions: ["txt", "json", "xml", "js", "html"],
        },
      ],
    });
    console.log(path);
    // Check if a path was selected
    if (path) {
      const contents = JSON.stringify(formatCode(response?.body));
      await writeTextFile(path, contents, {
        baseDir: BaseDirectory.AppConfig,
      });
    } else {
      console.log("Save dialog was canceled or no path was selected.");
    }
  };
</script>

<div class="d-flex flex-column align-items-start justify-content-between w-100">
  <div
    class="response-container d-flex align-items-center pb-1 px-0 justify-content-between w-100 z-1 position-sticky"
    style="top:55.4px;  margin-top: -1px;"
  >
    <div class="d-flex gap-3 align-items-center justify-content-center"></div>
    <div class="d-flex align-items-center gap-3" style=" height: 32px;">
      <!-- insert controller here -->

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
    </div>
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
