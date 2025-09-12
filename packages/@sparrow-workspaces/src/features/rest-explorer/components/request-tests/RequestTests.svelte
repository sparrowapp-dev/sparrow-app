<script lang="ts">
  import { TestCaseModeEnum } from "@sparrow/common/types/workspace";
  import { NoCode } from "./sub-components";
  import { Tooltip } from "@sparrow/library/ui";
  import Script from "./sub-components/script/Script.svelte";

  export let tests;
  export let onTestsChange;
  export let tabSplitDirection;
  export let testResults;
  export let responseBody;
  export let responseHeader;
</script>

<div
  class="d-flex flex-column w-100 h-100"
  style="position: relative;"
  id="request-tab-test"
>
  <!-- <div class="pb-2" style="font-size: 12px; font-weight:500;">TESTS</div> -->
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
          <!-- ✅ Smooth background -->
          <!-- <div class="background-slider" style={sliderStyle}></div> -->
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
            No Code
          </span>

          <span
            role="button"
            on:click={() => {
              onTestsChange({
                ...tests,
                testCaseMode: TestCaseModeEnum.SCRIPT,
              });
            }}
            class="rounded px-2 text-fs-12 py-1 btn-formatter"
            style="position: relative; z-index: 2;  background-color: {tests?.testCaseMode ===
            TestCaseModeEnum.SCRIPT
              ? 'var(--bg-ds-surface-400)'
              : 'transparent'}"
          >
            Script Mode
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
      <div class="px-3 py-2">
        <p class="text-fs-12 mb-0 text-muted">Build tests using form fields</p>
      </div>
    {/if}
  </div>
  <div style="flex:1; overflow:auto;">
    {#if tests?.testCaseMode === TestCaseModeEnum.SCRIPT}
      <Script {tabSplitDirection} {tests} {onTestsChange} />
    {:else if tests?.testCaseMode === TestCaseModeEnum.NO_CODE}
      <NoCode
        {tests}
        {onTestsChange}
        {tabSplitDirection}
        {testResults}
        {responseBody}
        {responseHeader}
      />
    {/if}
  </div>
</div>
