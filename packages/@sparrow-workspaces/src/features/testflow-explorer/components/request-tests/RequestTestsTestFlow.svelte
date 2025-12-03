<script lang="ts">
  import { TestCaseModeEnum } from "@sparrow/common/types/workspace";
  import { Button } from "@sparrow/library/ui";
  import { Script, PreScript } from "./sub-components";

  export let tests;
  export let onTestsChange;
  export let tabSplitDirection = "horizontal";
  export let onGenerateTestCases;
  export let onGeneratePreScript;
  export let node_id;
  export let tab;
  export let isGuestUser = false;
  export let userRole;
</script>

<div
  class="d-flex flex-column w-100 h-100"
  style="position: relative;"
  id="request-tab-test"
>
  <div
    class="d-flex flex-column align-items-center justify-content-between w-100"
  >
    <div
      class="response-container d-flex align-items-center pb-1 px-0 justify-content-between w-100 z-1"
    >
      <div class="d-flex gap-1 align-items-center justify-content-center">
        <div
          class="position-relative d-flex align-items-center rounded mb-0 py-1"
          style="position: relative;"
        >
          <span
            role="button"
            class="rounded text-fs-12 border-radius-2 px-2 py-1 btn-formatter"
            style="position: relative; z-index: 2; background-color: {tests?.testCaseMode ===
            TestCaseModeEnum.NO_CODE
              ? 'var(--bg-ds-surface-400)'
              : 'transparent'}"
            id="request-tab-nocode"
            on:click={() => {
              onTestsChange({
                ...tests,
                testCaseMode: TestCaseModeEnum.NO_CODE,
              });
            }}
          >
            Pre-Request Script
          </span>

          <span
            role="button"
            on:click={() => {
              onTestsChange({
                ...tests,
                testCaseMode: TestCaseModeEnum.SCRIPT,
              });
            }}
            id="request-tab-test-script"
            class="rounded px-2 text-fs-12 py-1 btn-formatter"
            style="position: relative; z-index: 2; background-color: {tests?.testCaseMode ===
            TestCaseModeEnum.SCRIPT
              ? 'var(--bg-ds-surface-400)'
              : 'transparent'}"
          >
            Post-Request Script
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="border rounded-top">
    {#if tests?.testCaseMode === TestCaseModeEnum.SCRIPT}
      <div class="d-flex align-items-center justify-content-between px-3 py-2">
        <p class="text-fs-12 mb-0 text-muted">JavaScript Code</p>
      </div>
    {:else if tests?.testCaseMode === TestCaseModeEnum.NO_CODE}
      <div class="d-flex align-items-center justify-content-between px-3 py-2">
        <p class="text-fs-12 mb-0 text-muted">JavaScript Code</p>
      </div>
    {/if}
  </div>

  <div style="flex:1; overflow:auto;">
    {#if tests?.testCaseMode === TestCaseModeEnum.SCRIPT}
      <Script
        {tabSplitDirection}
        {tests}
        {onTestsChange}
        {onGenerateTestCases}
        {node_id}
        {tab}
        {isGuestUser}
        {userRole}
      />
    {:else}
      <PreScript
        {tabSplitDirection}
        {tests}
        {onTestsChange}
        {onGeneratePreScript}
        {node_id}
        {tab}
        {userRole}
        {isGuestUser}
      />
    {/if}
  </div>
</div>

<style>
  .btn-formatter {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    color: var(--text-ds-neutral-50);
    transition: background-color 0.2s ease;
  }

  .btn-formatter:hover {
    background-color: var(--bg-ds-surface-500);
  }

  .text-muted {
    color: var(--text-ds-neutral-500);
  }
</style>
