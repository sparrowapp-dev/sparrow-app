<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import {
    ChevronDownRegular,
    ChevronRightRegular,
  } from "@sparrow/library/icons";

  export let bodyContent: any = null;
  export let contentType: string = "application/json";
  export let isRequestBody: boolean = true;
  export let isExpanded: boolean = true;
  export let onToggleExpand: (event: MouseEvent) => void = () => {};
  export let customTitle: string = "";
  export let showCount: number | null = null;

  let editorValue: string = "";
  let editorLang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "JSON";
  let isBodyBeautified: boolean = false;

  function updateBeautifiedState(value: boolean) {
    isBodyBeautified = value;
  }

  function setEditorLanguage(
    contentType: string,
  ): "HTML" | "JSON" | "XML" | "JavaScript" | "Text" {
    if (contentType.includes("headers")) {
      return "JSON";
    } else if (contentType.includes("json")) {
      return "JSON";
    } else if (contentType.includes("html")) {
      return "HTML";
    } else if (contentType.includes("xml")) {
      return "XML";
    } else if (contentType.includes("javascript")) {
      return "JavaScript";
    } else {
      return "Text";
    }
  }

  function getSectionTitle(): string {
    if (customTitle) {
      return (
        customTitle +
        (showCount !== null && showCount > 0 ? ` (${showCount})` : "")
      );
    }
    return (isRequestBody ? "Request" : "Response") + " Body";
  }

  function isEmpty(): boolean {
    if (
      bodyContent === null ||
      bodyContent === undefined ||
      bodyContent === ""
    ) {
      return true;
    }

    if (Array.isArray(bodyContent) && bodyContent.length === 0) {
      return true;
    }

    return false;
  }

  function isHeadersContent(): boolean {
    return contentType.includes("headers") && Array.isArray(bodyContent);
  }

  function getEditorValue(): string {
    if (bodyContent === null || bodyContent === undefined) return "";

    if (typeof bodyContent === "string") {
      return bodyContent;
    } else {
      try {
        return JSON.stringify(bodyContent, null, 2);
      } catch (e) {
        return String(bodyContent);
      }
    }
  }

  function truncateText(text: string, maxLength: number = 20): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  function shouldTruncate(text: string, maxLength: number = 20): boolean {
    return text.length > maxLength;
  }

  $: {
    editorValue = getEditorValue();
    editorLang = setEditorLanguage(contentType);
  }

  function handleToggleClick(event: MouseEvent) {
    event.stopPropagation();
    onToggleExpand(event);
  }
</script>

<div class="d-flex flex-column">
  <div class="d-flex align-items-center">
    <span class="me-2">
      <Button
        startIcon={isExpanded ? ChevronDownRegular : ChevronRightRegular}
        size={"small"}
        type={"teritiary-regular"}
        onClick={(e) => handleToggleClick(e)}
      />
    </span>
    <span class="text-fs-12">{getSectionTitle()}</span>
  </div>

  {#if isExpanded}
    <div class="section-content {isEmpty() ? 'empty-content' : ''}">
      {#if isEmpty()}
        <div class="empty-state">
          No {customTitle ||
            (isRequestBody ? "request" : "response") +
              (customTitle ? "" : " body")} available.
        </div>
      {:else if isHeadersContent()}
        <div class="headers-container">
          {#each bodyContent as header}
            <div class="header-item d-flex mb-1">
              {#if shouldTruncate(header.key)}
                <Tooltip title={header.key} placement={"top-center"}>
                  <span class="header-key me-2"
                    >{truncateText(header.key)}:</span
                  >
                </Tooltip>
              {:else}
                <span class="header-key me-2">{header.key}:</span>
              {/if}

              {#if shouldTruncate(header.value)}
                <Tooltip title={header.value} placement={"top-center"}>
                  <span class="header-value"
                    >"{truncateText(header.value)}"</span
                  >
                </Tooltip>
              {:else}
                <span class="header-value">"{header.value}"</span>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="editor-container">
          <Editor
            lang={editorLang}
            value={editorValue}
            isEditable={false}
            {isBodyBeautified}
            beautifySyntaxCallback={updateBeautifiedState}
            isMinimalMode={true}
          />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .section-content {
    max-height: 240px;
    overflow-y: auto;
    margin: 0 12px;
  }

  .section-content:not(.empty-content) {
    border-left: 1px solid var(--border-ds-surface-100);
  }

  .empty-state {
    color: var(--text-ds-neutral-200);
    font-size: 12px;
    padding: 4px 0 4px 16px;
  }

  .editor-container {
    padding-left: 20px;
    max-height: 200px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .headers-container {
    padding-left: 20px;
    padding-top: 4px;
  }

  .header-item {
    font-size: 13px;
    line-height: 1.2;
  }

  .header-item:last-child {
    margin-bottom: 0;
  }

  .header-key {
    color: var(--text-ds-neutral-100);
    font-weight: 500;
    min-width: fit-content;
    word-break: break-word;
    font-family: "JetBrains Mono", monospace !important;
  }

  .header-value {
    color: var(--text-ds-info-300);
    word-break: break-word;
    flex: 1;
    font-family: "JetBrains Mono", monospace !important;
  }
</style>
