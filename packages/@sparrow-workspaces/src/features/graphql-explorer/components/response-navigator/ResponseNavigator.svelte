<script lang="ts">
  import { notifications, Tooltip } from "@sparrow/library/ui";
  import { ResponseSectionEnum } from "@sparrow/common/types/workspace";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import js_beautify, { html_beautify } from "js-beautify";
  import { save } from "@tauri-apps/plugin-dialog";
  import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
  import { WithButtonV6 } from "../../../../hoc";
  import { CopyIcon, DownloadIcon2 } from "@sparrow/library/icons";
  import { Navigator } from "../../../../components";
  export let requestStateSection: string;
  export let onUpdateResponseState;
  export let responseHeadersLength = 0;

  let tabs: {
    name: string;
    id: ResponseSectionEnum;
    count: number;
  }[] = [];

  /**
   * @description - refresh tabs label count
   * @param _responseHeadersLength - response headers length
   */
  const refreshTabs = (_responseHeadersLength: number) => {
    return [
      { name: "Body", id: ResponseSectionEnum.RESPONSE, count: 0 },
      {
        name: "Headers",
        id: ResponseSectionEnum.HEADERS,
        count: _responseHeadersLength,
      },
    ];
  };

  /**
   * @description - re-calculates value when dependency changes
   */
  $: {
    if (responseHeadersLength) {
      tabs = refreshTabs(responseHeadersLength);
    }
  }

  export let response;

  let fileExtension = "json";

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

  const onTabClick = (tabId: ResponseSectionEnum) => {
    onUpdateResponseState("responseNavigation", tabId);
  };
</script>

<div class="pb-2 d-flex">
  <Navigator {tabs} {onTabClick} currentTabId={requestStateSection} />
  <div
    class="d-flex flex-column align-items-start justify-content-between w-100"
  >
    <div
      class="response-container d-flex align-items-center pb-1 px-0 justify-content-between w-100 z-1 position-sticky"
      style="top:55.4px;  margin-top: -1px;"
    >
      <div class="d-flex gap-3 align-items-center justify-content-center"></div>
      <div class="d-flex align-items-center gap-2" style=" height: 32px;">
        <!-- Copy button -->
        <Tooltip title={"Copy"}>
          <WithButtonV6
            icon={CopyIcon}
            onClick={handleCopy}
            disable={false}
            loader={false}
          />
        </Tooltip>
        <!-- Download button -->
        <!-- Download button -->
        <Tooltip title={"Export"}>
          <WithButtonV6
            icon={DownloadIcon2}
            onClick={handleDownloaded}
            disable={false}
            loader={false}
          />
        </Tooltip>
      </div>
    </div>
  </div>
</div>
