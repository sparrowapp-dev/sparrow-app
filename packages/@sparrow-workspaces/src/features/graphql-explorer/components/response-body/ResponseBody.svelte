<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import {
    RequestDataTypeEnum,
    type Response,
  } from "@sparrow/common/types/workspace";
  import { Tooltip } from "@sparrow/library/ui";
  import WithButtonV6 from "../../../../hoc/WithButtonV6.svelte";
  import { ArrowDownloadRegular, CopyRegular } from "@sparrow/library/icons";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { notifications } from "@sparrow/library/ui";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import js_beautify, { html_beautify } from "js-beautify";
  import { save } from "@tauri-apps/plugin-dialog";
  import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
  export let response: Response;
  export let isWebApp;
  let fileExtension = "json";
  let language = RequestDataTypeEnum.JSON;

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

  /**
   * @description - remove indentation from the string
   * @param code - text that should be shown on code mirror view
   * @returns - plain text code without indentation
   */
  const handleDownloaded = async () => {
    // Open a save file dialog
    const path = await save({
      defaultPath: `graphql_response_${response?.status || ""}_${response?.time || "0"}ms_${response?.size || "0"}kb.${fileExtension}`,
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

<div class="d-flex justify-content-between position-relative">
  <div
    class="d-flex flex-column align-items-start justify-content-between w-100 h-100 response-body"
  >
    <div class="w-100 position-relative h-100">
      <Editor
        bind:lang={language}
        bind:value={response.body}
        on:change={() => {}}
        isEditable={false}
        isFormatted={true}
      />
    </div>
  </div>

  <div class="d-flex position-absolute bottom-0 end-0 p-2 gap-1">
    <Tooltip title={"Copy"} placement="top-center">
      <WithButtonV6
        icon={CopyRegular}
        disable={false}
        loader={false}
        onClick={handleCopy}
      />
    </Tooltip>
    {#if !isWebApp}
      <Tooltip title={"Export"} placement="top-center">
        <WithButtonV6
          icon={ArrowDownloadRegular}
          disable={false}
          onClick={handleDownloaded}
          loader={false}
        />
      </Tooltip>
    {/if}
  </div>
</div>
