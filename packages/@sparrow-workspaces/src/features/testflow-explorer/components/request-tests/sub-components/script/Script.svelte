<script lang="ts">
  import { Editor, Search, Input } from "@sparrow/library/forms";
  import {
    SearchIcon2,
    ChevronDownRegular,
    ChevronUpRegular,
  } from "@sparrow/library/icons";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { predefinedTestSnippets } from "./utils/common-snippets";
  import { SparkleColoredIcon, SparkleFilledIcon } from "@sparrow/common/icons";
  import { tick, onDestroy } from "svelte";

  export let onTestsChange;
  export let tests;
  export let onGenerateTestCases = undefined;
  export let isTestCasesGenerating = false;

  type EditorLanguage = "TestJavaScript";

  interface Snippet {
    title: string;
    function: string;
  }
  export let lang: EditorLanguage = "TestJavaScript";
  export let isBodyBeautified: boolean = false;

  let searchData: string = "";
  let testCasePrompt = "";
  let errorMessage: string = "";
  let isError: boolean = false;
  let isSnippetDropdownOpen: boolean = false;
  let snippetDropdownElement: HTMLElement;

  // Preprocess search string
  $: trimmedSearch = searchData.trim().toLowerCase();

  // Filtered snippets
  $: filteredSnippets = !trimmedSearch
    ? predefinedTestSnippets
    : predefinedTestSnippets.filter((s: Snippet) =>
        s.title.toLowerCase().includes(trimmedSearch),
      );

  const updateBeautifiedState = (val: boolean): void => {
    isBodyBeautified = val;
  };

  const handleCodeMirrorChange = (e: any) => {
    const newContent = e.detail;
    onTestsChange({ ...tests, script: newContent });
  };

  const selectSnippet = (data: string): void => {
    let value = tests?.script || "";
    const newValue = value ? `${value}\n${data}` : data;
    onTestsChange({ ...tests, script: newValue });
  };

  const highlightMatch = (text: string, searchTerm: string): string => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  };

  const toggleSnippetDropdown = () => {
    isSnippetDropdownOpen = !isSnippetDropdownOpen;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      snippetDropdownElement &&
      !snippetDropdownElement.contains(event.target as Node)
    ) {
      isSnippetDropdownOpen = false;
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
  });

  const handleGenerateTestCases = async () => {
    if (onGenerateTestCases) {
      const result = await onGenerateTestCases(testCasePrompt);
      if (result?.error) {
        isError = true;
        errorMessage = "Failed to generate test. Please try again.";
      } else if (result?.generatedContent) {
        isError = false;
        errorMessage = "";
        testCasePrompt = "";
        // Append generated content to existing script
        const currentScript = tests?.script || "";
        const separator = currentScript ? "\n\n" : "";
        const newScript = currentScript + separator + result.generatedContent;
        onTestsChange({ ...tests, script: newScript });
      }
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
        value={tests?.script || ""}
        on:change={handleCodeMirrorChange}
        isEditable={true}
        autofocus={true}
        placeholder={`// What are the tests?\n// Tests are scripts that automatically check your API's response.\n// For example: Is the status code 200? Does the body contain an email field?\n// sp.test("Status code is 200", function () {\n//   sp.expect(sp.response.statusCode).to.equal(200);\n// });\n\n// You can:\n// - Use "Snippets" to insert common tests\n// - Type a prompt and click "Generate" to create tests using AI\n// - Or, write test cases manually using scripting`}
        {isBodyBeautified}
        beautifySyntaxCallback={updateBeautifiedState}
      />
    </div>

    <!-- Bottom Bar with Snippets Dropdown and AI Input -->
    <div
      class="bottom-bar d-flex align-items-center"
      style="flex:0 0 auto; margin-top:8px; gap:8px;"
    >
      <!-- Snippets Dropdown (Left) -->
      <div
        class="snippet-dropdown-container"
        bind:this={snippetDropdownElement}
      >
        <Button
          onClick={toggleSnippetDropdown}
          size="small"
          type={isSnippetDropdownOpen ? "primary" : "outline-secondary"}
          title={"Snippets"}
          endIcon={isSnippetDropdownOpen
            ? ChevronUpRegular
            : ChevronDownRegular}
        />

        {#if isSnippetDropdownOpen}
          <div class="snippet-dropdown-menu">
            <!-- Search -->
            <div class="dropdown-search-container">
              <Search
                id="script-snippet-search"
                variant="primary"
                size="small"
                bind:value={searchData}
                placeholder="Search snippets"
              />
            </div>

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
                    }}
                    on:keydown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectSnippet(snippet.function);
                        isSnippetDropdownOpen = false;
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
        {#if errorMessage}
          <div class="input-error">{errorMessage}</div>
        {/if}
        <div style="position: relative;">
          <div class="input-with-button">
            <Input
              id="sparkle-input-post"
              placeholder="Ask AI to generate a Post-Request test"
              startIcon={SparkleColoredIcon}
              iconSize={16}
              variant="secondary"
              size="medium"
              bind:value={testCasePrompt}
              {isError}
              disabled={isTestCasesGenerating}
              on:input={() => {
                isError = false;
                errorMessage = "";
              }}
            />
          </div>
          <div
            style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%);"
          >
            <Button
              size="small"
              type="outline-secondary"
              startIcon={isTestCasesGenerating
                ? SparkleFilledIcon
                : SparkleColoredIcon}
              title={"Generate"}
              disable={isTestCasesGenerating || isError}
              loading={isTestCasesGenerating}
              onClick={() => {
                if (!isTestCasesGenerating && testCasePrompt.trim()) {
                  handleGenerateTestCases();
                } else if (!testCasePrompt.trim()) {
                  isError = true;
                  errorMessage = "Please enter a prompt before generating.";
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
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

  .bottom-bar {
    padding-top: 8px;
  }

  .snippet-dropdown-container {
    position: relative;
  }

  .snippet-dropdown-menu {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 8px;
    width: 320px;
    max-height: 400px;
    background-color: var(--bg-ds-surface-800);
    border: 1px solid var(--border-ds-neutral-400);
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
    background-color: var(--bg-ds-surface-600);
  }

  .snippet-item:active {
    background-color: var(--bg-ds-surface-500);
  }

  .snippet-item:focus-visible {
    outline: none;
    background-color: var(--bg-ds-surface-600);
    border: 2px solid var(--bg-ds-primary-300);
  }

  .snippet-item-text {
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
</style>
