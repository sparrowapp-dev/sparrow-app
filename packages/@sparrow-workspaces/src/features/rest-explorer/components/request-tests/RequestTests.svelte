<script lang="ts">
  import { TestCaseModeEnum } from "@sparrow/common/types/workspace";
  import { NoCode } from "./sub-components";
  import { Tooltip } from "@sparrow/library/ui";

  export let tests;
  export let onTestsChange;
  export let tabSplitDirection;
  export let testResults;
  export let responseBody;
  export let responseHeader;
</script>

<div class="d-flex flex-column w-100 h-100">
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
            on:click={() => {
              //   onTestsChange();
            }}
            class="rounded text-fs-12 border-radius-2 px-2 py-1 btn-formatter"
            style="position: relative; z-index: 2; background-color: var(--bg-ds-surface-400)"
          >
            No Code
          </span>

          <Tooltip
            title={"This feature will be available soon."}
            placement="top-center"
          >
            <span
              role="button"
              on:click={() => {
                //   onTestsChange();
              }}
              class="rounded px-2 text-fs-12 py-1 btn-formatter"
              style="position: relative; z-index: 2; opacity:.5;"
            >
              Script Mode
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>

  <div class="border rounded-top">
    {#if tests?.testCaseMode === TestCaseModeEnum.SCRIPT}
      <div class="px-3 py-2">
        <p class="text-fs-12 mb-0 text-muted">JavaScript</p>
      </div>
    {:else if tests?.testCaseMode === TestCaseModeEnum.NO_CODE}
      <div class="px-3 py-2">
        <p class="text-fs-12 mb-0 text-muted">Build tests using form fields</p>
      </div>
    {/if}
  </div>
  <div style="flex:1; overflow:auto;">
    {#if tests?.testCaseMode === TestCaseModeEnum.SCRIPT}
      <div class="d-flex align-items-center gap-2">SCRIPT</div>
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
