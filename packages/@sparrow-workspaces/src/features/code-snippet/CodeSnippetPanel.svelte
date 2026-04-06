<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import LanguageSelector from "./LanguageSelector.svelte";
  import CodeViewer from "./CodeViewer.svelte";
  import { LANGUAGES } from "./utils/languages";
  import { TEMPLATES } from "./utils/generateSnippet";
  import { CopyRegular, CheckRegular } from "@sparrow/library/icons";

  export let requestData;
  console.log("SNIPPET DATA =>", requestData);

  let selectedLanguage = "javascript";
  let activeTab = "fetch";
  let generatedCode: string = "";

  $: {
    try {
      generatedCode = TEMPLATES[activeTab]
        ? TEMPLATES[activeTab](requestData)
        : "// Not implemented yet";
    } catch (e) {
      console.error("Snippet generation failed:", e);
      generatedCode = "// Unable to generate snippet";
    }
  }

  $: currentLang =
    LANGUAGES.find((l) => l.key === selectedLanguage) || LANGUAGES[0];

  const code = `const requestOptions = {
  method: "GET",
  redirect: "follow"
};`;

  let copied = false;

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    copied = true;

    setTimeout(() => (copied = false), 1500);
  };

  const dispatch = createEventDispatcher();

  const handleClose = () => {
    dispatch("close");
  };
</script>

<div class="panel">
  <!-- HEADER -->
  <div class="header">
    <span class="title">Code snippet</span>

    <button class="close-btn" on:click={handleClose}> ✕ </button>
  </div>

  <!-- SUBHEADER (LANGUAGE + COPY) -->
  <div class="subheader">
    <LanguageSelector
      {selectedLanguage}
      selectedTab={activeTab}
      on:change={(e) => {
        selectedLanguage = e.detail.language;
        activeTab = e.detail.tab;
      }}
    />
  </div>

  <!-- TABS -->
  <div class="tabs-row">
    <div class="tabs">
      {#each currentLang.tabs as tab}
        <span
          class="tab {activeTab === tab.value ? 'active' : ''}"
          on:click={() => (activeTab = tab.value)}
        >
          {tab.label}
        </span>
      {/each}
    </div>

    <!-- Copy Button moved here -->
    <div class="copy-wrapper">
      <button on:click={copyCode} class="copy-btn">
        {#if copied}
          <CheckRegular size="14px" />
        {:else}
          <CopyRegular size="14px" />
        {/if}
      </button>

      <div class="tooltip">
        {copied ? "Copied" : "Copy snippet"}
      </div>
    </div>
  </div>

  <!-- CODE BLOCK -->
  <div class="code-block">
    <CodeViewer code={generatedCode} language={activeTab} />
  </div>
</div>

<style>
  .panel {
    position: absolute;
    right: 0;
    top: 40px;
    width: 350px;
    height: calc(100% - 40px);

    background: var(--bg-ds-surface-900);
    border-left: 1px solid var(--border-subtle, #2a2a2a);

    z-index: 999;

    display: flex;
    flex-direction: column;
  }

  /* HEADER */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0 12px;
    height: 40px;
  }

  .title {
    font-family: Inter, sans-serif;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: #ffffff;
  }

  .close-btn {
    width: 20px;
    height: 20px;

    font-size: 14px; /* 🔥 smaller cross */
    color: #9ca3af; /* softer */

    display: flex;
    align-items: center;
    justify-content: center;

    background: transparent;
    border: none;
    cursor: pointer;
  }

  .close-btn:hover {
    color: #ffffff;
  }

  /* BODY */
  .body {
    flex: 1;
    padding: 12px;
  }

  .placeholder {
    color: var(--text-secondary-200);
    font-size: 12px;
  }

  .panel {
    position: absolute;
    right: 0;
    top: 40px;
    width: 350px;
    height: calc(100% - 40px);

    background: #14181f;
    border-left: 1px solid #31353f;

    display: flex;
    flex-direction: column;
  }

  /* HEADER */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0 16px;
    height: 40px;
  }

  .title {
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
  }

  .close-btn {
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    color: #d8d8d9;
    cursor: pointer;
  }

  .close-btn:hover {
    color: #ffffff;
  }

  /* SUBHEADER */
  .subheader {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 8px 16px;
  }

  .language-dropdown {
    background: #181c26;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    color: #d8d8d9;
  }

  .caret {
    margin-left: 6px;
  }

  .copy-btn {
    background: #2a2f3a;
    border: none;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    cursor: pointer;
  }

  /* TABS */
  .tabs {
    display: flex;
    gap: 12px;
  }

  .tabs-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
  }

  .tab {
    font-size: 12px;
    color: #c1c4c9; /* faded */
    cursor: pointer;
    padding: 8px 0;
    position: relative;
    transition: color 0.15s ease;
  }

  .tab.active {
    color: #e5e7eb; /* brighter like figma */
  }

  .tab:hover {
    color: #cbd5f5;
  }

  .tab.active::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: #2f81f7;
    border-radius: 2px;
  }

  /* CODE BLOCK */
  .code-block {
    margin: 10px 16px 16px 16px; /* tighter top spacing */
    padding: 10px; /* reduced padding */

    flex: 1; /* 🔥 IMPORTANT */
    display: flex;
    flex-direction: column;

    background: transparent; /* matches CodeViewer bg */
    border: 1px solid #2a2f3a; /* softer border */
    border-radius: 4px; /* slightly more rounded */

    overflow: hidden; /* prevents overflow issues */
  }

  .selected {
    background: #181c26;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    color: #d8d8d9;
  }

  .copy-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  /* BUTTON */
  .copy-btn {
    width: 24px;
    height: 24px;

    background: #1c212b;
    border: 1px solid #31353f;
    border-radius: 6px;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;
    transition: all 0.15s ease;
  }

  /* HOVER */
  .copy-btn:hover {
    background: #2a2f3a;
  }

  /* TOOLTIP */
  .tooltip {
    position: absolute;
    top: -30px;
    right: 0;

    background: #2a2f3a;
    color: #fff;
    font-size: 11px;

    padding: 4px 8px;
    border-radius: 4px;

    opacity: 0;
    pointer-events: none;
    transform: translateY(4px);

    transition: all 0.15s ease;
    white-space: nowrap;
  }

  /* SHOW TOOLTIP ON HOVER */
  .copy-wrapper:hover .tooltip {
    opacity: 1;
    transform: translateY(0);
  }
</style>
