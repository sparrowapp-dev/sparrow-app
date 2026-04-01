<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const code = `const requestOptions = {
  method: "GET",
  redirect: "follow"
};`;

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
    <div class="language-dropdown">
      JavaScript(3)
      <span class="caret">▾</span>
    </div>

    <button class="copy-btn"> Copy snippet </button>
  </div>

  <!-- TABS -->
  <div class="tabs">
    <span class="tab active">Fetch</span>
    <span class="tab">jQuery</span>
    <span class="tab">XHR</span>
  </div>

  <!-- CODE BLOCK -->
  <div class="code-block">
    <pre>{code}</pre>
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

    z-index: 20;

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
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #ffffff;
  }

  .close-btn {
    width: 24px;
    height: 24px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: transparent;
    border: none;
    cursor: pointer;

    color: var(--text-secondary-200);
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
    gap: 16px;
    padding: 0 16px;
  }

  .tab {
    font-size: 12px;
    color: #d8d8d9;
    cursor: pointer;
  }

  .tab.active {
    color: #316cf6;
    border-bottom: 2px solid #316cf6;
  }

  /* CODE BLOCK */
  .code-block {
    margin: 12px 16px;
    padding: 12px;

    background: #0d1117;
    border: 1px solid #31353f;
    border-radius: 6px;

    font-family: "JetBrains Mono";
    font-size: 12px;
    color: #ffffff;
  }
</style>
