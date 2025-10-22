<script lang="ts">
  import { TestCaseModeEnum } from "@sparrow/common/types/workspace";
  import { Tooltip, Button } from "@sparrow/library/ui";
  import Script from "./sub-components/script/Script.svelte";
  import { PreScript } from "./sub-components";

  export let tests;
  export let onTestsChange;
  export let tabSplitDirection;
  export let testResults;
  export let responseBody;
  export let responseHeader;
  export let onShowModeChangeModal;
  export let onGenerateTestCases;
  export let isTestCasesGenerating;
  export let isGuestUser;
  export let userRole;
  export let scriptComponent = null;
  export let preScriptComponent = null;
  export let onGeneratePreScript;
  export let isPreScriptGenerating;
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
              // Only show modal if we're switching FROM another mode TO No Code
              if (tests?.testCaseMode !== TestCaseModeEnum.NO_CODE) {
                onShowModeChangeModal(TestCaseModeEnum.NO_CODE);
              }
            }}
          >
            Pre-Request Script
          </span>

          <span
            role="button"
            on:click={() => {
              // Only show modal if we're switching FROM another mode TO Script
              if (tests?.testCaseMode !== TestCaseModeEnum.SCRIPT) {
                onShowModeChangeModal(TestCaseModeEnum.SCRIPT);
              }
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
      <div class="px-3 py-2">
        <p class="text-fs-12 mb-0 text-muted">JavaScript Code</p>
      </div>
    {:else if tests?.testCaseMode === TestCaseModeEnum.NO_CODE}
      <div class="d-flex align-items-center justify-content-between px-3 py-2">
        <p class="text-fs-12 mb-0 text-muted">JavaScript Code</p>
        <!-- <Button
          title="Read Documentation"
          size={"extra-small"}
          type="link-secondary"
          onClick={() => {}}
        /> -->
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
        {isTestCasesGenerating}
        {isGuestUser}
        {userRole}
        bind:this={scriptComponent}
      />
    {:else if tests?.testCaseMode === TestCaseModeEnum.NO_CODE}
      <PreScript
        {tabSplitDirection}
        {tests}
        {onTestsChange}
        {onGeneratePreScript}
        {isPreScriptGenerating}
        {isGuestUser}
        {userRole}
        bind:this={preScriptComponent}
      />
    {/if}
  </div>
</div>
