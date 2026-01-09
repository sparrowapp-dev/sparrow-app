<script lang="ts">
  /**
   * ResponseBodyViewer - Optimized component for displaying large response bodies
   *
   * This component uses file-backed storage and cached CodeMirror editors to prevent
   * UI freezes when dealing with 20-30MB JSON responses.
   *
   * Architecture:
   * - Large responses are stored as temp files, not in JS memory
   * - CodeMirror editors are created ONCE per tab per format and cached
   * - Tab switching only toggles DOM visibility, no file reads or editor recreation
   * - Formatting happens once on first "Pretty" view and is cached forever
   */
  import { onMount, onDestroy, tick } from "svelte";
  import { EditorView } from "codemirror";
  import { EditorState } from "@codemirror/state";
  import { json } from "@codemirror/lang-json";
  import { html } from "@codemirror/lang-html";
  import { xml } from "@codemirror/lang-xml";
  import { javascript } from "@codemirror/lang-javascript";
  // Import theme functions from the editor package
  import { getTheme, getBasicSetup } from "@sparrow/library/forms";
  import { ResponseFormatterEnum } from "@sparrow/common/types/workspace";
  import {
    getCachedContent,
    clearInMemoryCache,
    type ResponseFormat,
  } from "../../utils/response-artifact";
  import { getFormattedResponse } from "../../utils/formatting-service";
  import {
    getOrCreateEditor,
    initializeEditorContent,
    showTabEditor,
    hideTabEditors,
    hasInitializedEditor,
  } from "../../utils/editor-cache";
  import { Loader } from "@sparrow/library/ui";

  // Props
  export let tabId: string;
  export let response: any;
  export let apiState: any;

  // State
  let editorContainer: HTMLDivElement;
  let isLoading = false;
  let loadingMessage = "";
  let hasError = false;
  let errorMessage = "";
  let isRenderingEditor = false;
  let hasDisplayedContent = false;
  let lastResponseVersion: number | undefined;
  let blockingOverlayVisible = false;
  let inlineFormattingVisible = false;

  // Current format being displayed
  let currentFormat: ResponseFormat = "json";

  // Track if this component has been mounted
  let isMounted = false;

  /**
   * Map language to format type
   */
  function languageToFormat(lang: string): ResponseFormat {
    switch (lang?.toUpperCase()) {
      case "JSON":
        return "json";
      case "HTML":
        return "html";
      case "XML":
        return "xml";
      default:
        return "raw";
    }
  }

  /**
   * Get CodeMirror language extension for format
   */
  function getLanguageExtension(format: ResponseFormat) {
    switch (format) {
      case "json":
        return json();
      case "html":
        return html();
      case "xml":
        return xml();
      default:
        return javascript(); // Fallback
    }
  }

  /**
   * Create CodeMirror extensions for a given format
   */
  function createExtensions(format: ResponseFormat) {
    return [
      getBasicSetup({
        showLineNumbers: true,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }),
      getTheme({
        showLineNumbers: true,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }),
      getLanguageExtension(format),
      EditorView.lineWrapping,
      EditorState.readOnly.of(true),
      EditorView.scrollMargins.of(() => ({
        top: 200,
        bottom: 200,
      })),
    ];
  }

  /**
   * Check if response is file-backed (large response)
   */
  function isFileBacked(): boolean {
    return response?.isFileBacked === true;
  }

  /**
   * Get the appropriate format based on apiState
   */
  function getTargetFormat(): ResponseFormat {
    if (apiState?.bodyFormatter === ResponseFormatterEnum.RAW) {
      return "raw";
    }
    return languageToFormat(apiState?.bodyLanguage);
  }

  /**
   * Initialize or update the editor with content
   */
  async function loadContent() {
    if (!editorContainer || !isMounted) return;

    const format = getTargetFormat();
    currentFormat = format;

    // Clear any previous error
    hasError = false;
    errorMessage = "";

    // Check if we're dealing with a file-backed response
    if (isFileBacked()) {
      await loadFileBackedContent(format);
    } else {
      // Small response - use in-memory content directly
      await loadInMemoryContent(format);
    }
  }

  /**
   * Load content from file-backed storage
   */
  async function loadFileBackedContent(format: ResponseFormat) {
    // Always check for cached content first
    const cachedContent = getCachedContent(tabId, format);

    // If editor is already initialized and we have content, just show it
    if (hasInitializedEditor(tabId, format) && cachedContent) {
      hasDisplayedContent = true;

      // Ensure editor is attached to DOM before showing
      if (editorContainer) {
        getOrCreateEditor(
          tabId,
          format,
          createExtensions(format),
          editorContainer,
        );
      }

      showTabEditor(tabId, format);
      return;
    }

    // If we have cached content but editor not initialized, set it up
    if (cachedContent) {
      await setupEditor(format, cachedContent);
      return;
    }

    isLoading = true;
    loadingMessage =
      format === "raw" ? "Loading response..." : `Formatting as ${format}...`;

    try {
      const content = await getFormattedResponse({
        tabId,
        format,
        onProgress: (stage) => {
          switch (stage) {
            case "reading":
              loadingMessage = "Reading response file...";
              break;
            case "formatting":
              loadingMessage = `Formatting as ${format}...`;
              break;
            case "writing":
              loadingMessage = "Caching formatted content...";
              break;
            case "done":
              loadingMessage = "Rendering response...";
              break;
            default:
              break;
          }
        },
      });

      await setupEditor(format, content);
    } catch (e: any) {
      console.error("Failed to load file-backed content:", e);
      hasError = true;
      errorMessage = e?.message || "Failed to load response content";
    } finally {
      isLoading = false;
      if (!isRenderingEditor) {
        loadingMessage = "";
      }
    }
  }

  /**
   * Load in-memory content (small responses)
   */
  async function loadInMemoryContent(format: ResponseFormat) {
    // Always check for cached content first
    const cachedContent = getCachedContent(tabId, format);
    const editorInitialized = hasInitializedEditor(tabId, format);

    // If editor is already initialized and we have content, just show it
    if (editorInitialized && cachedContent) {
      hasDisplayedContent = true;

      // Ensure editor is attached to DOM before showing
      if (editorContainer) {
        getOrCreateEditor(
          tabId,
          format,
          createExtensions(format),
          editorContainer,
        );
      }

      showTabEditor(tabId, format);
      return;
    }

    // If we have cached content but editor not initialized, set it up
    if (cachedContent) {
      await setupEditor(format, cachedContent);
      return;
    }

    // Not cached - format and cache it
    const rawContent = response?.body || "";

    // Show loading state for formatting
    if (format !== "raw") {
      isLoading = true;
      loadingMessage = `Formatting as ${format}...`;
    }

    try {
      const formattedContent = await getFormattedResponse({
        tabId,
        format,
        rawContent,
        onProgress: (stage) => {
          if (stage === "formatting") {
            loadingMessage = `Formatting as ${format}...`;
          } else if (stage === "done") {
            loadingMessage = "";
          }
        },
      });

      await setupEditor(format, formattedContent);
    } catch (e: any) {
      console.error("Failed to format in-memory content:", e);
      hasError = true;
      errorMessage = e?.message || "Failed to format response";
    } finally {
      isLoading = false;
      loadingMessage = "";
    }
  }

  /**
   * Setup CodeMirror editor with content
   */
  async function setupEditor(format: ResponseFormat, content: string) {
    if (!editorContainer) return;

    const cached = getOrCreateEditor(
      tabId,
      format,
      createExtensions(format),
      editorContainer,
    );

    if (!cached.initialized) {
      const shouldClearMessage = !isLoading;
      loadingMessage = `Rendering ${format.toUpperCase()} response...`;
      isRenderingEditor = true;
      await tick();

      try {
        initializeEditorContent(tabId, format, content);
        hasDisplayedContent = true;
      } finally {
        isRenderingEditor = false;
        if (shouldClearMessage) {
          loadingMessage = "";
        }
      }
    }

    showTabEditor(tabId, format);
  }

  /**
   * Handle format changes (user switches dropdown)
   */
  function handleFormatChange() {
    if (!isMounted) return;
    const newFormat = getTargetFormat();
    if (newFormat !== currentFormat) {
      loadContent();
    }
  }

  // Lifecycle
  onMount(() => {
    isMounted = true;
    loadContent();
    lastResponseVersion = response?.responseVersion;

    if (editorContainer) {
      editorContainer.addEventListener("keydown", (event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "f"
        ) {
          event.stopPropagation();
        }
      });
    }
  });

  onDestroy(() => {
    isMounted = false;
    // Hide editors when component unmounts (but don't destroy - they're cached)
    hideTabEditors(tabId);
  });

  // React to apiState changes (format dropdown)
  $: if (apiState && isMounted) {
    handleFormatChange();
  }

  // Reload when the backing response changes (even if metadata stays identical)
  $: if (isMounted) {
    const responseVersion = response?.responseVersion;
    if (
      responseVersion !== undefined &&
      responseVersion !== lastResponseVersion
    ) {
      lastResponseVersion = responseVersion;
      hasDisplayedContent = false;

      // Clear in-memory cache when response changes
      if (!isFileBacked()) {
        clearInMemoryCache(tabId);
      }

      loadContent();
    }
  }

  $: blockingOverlayVisible =
    (isLoading || isRenderingEditor) && !hasDisplayedContent && !hasError;

  $: inlineFormattingVisible =
    (isLoading || isRenderingEditor) && hasDisplayedContent && !hasError;
</script>

<div class="response-body-viewer w-100 h-100">
  {#if blockingOverlayVisible}
    <div class="loading-overlay">
      <Loader loaderSize="20px" />
      <span class="loading-message"
        >{loadingMessage || "Preparing response..."}</span
      >
    </div>
  {:else if inlineFormattingVisible}
    <div class="formatting-indicator">
      {loadingMessage || "Formatting response..."}
    </div>
  {/if}

  {#if hasError}
    <div class="error-container">
      <span class="error-message">{errorMessage}</span>
    </div>
  {/if}

  <div
    bind:this={editorContainer}
    class="editor-container"
    class:hidden={blockingOverlayVisible || hasError}
  />
</div>

<style>
  .response-body-viewer {
    position: relative;
    overflow: hidden;
  }

  .editor-container {
    width: 100%;
    height: 100%;
    /* GPU acceleration */
    will-change: transform;
    transform: translateZ(0);
  }

  .editor-container.hidden {
    visibility: hidden;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-ds-surface-900);
    z-index: 10;
    gap: 12px;
  }

  .loading-message {
    color: var(--text-ds-neutral-50);
    font-size: 12px;
  }

  .formatting-indicator {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 12;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.7);
    color: var(--text-ds-neutral-10, #ffffff);
    font-size: 11px;
    line-height: 1.2;
    pointer-events: none;
  }

  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
  }

  .error-message {
    color: var(--text-ds-danger-300);
    font-size: 14px;
  }

  :global(.cm-cached-editor) {
    width: 100%;
    height: 100%;
  }

  :global(.cm-cached-editor .cm-editor) {
    height: 100%;
  }

  :global(.cm-cached-editor .cm-scroller) {
    /* GPU acceleration */
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
</style>
