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
  import { BoxIcon, ClockIcon, DotIcon } from "@sparrow/library/icons";
  import { ArchiveRegular, ClockRegular } from "@sparrow/library/icons";
  import { Navigator } from "@sparrow/library/ui";
  export let requestStateSection: string;
  export let onUpdateResponseState;
  export let responseHeadersLength = 0;
  export let response;

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

  const checkIfRequestSucceed = (_status: string) => {
    if (
      Number(_status.split(" ")[0]) >= 200 &&
      Number(_status.split(" ")[0]) < 300
    )
      return true;
    return false;
  };
</script>

<div class="pb-2 d-flex" style="position: relative;">
  <Navigator {tabs} {onTabClick} currentTabId={requestStateSection} />
  <div
    class="d-flex flex-column align-items-start justify-content-between w-100"
  >
    <div
      class="response-container d-flex align-items-center pb-1 px-0 justify-content-between w-100 z-1 position-sticky"
      style="top:55.4px;  margin-top: -1px;"
    >
      <div class="d-flex align-items-center gap-2" style=" height: 32px;">
        <!-- <Tooltip title={"Copy"}>
          <WithButtonV6
            icon={CopyIcon}
            onClick={handleCopy}
            disable={false}
            loader={false}
          />
        </Tooltip>
        <Tooltip title={"Export"}>
          <WithButtonV6
            icon={DownloadIcon2}
            onClick={handleDownloaded}
            disable={false}
            loader={false}
          />
        </Tooltip> -->
      </div>
      <div class="d-flex gap-3 align-items-center justify-content-center">
        {#if response && response?.status}
          <div class="d-flex align-items-center gap-2">
            <!-- insert controller here -->
            <div class="d-flex align-items-center gap-2">
              <Tooltip
                title="HTTP Status - {response.status}"
                placement={"bottom-center"}
                zIndex={500}
                distance={20}
              >
                <span
                  class="statuscode gap-1 d-flex align-items-center position-relative cursor-pointer border-0"
                  style="font-size: 12px;"
                >
                  <span
                    class="ellipsis d-flex align-items-center"
                    style="color:{checkIfRequestSucceed(response?.status)
                      ? 'var(--icon-ds-success-300)'
                      : 'var(--icon-ds-danger-300)'};"
                  >
                    <span class="me-2 d-flex">
                      <DotIcon
                        color={checkIfRequestSucceed(response?.status)
                          ? "var(--icon-ds-success-300)"
                          : "var(--icon-ds-danger-300)"}
                        height={"6px"}
                        width={"6px"}
                      />
                    </span>
                    {response.status.split(" ")[0]}</span
                  >
                </span>
              </Tooltip>
              <Tooltip
                title="Response Time"
                placement={"bottom-center"}
                zIndex={500}
                distance={20}
              >
                <span
                  class="text-fs-12 d-flex align-items-center ps-1 pe-1 border-0 justify-content-center rounded text-backgroundColor gap-1 time-primary1"
                  style=" color:{checkIfRequestSucceed(response?.status)
                    ? 'var(--icon-ds-success-300)'
                    : 'var(--icon-ds-danger-300)'};"
                >
                  <span class="me-1 d-flex">
                    <ClockRegular
                      color={checkIfRequestSucceed(response?.status)
                        ? "var(--icon-ds-success-300)"
                        : "var(--icon-ds-danger-300)"}
                      size={"12px"}
                    />
                  </span>
                  <span
                    class="text-fs-12"
                    style=" color:{checkIfRequestSucceed(response?.status)
                      ? 'var(--icon-ds-success-300)'
                      : 'var(--icon-ds-danger-300)'};"
                  >
                    {response.time}
                  </span>
                  <p
                    class="mb-0 text-fs-12"
                    style=" font-size: 12px; color:{checkIfRequestSucceed(
                      response?.status,
                    )
                      ? 'var(--icon-ds-success-300)'
                      : 'var(--icon-ds-danger-300)'};"
                  >
                    ms
                  </p>
                </span>
              </Tooltip>
              <Tooltip
                title="Response Size"
                placement={"bottom-center"}
                zIndex={500}
                distance={20}
              >
                <span
                  class="d-flex align-items-center ps-1 pe-1 justify-content-center rounded border-0 text-backgroundColor gap-1 size-primary1"
                  style="font-size: 12px;"
                >
                  <span class="me-1 d-flex">
                    <ArchiveRegular
                      color={"var(--icon-ds-neutral-50)"}
                      size={"12px"}
                    />
                  </span>
                  <p class="mb-0 response-time-text" style="font-size: 12px;">
                    {response.size?.toFixed(2)} KB
                  </p>
                </span>
              </Tooltip>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .response-time-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: var(--bg-ds-neutral-50);
  }
</style>
