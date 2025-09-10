<script lang="ts">
  import { Editor, Search } from "@sparrow/library/forms";
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
  } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { predefinedTestSnippets } from "./utils/common-snippets";

  export let tabSplitDirection: "vertical" | "horizontal" = "vertical";
  export let lang:
    | "HTML"
    | "JSON"
    | "XML"
    | "JavaScript"
    | "Text"
    | "Graphql"
    | "Python"
    | "Curl" = "JavaScript";
  export let value: string = "";
  export let isBodyBeautified: boolean = false;
  let searchData: string;

  // State for panel collapse
  let isLeftPanelCollapsed = false;

  const updateBeautifiedState = (val: boolean) => {
    isBodyBeautified = val;
  };

  const updateTestContent = (data: any) => {
    value = data;
  };

  const onSearchSnippets = (value: string) => {};

  const toggleLeftPanel = () => {
    isLeftPanelCollapsed = !isLeftPanelCollapsed;
  };
</script>

<div class="border border-top-0 text-light p-2 h-100 rounded-bottom">
  <!-- Main layout -->
  <div
    class={`d-flex h-100 ${tabSplitDirection === "vertical" ? "flex-row" : "flex-row"}`}
  >
    <!-- Left Sidebar -->
    <div
      class="h-100 {isLeftPanelCollapsed ? 'collapsed-panel' : ''}"
      style="width: {tabSplitDirection === 'vertical'
        ? '100%'
        : isLeftPanelCollapsed
          ? 'auto'
          : '25%'}; gap: 6px; overflow: hidden; transition: width 0.3s ease;"
    >
      {#if isLeftPanelCollapsed}
        <!-- Collapsed state -->
        <div
          class="collapsed-content d-flex flex-column align-items-center"
          style="padding: 8px 4px;"
        >
          <Button
            onClick={toggleLeftPanel}
            size={"extra-small"}
            startIcon={ChevronDoubleRightRegular}
            type="outline-secondary"
          />
          <div class="collapsed-text mt-2">
            <span class="vertical-text">Snippets</span>
          </div>
        </div>
      {:else}
        <!-- Expanded state -->
        <div
          class="d-flex flex-row justify-content-between align-items-center"
          style="margin: 8px 4px 8px 8px;"
        >
          <div>
            <p class="snippet-text" style="margin: 0px;">Snippets</p>
          </div>
          <div>
            <Button
              onClick={toggleLeftPanel}
              size={"extra-small"}
              startIcon={ChevronDoubleLeftRegular}
              type="outline-secondary"
            />
          </div>
        </div>
        <div class="d-flex justify-content-center" style="">
          <Search
            id="script-snippet-search"
            customWidth={"100%"}
            variant="primary"
            size="small"
            bind:value={searchData}
            on:input={(e) => {
              onSearchSnippets(searchData);
            }}
            placeholder="Search"
          />
        </div>
        <div class="h-100 mt-1" style="overflow: auto;">
          {#each predefinedTestSnippets as snippet}
            <div
              class="mb-2 d-flex align-items-center snippet-suggestion-container"
            >
              <p class="suggestion-text">
                {snippet.title}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Right Form -->
    <div
      class="h-100 gap-2 d-flex border-start ms-2 ps-2"
      style="
        width: {tabSplitDirection === 'vertical'
        ? '100%'
        : isLeftPanelCollapsed
          ? 'calc(100% - 60px)'
          : '75%'};
        overflow: auto;
        flex-flow: wrap;
        align-content: flex-start;
        transition: width 0.3s ease;"
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
    font-style: normal;
    font-size: 12px;
    line-height: 1.3;
    letter-spacing: 0;
    color: var(--text-ds-neutral-50);
  }
  .snippet-suggestion-container {
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .snippet-suggestion-container:hover {
    background-color: var(--bg-ds-surface-100);
  }
  .suggestion-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-style: normal;
    font-size: 12px;
    line-height: 1.3;
    letter-spacing: 0;
    color: var(--text-ds-primary-300);
    align-items: start;
    margin: 0;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Left panel animation styles */
  .left-panel {
    transition: width 0.3s ease;
    overflow: hidden;
  }

  .collapsed-content {
    height: 100%;
  }

  .vertical-text {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: var(--text-ds-neutral-50);
  }
</style>
