<script lang="ts">
  import { Label, notifications, Tooltip } from "@sparrow/library/ui";
  import { ResponseSectionEnum } from "@sparrow/common/types/workspace";
  import { copyToClipBoard } from "@sparrow/common/utils";

  import { downloadIcon } from "@sparrow/library/assets";
  import { copyIcon } from "@sparrow/library/assets";

  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { beautifyIcon as BeautifyIcon } from "@sparrow/library/assets";
  import js_beautify, { html_beautify } from "js-beautify";
  import { save } from "@tauri-apps/plugin-dialog";
  import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
  import { WithButtonV6 } from "../../../../hoc";
  import { CopyIcon, DownloadIcon2 } from "@sparrow/library/icons";
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
</script>

<div class="py-2 d-flex">
  <!-- Tabs -->
  <div class="d-flex mb-2">
    {#each tabs as tab}
      <button
        class="navigation__link border-0 me-2 sparrow-fs-12 me-4 request-tab {tab.id ===
        requestStateSection
          ? 'tab-active'
          : ''}"
        role="tab"
        on:click={() => {
          onUpdateResponseState("responseNavigation", tab.id);
        }}
      >
        <span class="d-flex align-items-center"
          ><span>{tab.name}</span>
          {#if tab.count}
            <span class="ms-1"></span>
            <Label number={tab.count} />
          {/if}
        </span>
      </button>
    {/each}
  </div>
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

<style>
  .navigation__link {
    color: var(--text-secondary-100);
    background-color: transparent;
    border-bottom: 2px transparent;
    padding: 2px;
  }
  .navigation__link:hover {
    background-color: var(--text-secondary-500);
    border-radius: 2px;
  }
  .tab-active {
    color: var(--text-secondary-100);
    border-bottom: 2px solid var(--border-primary-300) !important;
  }

  .response-container {
    flex-wrap: wrap;
    background-color: transparent;
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
