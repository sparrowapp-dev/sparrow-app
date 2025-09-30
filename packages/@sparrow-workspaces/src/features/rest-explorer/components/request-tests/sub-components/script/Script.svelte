<script lang="ts">
  import { Editor, Search, Input } from "@sparrow/library/forms";
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
    SearchIcon2,
    StopFilledIcon,
    ThumbDislikeRegular,
    ThumbLikeRegular,
    ArrowSyncRegular,
  } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { predefinedTestSnippets } from "./utils/common-snippets";
  import RequestTabTourGuide from "../../../../../request-tab-tour-guide/layout/RequestTabTourGuide.svelte";
  import { requestTabTestScriptStep } from "../../../../../../stores";
  import { RequestTabTestsScriptTourContent } from "../../../../../request-tab-tour-guide";
  import TourGuideCard from "../../../../../request-tab-tour-guide/components/TourGuideCard.svelte";
  import {
    handleNextStep,
    handleCloseTour,
  } from "../../../../../request-tab-tour-guide/utils";
  import { requestTabScriptCardPosition } from "../../../../../request-tab-tour-guide/utils";
  import { SparkleColoredIcon, SparkleFilledIcon } from "@sparrow/common/icons";
  import { generatingImage } from "@sparrow/common/images";
  import { fade, fly } from "svelte/transition";
  import { WorkspaceRole } from "@sparrow/common/enums";

  import { tick, onDestroy } from "svelte";
  import { Tooltip } from "@sparrow/library/ui";

  export let onTestsChange;
  export let tests;
  export let onGenerateTestCases;
  export let isTestCasesGenerating;
  export let isGuestUser;
  export let userRole;

  type SplitDirection = "vertical" | "horizontal";
  type EditorLanguage = "TestJavaScript";

  // Snippet type (based on your utils/common-snippets.ts)
  interface Snippet {
    title: string;
    function: string;
  }

  export let tabSplitDirection: SplitDirection = "vertical";
  export let lang: EditorLanguage = "TestJavaScript";

  export let isBodyBeautified: boolean = false;

  let searchData: string = "";
  let isLeftPanelCollapsed: boolean = false;

  let testCasePrompt = "";
  let errorMessage: string = "";
  let isError: boolean = false;

  // AI generation states
  let showGeneratedTestActions = false;
  let generatedTestContent = "";
  let originalTestContent = "";
  let currentPrompt = "";
  let originalLineCount = 0;

  // Persistent highlighting variables
  let observer: MutationObserver | null = null;
  let highlightInterval: number | null = null;
  let rafId: number | null = null;
  let clickHandlers: (() => void)[] = [];
  let isUserLimitReached: boolean = false;
  let generatedContentStartLine = 0;
  let generatedContentEndLine = 0;

  // Preprocess search string
  $: trimmedSearch = searchData.trim().toLowerCase();

  // Filtered snippets (only title considered)
  $: filteredSnippets = !trimmedSearch
    ? predefinedTestSnippets
    : predefinedTestSnippets.filter((s: Snippet) =>
        s.title.toLowerCase().includes(trimmedSearch),
      );

  const updateBeautifiedState = (val: boolean): void => {
    isBodyBeautified = val;
  };
  //handler function to remove the changes on tab switch
  export const handleTabChange = () => {
    if (showGeneratedTestActions) {
      rejectGeneratedTest();
    }
  };

  const handleCodeMirrorChange = (e: any) => {
    onTestsChange({ ...tests, script: e.detail });

    // Re-apply highlights immediately after any content change if we have generated content
    if (showGeneratedTestActions) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        highlightGeneratedContent();
        // Double-check after a tiny delay
        setTimeout(() => highlightGeneratedContent(), 1);
      });
    }
  };

  const toggleLeftPanel = (): void => {
    isLeftPanelCollapsed = !isLeftPanelCollapsed;
  };

  const selectSnippet = (data: string): void => {
    let value = tests?.script || "";
    value += value ? `\n${data}` : data;
    onTestsChange({ ...tests, script: value });
  };

  const highlightMatch = (text: string, searchTerm: string): string => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  };

  // Panel widths
  $: leftPanelWidth = isLeftPanelCollapsed
    ? "40px"
    : tabSplitDirection === "vertical"
      ? "40%"
      : "25%";

  $: rightPanelWidth = isLeftPanelCollapsed ? "calc(100% - 60px)" : "75%";

  const handleGenerateTestCases = async () => {
    // Store the original content and current prompt
    originalTestContent = tests?.script || "";
    originalLineCount = originalTestContent.trim()
      ? originalTestContent.split("\n").length
      : 0;
    currentPrompt = testCasePrompt;

    const result = await onGenerateTestCases(testCasePrompt);
    if (result?.error) {
      if (result?.message === "Limit reached. Please try again later.") {
        isUserLimitReached = true;
      }
      isError = true;
      errorMessage =
        "This request is a bit tricky to turn into a test. Please try rephrasing it in a simpler way.";
    } else if (result?.generatedContent) {
      isError = false;
      errorMessage = "";
      testCasePrompt = "";
      generatedTestContent = result.generatedContent;

      // Directly insert the generated content into the editor
      await insertGeneratedContentDirectly();

      // Show the action buttons
      showGeneratedTestActions = true;
    } else {
      isError = false;
      errorMessage = "";
      testCasePrompt = "";
    }
  };
  const insertGeneratedContentDirectly = async () => {
    // Insert the generated test content into the current script
    const currentScript = tests?.script || "";

    // Calculate the exact line positions where generated content will be placed
    const currentLines = currentScript ? currentScript.split("\n") : [];
    const separator = currentScript ? "\n\n" : "";

    // Store where generated content starts
    generatedContentStartLine = currentLines.length + (currentScript ? 2 : 0);

    // Store where generated content ends
    const generatedContentLines = generatedTestContent.split("\n");
    generatedContentEndLine =
      generatedContentStartLine + generatedContentLines.length - 1;

    const newScript = currentScript + separator + generatedTestContent;

    onTestsChange({
      ...tests,
      script: newScript,
    });

    await tick();

    setTimeout(() => {
      startPersistentHighlighting();
    }, 100);
  };

  const startPersistentHighlighting = () => {
    // Initial highlight
    highlightGeneratedContent();

    // Set up mutation observer to watch for DOM changes
    setupHighlightObserver();

    // Set up very frequent interval for continuous re-application
    if (highlightInterval) clearInterval(highlightInterval);
    highlightInterval = setInterval(() => {
      if (showGeneratedTestActions) {
        highlightGeneratedContent();
      }
    }, 5); // Very frequent re-application
    setupInteractionListeners();
  };

  const setupInteractionListeners = () => {
    const editorEl = document.querySelector(".cm-editor");
    if (!editorEl) return;

    // Clear existing handlers
    clickHandlers.forEach((handler, i) => {
      const el = document.querySelector(".cm-editor");
      if (el) {
        el.removeEventListener("click", handler);
        el.removeEventListener("mousedown", handler);
        el.removeEventListener("mouseup", handler);
        el.removeEventListener("keydown", handler);
        el.removeEventListener("keyup", handler);
        el.removeEventListener("focus", handler);
      }
    });
    clickHandlers = [];
    // Handler for all types of interactions
    const interactionHandler = () => {
      if (showGeneratedTestActions) {
        // Immediate highlight
        highlightGeneratedContent();
      }
    };
    // Add to our list for cleanup
    clickHandlers.push(interactionHandler);

    // Add listeners for all possible interaction events
    editorEl.addEventListener("click", interactionHandler);
    editorEl.addEventListener("mousedown", interactionHandler);
    editorEl.addEventListener("mouseup", interactionHandler);
    editorEl.addEventListener("keydown", interactionHandler);
    editorEl.addEventListener("keyup", interactionHandler);
    editorEl.addEventListener("focus", interactionHandler);
    editorEl.addEventListener("blur", interactionHandler);
    editorEl.addEventListener("input", interactionHandler);

    // Also add listeners to document to catch any clicks outside
    document.addEventListener("click", interactionHandler);
    document.addEventListener("mousedown", interactionHandler);
    document.addEventListener("mouseup", interactionHandler);
  };

  const setupHighlightObserver = () => {
    if (observer) observer.disconnect();

    const editorEl = document.querySelector(".cm-editor");
    if (!editorEl) return;

    observer = new MutationObserver((mutations) => {
      if (showGeneratedTestActions) {
        // Use requestAnimationFrame for immediate re-highlighting
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          highlightGeneratedContent();
          // Multiple checks to ensure persistence
          setTimeout(() => highlightGeneratedContent(), 0);
          setTimeout(() => highlightGeneratedContent(), 1);
          setTimeout(() => highlightGeneratedContent(), 5);
        });
      }
    });

    observer.observe(editorEl, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  };

  const highlightGeneratedContent = () => {
    const lines = document.querySelectorAll(".cm-line");

    if (lines.length === 0) {
      return;
    }

    // Clear all existing highlights first
    lines.forEach((line) => {
      const element = line as HTMLElement;
      element.classList.remove("highlight-generated-line");
      element.style.removeProperty("background-color");
    });

    // Only highlight lines within the generated content range
    lines.forEach((line, index) => {
      if (
        index >= generatedContentStartLine &&
        index <= generatedContentEndLine
      ) {
        const element = line as HTMLElement;
        const lineText = element.textContent?.trim() || "";

        // Only highlight if line has content (skip empty lines within range)
        if (lineText) {
          element.classList.add("highlight-generated-line");
          element.style.setProperty(
            "background-color",
            "var(--bg-ds-surface-400)",
            "important",
          );
        }
      }
    });
  };
  const removeHighlight = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (highlightInterval) {
      clearInterval(highlightInterval);
      highlightInterval = null;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Remove event listeners
    clickHandlers.forEach((handler) => {
      const editorEl = document.querySelector(".cm-editor");
      if (editorEl) {
        editorEl.removeEventListener("click", handler);
        editorEl.removeEventListener("mousedown", handler);
        editorEl.removeEventListener("mouseup", handler);
        editorEl.removeEventListener("keydown", handler);
        editorEl.removeEventListener("keyup", handler);
        editorEl.removeEventListener("focus", handler);
        editorEl.removeEventListener("blur", handler);
        editorEl.removeEventListener("input", handler);
      }
      document.removeEventListener("click", handler);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("mouseup", handler);
    });
    clickHandlers = [];

    // Remove highlights from all lines
    const highlightedLines = document.querySelectorAll(
      ".highlight-generated-line",
    );
    highlightedLines.forEach((line) => {
      const element = line as HTMLElement;
      element.style.removeProperty("background-color");
      element.classList.remove("highlight-generated-line");
    });
    generatedContentStartLine = 0;
    generatedContentEndLine = 0;
  };

  const acceptGeneratedTest = () => {
    removeHighlight();

    // Keep the generated content that's already in the editor
    showGeneratedTestActions = false;
    generatedTestContent = "";
    originalTestContent = "";
    currentPrompt = "";
    originalLineCount = 0;
    generatedContentStartLine = 0;
    generatedContentEndLine = 0;
  };

  const rejectGeneratedTest = () => {
    removeHighlight();

    // Revert to original content
    onTestsChange({ ...tests, script: originalTestContent });
    showGeneratedTestActions = false;
    generatedTestContent = "";
    originalTestContent = "";
    currentPrompt = "";
    originalLineCount = 0;
  };

  const regenerateTest = async () => {
    // Remove current highlights
    removeHighlight();

    // Hide the action buttons immediately when regeneration starts
    showGeneratedTestActions = false;

    // Revert to original content first
    onTestsChange({ ...tests, script: originalTestContent });

    // Use the same prompt to regenerate
    const result = await onGenerateTestCases(currentPrompt);
    if (result?.error) {
      isError = true;
      errorMessage =
        "This request is a bit tricky to turn into a test. Please try rephrasing it in a simpler way.";
    } else if (result?.generatedContent) {
      isError = false;
      errorMessage = "";
      generatedTestContent = result.generatedContent;

      // Insert the new generated content
      await insertGeneratedContentDirectly();

      // Show the action buttons again
      showGeneratedTestActions = true;
    }
  };

  onDestroy(() => {
    if (observer) observer.disconnect();
    if (highlightInterval) clearInterval(highlightInterval);
    if (rafId) cancelAnimationFrame(rafId);

    // Remove event listeners
    clickHandlers.forEach((handler) => {
      const editorEl = document.querySelector(".cm-editor");
      if (editorEl) {
        editorEl.removeEventListener("click", handler);
        editorEl.removeEventListener("mousedown", handler);
        editorEl.removeEventListener("mouseup", handler);
        editorEl.removeEventListener("keydown", handler);
        editorEl.removeEventListener("keyup", handler);
        editorEl.removeEventListener("focus", handler);
        editorEl.removeEventListener("blur", handler);
        editorEl.removeEventListener("input", handler);
      }
      document.removeEventListener("click", handler);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("mouseup", handler);
    });
  });
</script>

<div class="border border-top-0 text-light p-2 h-100 rounded-bottom">
  <div class="d-flex h-100 flex-row">
    <!-- Left Sidebar -->
    <div
      class="h-100 d-flex flex-column {isLeftPanelCollapsed
        ? 'collapsed-panel'
        : ''}"
      style="width:{leftPanelWidth};gap:6px;overflow:hidden;transition:width 0.3s ease;"
      id="request-tab-test-script-leftpanel"
    >
      {#if isLeftPanelCollapsed}
        <!-- Collapsed -->
        <div
          class="collapsed-content d-flex flex-column align-items-center h-100"
          style="padding:8px 4px;"
        >
          <Button
            onClick={toggleLeftPanel}
            size="extra-small"
            startIcon={ChevronDoubleRightRegular}
            type="teritiary-regular"
          />
          <div class="mt-2">
            <span class="vertical-text">Snippets</span>
          </div>
        </div>
      {:else}
        <!-- Expanded -->
        <div
          class="d-flex flex-row justify-content-between align-items-center flex-shrink-0"
          style="margin:8px 4px 8px 8px;"
        >
          <p class="snippet-text m-0">Snippets</p>
          <Button
            onClick={toggleLeftPanel}
            size="extra-small"
            startIcon={ChevronDoubleLeftRegular}
            type="teritiary-regular"
          />
        </div>

        <!-- Search -->
        <div class="d-flex justify-content-center flex-shrink-0 mb-2">
          <Search
            id="script-snippet-search"
            variant="primary"
            size="small"
            bind:value={searchData}
            placeholder="Search snippets"
          />
        </div>

        <!-- Snippets list -->
        <div class="flex-grow-1" style="overflow:auto;min-height:0;">
          {#if filteredSnippets.length > 0}
            {#each filteredSnippets as snippet}
              <div
                class="mb-2 d-flex align-items-center snippet-suggestion-container"
                tabindex="0"
                role="button"
                on:click={() => selectSnippet(snippet.function)}
                on:keydown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectSnippet(snippet.function);
                  }
                }}
              >
                <p class="suggestion-text">
                  {@html highlightMatch(snippet.title, searchData)}
                </p>
              </div>
            {/each}
          {:else if trimmedSearch}
            <div class="no-results">
              <div
                class="d-flex justify-content-center align-items-center"
                style="margin-bottom: 16px;"
              >
                <SearchIcon2
                  width={"20px"}
                  height={"20px"}
                  color={"var(--bg-ds-neutral-300)"}
                />
              </div>
              <p class="no-results-text">
                No result found for "{searchData}"
              </p>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Right Panel -->
    <div
      class="h-100 d-flex flex-column border-start ms-2 ps-2"
      style="width:{rightPanelWidth}; transition:width 0.3s ease;"
    >
      <div
        style="flex:1 1 auto; overflow-y:auto; overflow-x:hidden; min-height:0;"
      >
        <Editor
          bind:lang
          value={tests?.script || ""}
          on:change={handleCodeMirrorChange}
          isEditable={true}
          autofocus={true}
          placeholder={`// What are the tests?\n// Tests are scripts that automatically check your API's response.\n// For example: Is the status code 200? Does the body contain an email field?\n// sp.test("Status code is 200", function () {\n//   sp.expect(sp.response.statusCode).to.equal(200);\n// });\n\n// You can:\n// - Use "Snippets" to insert common tests\n// - Or, write test cases manually using scripting or no code method`}
          {isBodyBeautified}
          beautifySyntaxCallback={updateBeautifiedState}
        />
      </div>
      {#if !isGuestUser && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
        <div style="flex:0 0 auto; width:100%; margin-top:4px;">
          <div style="position:relative;">
            {#if errorMessage}
              <div class="input-error">{errorMessage}</div>
            {/if}

            {#if showGeneratedTestActions}
              <div
                class="d-flex align-items-center generated-test-actions"
                style="gap: 12px;"
                in:fly={{ y: 20, duration: 300 }}
              >
                <div
                  class="text-ds-font-size-12"
                  style="color: var(--text-ds-neutral-500);"
                >
                  Do you want to use this generated test in your script?
                </div>
                <div class="actionable-button">
                  <Tooltip title="Yes" placement="top-center" size="small">
                    <Button
                      size="small"
                      type="outline-primary"
                      startIcon={ThumbLikeRegular}
                      onClick={acceptGeneratedTest}
                    />
                  </Tooltip>
                  <Tooltip title="No" placement="top-center" size="small">
                    <Button
                      size="small"
                      type="outline-primary"
                      startIcon={ThumbDislikeRegular}
                      onClick={rejectGeneratedTest}
                    />
                  </Tooltip>
                  <Tooltip
                    title="Regenerate"
                    placement="top-center"
                    size="small"
                  >
                    <Button
                      size="small"
                      type="outline-primary"
                      startIcon={ArrowSyncRegular}
                      onClick={regenerateTest}
                    />
                  </Tooltip>
                </div>
              </div>
            {/if}

            {#if isTestCasesGenerating}
              <p
                class="text-primary-300 generating-img d-flex justify-content-center align-items-center"
                in:fade={{ duration: 200 }}
              >
                <img src={generatingImage} style="width: 118px;" alt="" />
              </p>
            {/if}
            <div style="position: relative;">
              <Tooltip
                title="You’ve reached your monthly AI request limit. Upgrade your plan to continue using AI feature."
                placement="top-center"
                size="small"
                show={isUserLimitReached}
                distance={5}
              >
                <div class="input-with-button">
                  <Input
                    id="sparkle-input"
                    placeholder="Ask AI to generate a test"
                    startIcon={showGeneratedTestActions || isUserLimitReached
                      ? SparkleFilledIcon
                      : SparkleColoredIcon}
                    iconSize={16}
                    variant="secondary"
                    size="medium"
                    bind:value={testCasePrompt}
                    {isError}
                    disabled={showGeneratedTestActions || isUserLimitReached}
                    on:input={() => {
                      isError = false;
                      errorMessage = "";
                    }}
                  />
                </div>
              </Tooltip>

              <div
                style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%);"
              >
                <Button
                  size="small"
                  type="outline-secondary"
                  startIcon={isTestCasesGenerating ||
                  showGeneratedTestActions ||
                  isUserLimitReached ||
                  isError
                    ? SparkleFilledIcon
                    : SparkleColoredIcon}
                  title={"Generate"}
                  disable={showGeneratedTestActions ||
                    isUserLimitReached ||
                    isError}
                  onClick={() => {
                    if (!isTestCasesGenerating) {
                      if (testCasePrompt.trim()) {
                        handleGenerateTestCases();
                      } else {
                        isError = true;
                        errorMessage =
                          "Please enter a prompt before generating.";
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  {#if $requestTabTestScriptStep === 3}
    <RequestTabTourGuide
      targetId={RequestTabTestsScriptTourContent[2].targetId}
      isVisible={true}
      cardPosition={requestTabScriptCardPosition(3)}
    >
      <TourGuideCard
        titleName={RequestTabTestsScriptTourContent[2].Title}
        descriptionContent={RequestTabTestsScriptTourContent[2].description}
        cardNumber={3}
        totalsCards={RequestTabTestsScriptTourContent.length}
        rightButtonName=""
        onNext={handleNextStep}
        onClose={handleCloseTour}
        width={352}
      />
    </RequestTabTourGuide>
  {/if}
</div>

<style>
  .input-with-button :global(input) {
    padding-right: 120px !important;
  }
  .input-error {
    color: var(--text-ds-danger-300, #e74c3c);
    font-size: 12px;
    margin-bottom: 4px;
    text-align: left;
  }
  .snippet-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: var(--text-ds-neutral-50);
  }

  .results-count {
    font-weight: 400;
    color: var(--text-ds-neutral-400);
    font-size: 11px;
  }

  .snippet-suggestion-container {
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .snippet-suggestion-container:hover {
    background-color: var(--bg-ds-surface-400);
  }

  .snippet-suggestion-container:active {
    background-color: var(--bg-ds-surface-700);
  }

  .snippet-suggestion-container:focus-visible {
    outline: none;
    background-color: var(--bg-ds-surface-600);
    border: 2px solid var(--bg-ds-primary-300);
  }

  .suggestion-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: var(--text-ds-primary-300);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .no-results {
    padding: 38px 8px 12px 8px;
    text-align: center;
  }

  .no-results-text {
    font-weight: 500;
    font-size: 12px;
    color: var(--text-ds-neutral-300);
    margin: 0 0 8px 0;
  }

  .no-results-suggestion {
    font-weight: 400;
    font-size: 11px;
    color: var(--text-ds-neutral-400);
    margin: 0;
  }

  :global(.search-highlight) {
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    padding: 1px 2px;
    border-radius: 2px;
    font-weight: 600;
  }

  .collapsed-content {
    height: 100%;
  }

  .vertical-text {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 12px;
    color: var(--text-ds-neutral-50);
    font-family: "Inter", sans-serif;
    font-weight: 500;
  }

  .generating-img {
    width: 100%;
    margin-bottom: 8px;
  }

  /* AI Generated Test Case Action Styles */
  .generated-test-actions {
    padding: 0 12px 4px 12px;
    margin-left: 40px;
  }

  .actionable-button {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .actionable-button :global(button) {
    border: none !important;
  }

  :global(.highlight-generated-line) {
    background-color: var(--bg-ds-surface-400) !important;
  }
</style>
