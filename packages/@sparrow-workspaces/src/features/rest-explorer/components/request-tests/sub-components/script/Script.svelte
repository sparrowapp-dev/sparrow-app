<script lang="ts">
  import { Editor, Search, Input } from "@sparrow/library/forms";
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
    SearchIcon2,
    StopFilledIcon,
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
  import { SparkleColoredIcon } from "@sparrow/common/icons";
  import { generatingImage } from "@sparrow/common/images";
  import { fade } from "svelte/transition";
  export let onTestsChange;
  export let tests;
  export let onGenerateTestCases;
  export let isTestCasesGenerating;

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

  const handleCodeMirrorChange = (e: any) => {
    onTestsChange({ ...tests, script: e.detail });
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
    const result = await onGenerateTestCases(testCasePrompt);
    if (result?.error) {
      isError = true;
      errorMessage =
        "This request is a bit tricky to turn into a test. Please try rephrasing it in a simpler way.";
    } else {
      isError = false;
      errorMessage = "";
      testCasePrompt = "";
    }
  };
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
      <div style="flex:0 0 auto; width:100%; margin-top:4px;">
        <div style="position:relative;">
          {#if errorMessage}
            <div class="input-error">{errorMessage}</div>
          {/if}
          {#if isTestCasesGenerating}
            <p
              class="text-primary-300 generating-img d-flex justify-content-center align-items-center"
              in:fade={{ duration: 200 }}
            >
              <img src={generatingImage} style="width: 118px;" alt="" />
            </p>
          {/if}
          <Input
            id="sparkle-input"
            placeholder="Ask AI to generate a test"
            startIcon={SparkleColoredIcon}
            iconSize={16}
            variant="primary"
            size="medium"
            bind:value={testCasePrompt}
            {isError}
            on:input={() => {
              isError = false;
              errorMessage = "";
            }}
          />

          <div
            style="position:absolute; right:4px; top:{isTestCasesGenerating
              ? '75%'
              : isError
                ? '67%'
                : '50%'}; transform:translateY(-50%);"
          >
            <Button
              size="small"
              type="outline-secondary"
              startIcon={isTestCasesGenerating
                ? StopFilledIcon
                : SparkleColoredIcon}
              title={isTestCasesGenerating ? "Stop Generating" : "Generate"}
              onClick={() => {
                if (isTestCasesGenerating) {
                  // handleStopGeneratingTestCases();
                  return;
                }
                if (!isTestCasesGenerating && testCasePrompt.trim()) {
                  handleGenerateTestCases();
                  return;
                }
              }}
            />
          </div>
        </div>
      </div>
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
</style>
