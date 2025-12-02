<script lang="ts">
  import { Editor, Search, Input } from "@sparrow/library/forms";
  import {
    SearchIcon2,
    ChevronDownRegular,
    ChevronUpRegular,
    ThumbDislikeRegular,
    ThumbLikeRegular,
    ArrowSyncRegular,
    StopFilledIcon,
  } from "@sparrow/library/icons";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { predefinedTestSnippets } from "./utils/common-snippets";
  import { SparkleColoredIcon, SparkleFilledIcon } from "@sparrow/common/icons";
  import { generatingImage } from "@sparrow/common/images";
  import { fade, fly } from "svelte/transition";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { tick, onDestroy } from "svelte";
  import {
    loadingState,
    startLoading,
    stopLoading,
  } from "@sparrow/common/store";

  export let onTestsChange;
  export let tests;
  export let onGeneratePreScript;
  export let isGuestUser;
  export let userRole;
  export let node_id;
  export let tab;

  type EditorLanguage = "PreTestJavaScript";

  interface Snippet {
    title: string;
    function: string;
  }
  export let lang: EditorLanguage = "PreTestJavaScript";
  export let isBodyBeautified: boolean = false;

  let searchData: string = "";
  let testCasePrompt = "";
  let errorMessage: string = "";
  let isError: boolean = false;
  let isSnippetDropdownOpen: boolean = false;
  let snippetDropdownElement: HTMLElement;

  // AI generation states (from first file)
  let showGeneratedTestActions = false;
  let generatedTestContent = "";
  let originalTestContent = "";
  let currentPrompt = "";
  let originalLineCount = 0;
  let temporaryDisplayContent = "";
  let contentAddedDuringGeneration = "";

  // Persistent highlighting variables (from first file)
  let observer: MutationObserver | null = null;
  let highlightInterval: number | null = null;
  let rafId: number | null = null;
  let clickHandlers: (() => void)[] = [];
  let isUserLimitReached: boolean = false;
  let generatedContentStartLine = 0;
  let generatedContentEndLine = 0;
  let isSnippetTypingState = false;
  $: isPreScriptGenerating = $loadingState.get(
    tab.tabId + "generatingPreScriptforTestflow" + node_id,
  );

  // Preprocess search string
  $: trimmedSearch = searchData.trim().toLowerCase();

  // Filtered snippets
  $: filteredSnippets = !trimmedSearch
    ? predefinedTestSnippets
    : predefinedTestSnippets.filter((s: Snippet) =>
        s.title.toLowerCase().includes(trimmedSearch),
      );

  const toggleSnippetDropdown = () => {
    isSnippetDropdownOpen = !isSnippetDropdownOpen;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      snippetDropdownElement &&
      !snippetDropdownElement.contains(event.target as Node)
    ) {
      isSnippetDropdownOpen = false;
      isSnippetTypingState = false;
    }
  };

  $: if (typeof window !== "undefined") {
    if (isSnippetDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
  }

  onDestroy(() => {
    if (typeof window !== "undefined") {
      document.removeEventListener("click", handleClickOutside);
    }

    // Cleanup from first file
    if (observer) observer.disconnect();
    if (highlightInterval) clearInterval(highlightInterval);
    if (rafId) cancelAnimationFrame(rafId);

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

  const updateBeautifiedState = (val: boolean): void => {
    isBodyBeautified = val;
  };

  //handler function to remove the changes on tab switch (from first file)
  export const handleTabChange = () => {
    if (showGeneratedTestActions) {
      rejectGeneratedTest();
    }
  };

  const handleCodeMirrorChange = (e: any) => {
    const newContent = e.detail;
    if (showGeneratedTestActions) {
      const newLines = newContent.split("\n");

      // Check if lines in the generated range have been modified
      let generatedContentModified = false;
      const originalGeneratedLines = generatedTestContent.split("\n");

      for (let i = 0; i < originalGeneratedLines.length; i++) {
        const lineIndex = generatedContentStartLine + i;
        if (lineIndex < newLines.length) {
          if (newLines[lineIndex] !== originalGeneratedLines[i]) {
            generatedContentModified = true;
            break;
          }
        } else {
          generatedContentModified = true;
          break;
        }
      }

      if (generatedContentModified) {
        // Generated content was modified - block the change
        tick().then(() => {
          temporaryDisplayContent = temporaryDisplayContent;
          recalculateGeneratedContentLines();
          highlightGeneratedContent();
        });
        return;
      }

      // Generated content is intact - allow the change
      temporaryDisplayContent = newContent;

      // Extract only the non-generated content for saving
      const nonGeneratedLines = [];
      const allLines = newContent.split("\n");

      for (let i = 0; i < allLines.length; i++) {
        if (i < generatedContentStartLine || i > generatedContentEndLine) {
          nonGeneratedLines.push(allLines[i]);
        }
      }

      const nonGeneratedContent = nonGeneratedLines.join("\n");
      onTestsChange({ ...tests, preScript: nonGeneratedContent });
    } else {
      // Normal behavior when no generated content is protected
      onTestsChange({ ...tests, preScript: newContent });
    }

    // Re-apply highlights if we have generated content
    if (showGeneratedTestActions) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        highlightGeneratedContent();
      });
    }
  };

  // Helper function to recalculate line positions after content changes
  const recalculateGeneratedContentLines = () => {
    if (!generatedTestContent || !temporaryDisplayContent) return;

    const allLines = temporaryDisplayContent.split("\n");
    const generatedLines = generatedTestContent.split("\n");

    let foundStart = -1;

    const searchStart = Math.max(0, generatedContentStartLine - 1);
    const searchEnd = Math.min(
      allLines.length - generatedLines.length + 1,
      generatedContentStartLine + 3,
    );

    for (let i = searchStart; i < searchEnd; i++) {
      let matches = true;

      for (let j = 0; j < generatedLines.length; j++) {
        if (i + j >= allLines.length || allLines[i + j] !== generatedLines[j]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        const hasProperContext =
          i === 0 ||
          (originalTestContent && i > 0) ||
          (!originalTestContent && i === 0);

        if (hasProperContext) {
          foundStart = i;
          break;
        }
      }
    }

    if (foundStart >= 0) {
      generatedContentStartLine = foundStart;
      generatedContentEndLine = foundStart + generatedLines.length - 1;
    }
  };

  const selectSnippet = (data: string): void => {
    let value = showGeneratedTestActions
      ? temporaryDisplayContent
      : tests?.preScript || "";

    const newValue = value ? `${value}\n${data}` : data;

    if (showGeneratedTestActions) {
      const snippetLines = data.split("\n").length;
      const addedNewlines = value ? 1 : 0;

      temporaryDisplayContent = newValue;

      const oldLines = value.split("\n");
      const insertionPoint = oldLines.length;

      if (insertionPoint <= generatedContentStartLine) {
        generatedContentStartLine += snippetLines + addedNewlines;
        generatedContentEndLine += snippetLines + addedNewlines;
      }

      contentAddedDuringGeneration = contentAddedDuringGeneration
        ? `${contentAddedDuringGeneration}\n${data}`
        : data;

      setTimeout(() => {
        highlightGeneratedContent();
      }, 0);
    } else {
      onTestsChange({ ...tests, preScript: newValue });
    }
  };

  const highlightMatch = (text: string, searchTerm: string): string => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  };

  const handleGenerateTestCases = async () => {
    originalTestContent = tests?.preScript || "";
    contentAddedDuringGeneration = "";
    originalLineCount = originalTestContent.trim()
      ? originalTestContent.split("\n").length
      : 0;
    currentPrompt = testCasePrompt;

    // Use loadingState for AI generation
    const loadingKey = tab.tabId + "generatingPreScriptforTestflow" + node_id;
    startLoading(loadingKey);
    if (onGeneratePreScript) {
      try {
        const result = await onGeneratePreScript(testCasePrompt, node_id);
        if (result?.error) {
          if (result?.message === "Limit reached. Please try again later.") {
            isUserLimitReached = true;
            isError = true;
            testCasePrompt = "";
            await tick();
          } else {
            isError = true;
            errorMessage =
              "This request is a bit tricky to turn into a test. Please try rephrasing it in a simpler way.";
          }
        } else if (result?.generatedContent) {
          isError = false;
          errorMessage = "";
          testCasePrompt = "";
          generatedTestContent = result.generatedContent;
          await showGeneratedContentTemporarily();
          showGeneratedTestActions = true;
        } else {
          isError = false;
          errorMessage = "";
          testCasePrompt = "";
        }
      } finally {
        stopLoading(loadingKey);
      }
    } else {
      stopLoading(loadingKey);
    }
  };

  const showGeneratedContentTemporarily = async () => {
    // Calculate line positions for highlighting (from first file)
    const currentScript = originalTestContent;
    const separator = currentScript ? "\n\n" : "";

    temporaryDisplayContent = currentScript + separator + generatedTestContent;

    const originalLines = currentScript ? currentScript.split("\n") : [];
    const separatorLines = separator ? separator.split("\n") : [];

    generatedContentStartLine =
      originalLines.length + separatorLines.length - 1;
    if (currentScript && separator) {
      generatedContentStartLine = originalLines.length + 1;
    } else if (!currentScript) {
      generatedContentStartLine = 0;
    }

    const generatedLines = generatedTestContent.split("\n");
    generatedContentEndLine =
      generatedContentStartLine + generatedLines.length - 1;

    await tick();

    setTimeout(() => {
      startPersistentHighlighting();
    }, 100);
  };

  const startPersistentHighlighting = () => {
    highlightGeneratedContent();
    setupHighlightObserver();

    if (highlightInterval) clearInterval(highlightInterval);
    highlightInterval = setInterval(() => {
      if (showGeneratedTestActions) {
        highlightGeneratedContent();
      }
    }, 5);
    setupInteractionListeners();
  };

  const setupInteractionListeners = () => {
    const editorEl = document.querySelector(".cm-editor");
    if (!editorEl) return;

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

    const interactionHandler = () => {
      if (showGeneratedTestActions) {
        highlightGeneratedContent();
      }
    };

    clickHandlers.push(interactionHandler);

    editorEl.addEventListener("click", interactionHandler);
    editorEl.addEventListener("mousedown", interactionHandler);
    editorEl.addEventListener("mouseup", interactionHandler);
    editorEl.addEventListener("keydown", interactionHandler);
    editorEl.addEventListener("keyup", interactionHandler);
    editorEl.addEventListener("focus", interactionHandler);
    editorEl.addEventListener("blur", interactionHandler);
    editorEl.addEventListener("input", interactionHandler);

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
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          highlightGeneratedContent();
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

    lines.forEach((line) => {
      const element = line as HTMLElement;
      element.classList.remove("highlight-generated-line");
      element.style.removeProperty("background-color");
    });

    lines.forEach((line, index) => {
      if (
        index >= generatedContentStartLine &&
        index <= generatedContentEndLine
      ) {
        const element = line as HTMLElement;
        const lineText = element.textContent?.trim() || "";

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

    onTestsChange({ ...tests, preScript: temporaryDisplayContent });

    showGeneratedTestActions = false;
    generatedTestContent = "";
    originalTestContent = "";
    temporaryDisplayContent = "";
    currentPrompt = "";
    originalLineCount = 0;
    generatedContentStartLine = 0;
    generatedContentEndLine = 0;
    contentAddedDuringGeneration = "";
  };

  const rejectGeneratedTest = () => {
    removeHighlight();

    let revertedContent = originalTestContent || "";

    if (contentAddedDuringGeneration) {
      revertedContent = revertedContent
        ? `${revertedContent}\n${contentAddedDuringGeneration}`
        : contentAddedDuringGeneration;
    }

    onTestsChange({ ...tests, preScript: revertedContent });

    showGeneratedTestActions = false;
    generatedTestContent = "";
    originalTestContent = "";
    temporaryDisplayContent = "";
    currentPrompt = "";
    originalLineCount = 0;
    generatedContentStartLine = 0;
    generatedContentEndLine = 0;
    contentAddedDuringGeneration = "";
  };

  const regenerateTest = async () => {
    removeHighlight();

    showGeneratedTestActions = false;

    temporaryDisplayContent = originalTestContent;
    startLoading(tab.tabId + "generatingPreScriptforTestflow" + node_id);
    const result = await onGeneratePreScript(currentPrompt, node_id);
    if (result?.error) {
      stopLoading(tab.tabId + "generatingPreScriptforTestflow" + node_id);
      isError = true;
      errorMessage =
        "This request is a bit tricky to turn into a test. Please try rephrasing it in a simpler way.";
    } else if (result?.generatedContent) {
      stopLoading(tab.tabId + "generatingPreScriptforTestflow" + node_id);
      isError = false;
      errorMessage = "";
      generatedTestContent = result.generatedContent;

      await showGeneratedContentTemporarily();

      showGeneratedTestActions = true;
    }
  };
</script>

<div
  class="border border-top-0 text-light p-2 h-100 rounded-bottom position-relative"
>
  <div class="d-flex h-100 flex-column">
    <!-- Editor Area -->
    <div
      class="editor-container"
      style="flex:1 1 auto; overflow:hidden; min-height:0;"
    >
      <Editor
        bind:lang
        value={showGeneratedTestActions
          ? temporaryDisplayContent
          : tests?.preScript || ""}
        on:change={handleCodeMirrorChange}
        isEditable={true}
        autofocus={true}
        placeholder={`// What are the Pre-Request tests?\n// It runs before your request is sent. Use them to set variables, headers, prepare data.\n// For example: Need a timestamp for every request?\n// sp.environment.set("timestamp", new Date());\n// sp.request.headers.set("Auth-Token", "12345");\n\n// You can:\n// - Use "Snippets" to insert common Pre-Requests\n// - Type a prompt and click "Generate" to create a Pre-Request using AI\n// - Or, write Pre-Requests manually using scripting`}
        isBodyBeautified={false}
        beautifySyntaxCallback={updateBeautifiedState}
      />
    </div>

    <!-- Bottom Bar with Snippets Dropdown and AI Input -->
    {#if !isGuestUser && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <div class="bottom-bar-wrapper">
        <!-- Dynamic Content Above Both Inputs -->
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
              <Tooltip title="Regenerate" placement="top-center" size="small">
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

        {#if isPreScriptGenerating}
          <p
            class="text-primary-300 generating-img d-flex justify-content-center align-items-center"
            in:fade={{ duration: 200 }}
          >
            <img src={generatingImage} style="width: 118px;" alt="" />
          </p>
        {/if}

        <!-- Bottom Bar with Both Inputs -->
        <div
          class="bottom-bar d-flex align-items-center"
          style="flex:0 0 auto; margin-top:8px; gap:8px;"
        >
          <!-- Snippets Dropdown (Left) -->
          <div
            class="snippet-dropdown-container"
            bind:this={snippetDropdownElement}
            on:click|stopPropagation
            on:mousedown|stopPropagation
          >
            {#if !isSnippetTypingState}
              <!-- Normal Snippets Button -->
              <div class="snippets-button">
                <Button
                  size="medium"
                  customWidth="151px"
                  type={isSnippetDropdownOpen ? "primary" : "outline-secondary"}
                  title="Snippets"
                  endIcon={isSnippetDropdownOpen
                    ? ChevronDownRegular
                    : ChevronUpRegular}
                  onClick={() => {
                    isSnippetDropdownOpen = true;
                    isSnippetTypingState = true;
                    searchData = "";
                  }}
                />
              </div>
            {:else}
              <!-- Typing State: Replace button with search input -->
              <div class="snippet-search-wrapper">
                <Input
                  placeholder="Search snippets..."
                  variant="secondary"
                  size="medium"
                  bind:value={searchData}
                  autofocus={true}
                  on:click={(e) => e.stopPropagation()}
                />
                <div
                  class="snippet-close-icon"
                  on:click={() => {
                    isSnippetDropdownOpen = false;
                    isSnippetTypingState = false;
                    searchData = "";
                  }}
                >
                  <ChevronDownRegular width="16px" height="16px" />
                </div>
              </div>
            {/if}

            {#if isSnippetDropdownOpen}
              <div class="snippet-dropdown-menu">
                <!-- Snippets List -->
                <div class="dropdown-snippets-list">
                  {#if filteredSnippets.length > 0}
                    {#each filteredSnippets as snippet}
                      <div
                        class="snippet-item"
                        tabindex="0"
                        role="button"
                        on:click={() => {
                          selectSnippet(snippet.function);
                          isSnippetDropdownOpen = false;
                          isSnippetTypingState = false;
                        }}
                        on:keydown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectSnippet(snippet.function);
                            isSnippetDropdownOpen = false;
                            isSnippetTypingState = false;
                          }
                        }}
                      >
                        <p class="snippet-item-text">
                          {@html highlightMatch(snippet.title, searchData)}
                        </p>
                      </div>
                    {/each}
                  {:else if trimmedSearch}
                    <div class="no-results">
                      <div
                        class="d-flex justify-content-center align-items-center"
                        style="margin-bottom: 8px;"
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
              </div>
            {/if}
          </div>

          <!-- AI Input (Right) -->
          <div class="ai-input-container" style="flex: 1;">
            <div style="position: relative;">
              <Tooltip
                title="You've reached your monthly AI request limit. Upgrade your plan to continue using AI feature."
                placement="top-center"
                size="small"
                show={isUserLimitReached}
                distance={5}
              >
                <div class="input-with-button">
                  <Input
                    id="sparkle-input-pre"
                    placeholder="Ask AI to generate a Pre-Request"
                    startIcon={showGeneratedTestActions || isUserLimitReached
                      ? SparkleFilledIcon
                      : SparkleColoredIcon}
                    iconSize={16}
                    variant="secondary"
                    size="medium"
                    bind:value={testCasePrompt}
                    {isError}
                    disabled={(showGeneratedTestActions ||
                      isUserLimitReached) &&
                      !isSnippetTypingState}
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
                  startIcon={isPreScriptGenerating ||
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
                    if (!isPreScriptGenerating) {
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
      </div>
    {/if}
  </div>
</div>

<style>
  .snippet-search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 151px;
    height: 36px;
    background-color: var(--bg-ds-surface-200);
  }

  .snippet-search-wrapper :global(input) {
    padding-right: 28px !important;
  }

  .snippet-close-icon {
    position: absolute;
    right: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-ds-neutral-200);
  }

  .snippet-close-icon:hover {
    color: var(--text-ds-neutral-50);
  }

  .input-with-button :global(input) {
    padding-right: 120px !important;
  }

  .input-error {
    color: var(--text-ds-danger-300, #e74c3c);
    font-size: 12px;
    margin-bottom: 4px;
    text-align: left;
  }

  .bottom-bar-wrapper {
    flex: 0 0 auto;
  }

  .bottom-bar {
    padding-top: 8px;
  }

  .snippets-button {
    width: 151px;
    height: 36px;
  }

  .snippet-dropdown-container {
    position: relative;
  }

  .snippet-dropdown-menu {
    position: fixed;
    bottom: 100%;
    bottom: 50px;
    margin-bottom: 8px;
    width: 196px;
    max-height: 164px;
    background-color: var(--bg-ds-surface-600);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    z-index: 1000;
  }

  .dropdown-search-container {
    padding: 12px;
    border-bottom: 1px solid var(--border-ds-neutral-400);
  }

  .dropdown-snippets-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .snippet-item {
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    margin-bottom: 4px;
  }

  .snippet-item:hover {
    cursor: pointer;
  }

  .snippet-item:active {
    background-color: var(--bg-ds-surface-500);
  }

  .snippet-item:focus-visible {
    outline: none;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--bg-ds-primary-300);
  }

  .snippet-item-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: var(--text-ds-neutral-100);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .no-results {
    padding: 24px 16px;
    text-align: center;
  }

  .no-results-text {
    font-weight: 500;
    font-size: 12px;
    color: var(--text-ds-neutral-300);
    margin: 0;
  }

  :global(.search-highlight) {
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    padding: 1px 2px;
    border-radius: 2px;
    font-weight: 600;
  }

  .editor-container {
    width: 100%;
  }

  .ai-input-container {
    position: relative;
  }

  .generated-test-actions {
    margin-bottom: 8px;
  }

  .actionable-button {
    display: flex;
    gap: 8px;
  }

  .generating-img {
    margin-bottom: 8px;
  }
</style>
