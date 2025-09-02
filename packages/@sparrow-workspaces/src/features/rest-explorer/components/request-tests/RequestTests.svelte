<script lang="ts">
  import { TestCaseModeEnum } from "@sparrow/common/types/workspace";
  import { NoCode } from "./sub-components";

  export let tests;
  export let onTestsChange;
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
            style="position: relative; z-index: 2;"
          >
            No Code
          </span>

          <span
            role="button"
            on:click={() => {
              //   onTestsChange();
            }}
            class="rounded px-2 text-fs-12 py-1 btn-formatter"
            style="position: relative; z-index: 2;"
          >
            Script Mode
          </span>
        </div>
      </div>
    </div>
  </div>

  {#if tests?.testCaseMode === TestCaseModeEnum.SCRIPT}
    <div class="d-flex align-items-center gap-2">SCRIPT</div>
  {:else if tests?.testCaseMode === TestCaseModeEnum.NO_CODE}
    <NoCode {tests} {onTestsChange} />
  {/if}
</div>
