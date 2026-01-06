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
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { EditorView } from "codemirror";
  import { EditorState, Compartment } from "@codemirror/state";
  import { json } from "@codemirror/lang-json";
  import { html } from "@codemirror/lang-html";
  import { xml } from "@codemirror/lang-xml";
  import { javascript } from "@codemirror/lang-javascript";
  // Import theme functions from the editor package
  import { getTheme, getBasicSetup } from "@sparrow/library/forms";
  import {
    RequestDataTypeEnum,
    ResponseFormatterEnum,
  } from "@sparrow/common/types/workspace";
  import {
    getArtifact,
    getCachedContent,
    readRawContent,
    type ResponseFormat,
  } from "../../utils/response-artifact";
  import {
    getFormattedResponse,
    isFormattedContentReady,
  } from "../../utils/formatting-service";
  import {
    getOrCreateEditor,
    initializeEditorContent,
    showTabEditor,
    hideTabEditors,
    hasInitializedEditor,
    destroyTabEditors,
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
    console.log(
      `[ResponseBodyViewer] loadContent called - tabId: ${tabId}, isMounted: ${isMounted}, hasContainer: ${!!editorContainer}`,
    );
    if (!editorContainer || !isMounted) return;

    const format = getTargetFormat();
    currentFormat = format;
    console.log(
      `[ResponseBodyViewer] Target format: ${format}, isFileBacked: ${isFileBacked()}`,
    );

    // Clear any previous error
    hasError = false;
    errorMessage = "";

    // Check if we're dealing with a file-backed response
    if (isFileBacked()) {
      await loadFileBackedContent(format);
    } else {
      // Small response - use in-memory content directly
      loadInMemoryContent(format);
    }
  }

  /**
   * Load content from file-backed storage
   */
  async function loadFileBackedContent(format: ResponseFormat) {
    console.log(
      `[ResponseBodyViewer] loadFileBackedContent - tabId: ${tabId}, format: ${format}`,
    );
    // Check if editor already has initialized content for this format
    if (hasInitializedEditor(tabId, format)) {
      console.log(
        `[ResponseBodyViewer] Editor already initialized, re-attaching to current container`,
      );
      // Need to re-attach editor to current container (in case component was remounted)
      // setupEditor will handle re-parenting without re-initializing content
      const cachedContent = getCachedContent(tabId, format);
      if (cachedContent) {
        setupEditor(format, cachedContent);
      } else {
        // Fallback: just show the editor
        showTabEditor(tabId, format);
      }
      return;
    }

    // Check if formatted content is ready in cache
    const cachedContent = getCachedContent(tabId, format);
    if (cachedContent) {
      console.log(
        `[ResponseBodyViewer] Found cached content, length: ${cachedContent?.length || 0}`,
      );
      // Initialize editor with cached content
      setupEditor(format, cachedContent);
      return;
    }

    // Need to format the content - show loading
    console.log(`[ResponseBodyViewer] Need to format content`);
    isLoading = true;
    loadingMessage =
      format === "raw" ? "Loading response..." : `Formatting as ${format}...`;

    try {
      // Get or create formatted content (triggers formatting if needed)
      const content = await getFormattedResponse({
        tabId,
        format,
        onProgress: (stage) => {
          console.log(`[ResponseBodyViewer] Formatting progress: ${stage}`);
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
              loadingMessage = "";
              break;
          }
        },
      });

      console.log(
        `[ResponseBodyViewer] Formatted content received, length: ${content?.length || 0}`,
      );
      // Initialize editor with content
      setupEditor(format, content);
    } catch (e: any) {
      console.error("Failed to load file-backed content:", e);
      hasError = true;
      errorMessage = e?.message || "Failed to load response content";
    } finally {
      isLoading = false;
      loadingMessage = "";
    }
  }

  /**
   * Load in-memory content (small responses)
   */
  function loadInMemoryContent(format: ResponseFormat) {
    const content = response?.body || "";
    console.log(
      `[ResponseBodyViewer] loadInMemoryContent - tabId: ${tabId}, format: ${format}, contentLength: ${content.length}`,
    );

    // For small responses, always re-attach the editor to ensure it's in the current container
    // setupEditor will skip re-initialization if content hash matches
    console.log(
      `[ResponseBodyViewer] Setting up editor for in-memory content (will re-parent if needed)`,
    );
    setupEditor(format, content);
  }

  /**
   * Setup CodeMirror editor with content
   */
  function setupEditor(format: ResponseFormat, content: string) {
    console.log(
      `[ResponseBodyViewer] setupEditor - tabId: ${tabId}, format: ${format}, contentLength: ${content?.length || 0}`,
    );
    if (!editorContainer) return;

    const extensions = [
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
      // GPU acceleration for smooth scrolling
      EditorView.scrollMargins.of(() => ({
        top: 200,
        bottom: 200,
      })),
    ];

    // Get or create cached editor
    const cached = getOrCreateEditor(
      tabId,
      format,
      extensions,
      editorContainer,
    );
    console.log(
      `[ResponseBodyViewer] Got editor from cache, initialized: ${cached.initialized}`,
    );

    // Initialize with content if not already done
    if (!cached.initialized) {
      console.log(`[ResponseBodyViewer] Initializing editor with content`);
      initializeEditorContent(tabId, format, content);
    }

    // Show this format's editor, hide others
    console.log(`[ResponseBodyViewer] Showing editor for format: ${format}`);
    showTabEditor(tabId, format);
  }

  /**
   * Handle format changes (user switches dropdown)
   */
  function handleFormatChange() {
    console.log(
      `[ResponseBodyViewer] handleFormatChange - isMounted: ${isMounted}`,
    );
    if (!isMounted) return;
    const newFormat = getTargetFormat();
    console.log(
      `[ResponseBodyViewer] Format change detected - old: ${currentFormat}, new: ${newFormat}`,
    );
    if (newFormat !== currentFormat) {
      loadContent();
    }
  }

  // Lifecycle
  onMount(() => {
    console.log(`[ResponseBodyViewer] onMount - tabId: ${tabId}`);
    isMounted = true;
    loadContent();
  });

  onDestroy(() => {
    console.log(`[ResponseBodyViewer] onDestroy - tabId: ${tabId}`);
    isMounted = false;
    // Hide editors when component unmounts (but don't destroy - they're cached)
    hideTabEditors(tabId);
  });

  // React to apiState changes (format dropdown)
  $: if (apiState && isMounted) {
    console.log(
      `[ResponseBodyViewer] apiState changed - tabId: ${tabId}, bodyFormatter: ${apiState?.bodyFormatter}, bodyLanguage: ${apiState?.bodyLanguage}`,
    );
    handleFormatChange();
  }
</script>

<div class="response-body-viewer w-100 h-100">
  {#if isLoading}
    <div class="loading-overlay">
      <Loader loaderSize="20px" />
      <span class="loading-message">{loadingMessage}</span>
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
    class:hidden={isLoading || hasError}
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
