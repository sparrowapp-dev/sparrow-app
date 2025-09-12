<script lang="ts">
  import { Editor, Search } from "@sparrow/library/forms";
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
  } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { predefinedTestSnippets } from "./utils/common-snippets";

  type SplitDirection = "vertical" | "horizontal";
  type EditorLanguage = "JavaScript";

  // Snippet type (based on your utils/common-snippets.ts)
  interface Snippet {
    title: string;
    function: string;
  }

  export let tabSplitDirection: SplitDirection = "vertical";
  export let lang: EditorLanguage = "JavaScript";
  export let value: string = "";
  export let isBodyBeautified: boolean = false;

  let searchData: string = "";
  let isLeftPanelCollapsed: boolean = false;

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

  const updateTestContent = (data: string): void => {
    value = data;
  };

  const toggleLeftPanel = (): void => {
    isLeftPanelCollapsed = !isLeftPanelCollapsed;
  };

  const selectSnippet = (data: string): void => {
    value += value ? `\n${data}` : data;
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
    ? "60px"
    : tabSplitDirection === "vertical"
      ? "40%"
      : "25%";

  $: rightPanelWidth = isLeftPanelCollapsed ? "calc(100% - 60px)" : "75%";
</script>

<div class="border border-top-0 text-light p-2 h-100 rounded-bottom">
  <div class="d-flex h-100 flex-row">
    <!-- Left Sidebar -->
    <div
      class="h-100 d-flex flex-column {isLeftPanelCollapsed
        ? 'collapsed-panel'
        : ''}"
      style="width:{leftPanelWidth};gap:6px;overflow:hidden;transition:width 0.3s ease;"
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
            type="outline-secondary"
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
          <p class="snippet-text m-0">
            Snippets
            {#if trimmedSearch}
              <span class="results-count"
                >({filteredSnippets.length} found)</span
              >
            {/if}
          </p>
          <Button
            onClick={toggleLeftPanel}
            size="extra-small"
            startIcon={ChevronDoubleLeftRegular}
            type="outline-secondary"
          />
        </div>

        <!-- Search -->
        <div class="d-flex justify-content-center flex-shrink-0 mb-2">
          <Search
            id="script-snippet-search"
            customWidth="100%"
            variant="primary"
            size="small"
            bind:value={searchData}
            placeholder="Search snippets..."
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
              <p class="no-results-text">
                No snippets found for "{searchData}"
              </p>
              <p class="no-results-suggestion">
                Try searching with different keywords
              </p>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Right Panel -->
    <div
      class="h-100 gap-2 d-flex border-start ms-2 ps-2"
      style="width:{rightPanelWidth};overflow:auto;flex-flow:wrap;align-content:flex-start;transition:width 0.3s ease;"
    >
      <Editor
        bind:lang
        bind:value
        on:change={updateTestContent}
        isEditable={true}
        autofocus={true}
        {isBodyBeautified}
        beautifySyntaxCallback={updateBeautifiedState}
      />
    </div>
  </div>
</div>

<style>
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
    padding: 24px 8px;
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
    background-color: var(--bg-ds-warning-300);
    color: var(--text-ds-neutral-900);
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
</style>
