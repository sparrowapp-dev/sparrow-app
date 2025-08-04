<script lang="ts">
  import { downloadIcon, SaveIcon } from "@sparrow/library/assets";
  import { copyIcon } from "@sparrow/library/assets";
  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  import {
    copyToClipBoard,
    handleDownloadResponse,
  } from "@sparrow/common/utils";
  import { Button, notifications, Tooltip } from "@sparrow/library/ui";
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
  import { invoke } from "@tauri-apps/api/core";
  import { save } from "@tauri-apps/plugin-dialog";
  import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
  import {
    ArrowDownloadRegular,
    CopyRegular,
    SaveRegular,
  } from "@sparrow/library/icons";
  import { Select } from "@sparrow/library/forms";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { onMount, tick } from "svelte";

  export let response;
  export let apiState;
  export let onUpdateResponseState;
  export let onClearResponse;
  export let isWebApp = false;
  export let isGuestUser;
  export let onSaveResponse;
  export let path;
  export let userRole;
  onMount(async () => {
    await tick(); // wait for DOM to render
    sliderStyle = getSliderStyle(apiState.bodyFormatter); // set initial slider position
  });
  let fileExtension: string;
  let formatedBody: string;
  let fileNameWithExtension: string;
  let textBtn: HTMLSpanElement;
  let rawBtn: HTMLSpanElement;
  let previewBtn: HTMLSpanElement;
  // travers array of object and get content-type value
  const contentType: string | undefined = response.headers.find(
    (header: { key: string; value: string }) => header.key === "content-type",
  )?.value;

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
    // build complete file name with extension will be used for export in desttop-app and web-app;
    fileNameWithExtension = `api_response_${response?.status || ""}_${response?.time || "0"}ms_${response?.size || "0"}kb.${fileExtension}`;

    formatedBody = formatCode(response?.body); //pre formate body for exporting
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
      defaultPath: fileNameWithExtension,
      filters: [
        {
          name: "Text Files",
          extensions: ["txt", "json", "xml", "js", "html"],
        },
      ],
    });
    // Check if a path was selected
    if (path) {
      const contents = formatedBody;
      await writeTextFile(path, contents, {
        baseDir: BaseDirectory.AppConfig,
      });
      notifications.success("Exported successfully.");
    } else {
      console.error("Save dialog was canceled or no path was selected.");
    }
  };

  const handle_save_response = ({ event_name }: { event_name: string }) => {
    captureEvent("save_response", {
      component: "ResponseBodyNavigator",
      button_text: event_name,
      destination: event_name,
    });
  };

  $: isRawVisible = false;
  $: sliderStyle = getSliderStyle(apiState.bodyFormatter);

  function getSliderStyle(formatter: any) {
    if (!textBtn || !previewBtn) return "";
    const gap = 4; // or read from CSS
    const prettyWidth = textBtn.offsetWidth;
    const rawWidth = rawBtn?.offsetWidth || 0;
    const previewWidth = previewBtn.offsetWidth;
    let left = 0;
    let width = prettyWidth;
    if (formatter === ResponseFormatter.PRETTY) {
      left = prettyWidth / 2;
      width = prettyWidth;
    } else if (formatter === ResponseFormatter.RAW && isRawVisible) {
      left = prettyWidth + gap + rawWidth / 2;
      width = rawWidth;
    } else if (formatter === ResponseFormatterEnum.PREVIEW) {
      if (isRawVisible) {
        left = prettyWidth + gap + rawWidth + gap + previewWidth / 2;
      } else {
        left = prettyWidth + gap + previewWidth / 2 - 5;
      }
      width = previewWidth;
    }

    return `left: ${left}px; width: ${width}px; transform: translateX(-50%);`;
  }
</script>

<div
  class="d-flex flex-column align-items-center justify-content-between w-100"
>
  <div
    class="response-container d-flex align-items-center pb-1 px-0 justify-content-between w-100 z-1 position-sticky"
    style="top:55.4px;  margin-top: -1px;"
  >
    <div class="d-flex gap-1 align-items-center justify-content-center">
      <div
        class="position-relative d-flex align-items-center rounded mb-0 py-1"
        style="position: relative;"
      >
        <!-- ✅ Smooth background -->
        <div class="background-slider" style={sliderStyle}></div>

        <span
          bind:this={textBtn}
          role="button"
          on:click={() => {
            onUpdateResponseState(
              "responseBodyFormatter",
              ResponseFormatter.PRETTY,
            );
          }}
          class="rounded text-fs-12 border-radius-2 px-2 py-1 btn-formatter"
          style="position: relative; z-index: 2;"
        >
          Text
        </span>

        <span
          bind:this={rawBtn}
          role="button"
          on:click={() => {
            onUpdateResponseState(
              "responseBodyFormatter",
              ResponseFormatter.RAW,
            );
          }}
          class="d-none rounded px-2 text-fs-12 py-1 btn-formatter"
          style="position: relative; z-index: 2;"
        >
          Raw
        </span>

        <span
          bind:this={previewBtn}
          role="button"
          on:click={() => {
            onUpdateResponseState(
              "responseBodyFormatter",
              ResponseFormatterEnum.PREVIEW,
            );
          }}
          class="rounded px-2 text-fs-12 py-1 btn-formatter"
          style="position: relative; z-index: 2;"
        >
          Preview
        </span>
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
        {#if path?.collectionId && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
          <!-- Save button -->
          <Button
            startIcon={SaveRegular}
            onClick={() => {
              onSaveResponse();
              handle_save_response({ event_name: "Save Response" });
            }}
            disable={false}
            loader={false}
            size={"small"}
            title={"Save Response"}
            type={"teritiary-regular"}
          />
        {/if}
        <!-- Copy button -->
        <Tooltip title={"Copy"} placement={"bottom-center"}>
          <WithButtonV6
            icon={CopyRegular}
            onClick={handleCopy}
            disable={false}
            loader={false}
          />
        </Tooltip>
        <!-- Download button -->
        {#if !isWebApp}
          <Tooltip title={"Export"} placement={"bottom-right"}>
            <WithButtonV6
              icon={ArrowDownloadRegular}
              onClick={handleDownloaded}
              disable={false}
              loader={false}
            />
          </Tooltip>
        {:else}
          <Tooltip title={"Export"} placement={"bottom-right"}>
            <WithButtonV6
              icon={ArrowDownloadRegular}
              onClick={() =>
                handleDownloadResponse(
                  formatedBody,
                  contentType,
                  fileNameWithExtension,
                )}
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
  .background-slider {
    position: absolute;
    top: 4px;
    height: calc(100% - 8px);
    background: var(--bg-ds-surface-600);
    border-radius: 6px;
    transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
  }

  .btn-formatter {
    position: relative;
    z-index: 2;
  }
</style>
