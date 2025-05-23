<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";
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

  function formatHeaders(
    headers: Array<{ key: string; value: string; checked?: boolean }>,
  ): string {
    if (!headers || headers.length === 0) return "";

    const headerObj = headers.reduce(
      (acc, header) => {
        acc[header.key] = header.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    try {
      return JSON.stringify(headerObj, null, 2);
    } catch (e) {
      return headers
        .map((header) => `"${header.key}": "${header.value}"`)
        .join(",\n");
    }
  }

  function formatContent(content: any, contentType: string): string {
    if (content === null || content === undefined) return "";

    if (contentType.includes("headers") && Array.isArray(content)) {
      return formatHeaders(content);
    }

    if (typeof content === "string") {
      return content;
    } else {
      try {
        return JSON.stringify(content, null, 2);
      } catch (e) {
        return String(content);
      }
    }
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

  $: {
    editorValue = formatContent(bodyContent, contentType);
    editorLang = setEditorLanguage(contentType);
  }

  function handleToggleClick(event: MouseEvent) {
    event.stopPropagation();
    onToggleExpand(event);
  }
</script>

<div class="body-viewer">
  <div class="section-header">
    <span class="section-toggle">
      <Button
        startIcon={isExpanded ? ChevronDownRegular : ChevronRightRegular}
        size={"small"}
        type={"teritiary-regular"}
        onClick={(e) => handleToggleClick(e)}
      />
    </span>
    <span class="section-title">{getSectionTitle()}</span>
  </div>

  {#if isExpanded}
    <div class="section-content {isEmpty() ? 'empty-content' : ''}">
      {#if isEmpty()}
        <div class="empty-state">
          No {customTitle ||
            (isRequestBody ? "request" : "response") +
              (customTitle ? "" : " body")} available.
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
  .body-viewer {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .section-header {
    display: flex;
    align-items: center;
    padding: 0;
  }

  .section-toggle {
    margin-right: 8px;
  }

  .section-title {
    font-size: 12px;
    color: var(--text-ds-neutral-50);
  }

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
</style>
