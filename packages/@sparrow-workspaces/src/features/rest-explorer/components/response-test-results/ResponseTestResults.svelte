<script lang="ts">
  import { SparrowLogo } from "@sparrow/common/images";
  import { startLoading, stopLoading } from "@sparrow/common/store";
  import { TestCaseModeEnum } from "@sparrow/common/types/workspace";
  import { ErrorCircleRegular, SparkleRegular } from "@sparrow/library/icons";
  import { Button, Tag } from "@sparrow/library/ui";
  import { onMount, tick } from "svelte";
  import { loadingState } from "@sparrow/common/store";
  import { WorkspaceRole } from "@sparrow/common/enums";

  export let responseTestResults = [];
  export let responseTestMessage = "";
  export let tests;
  export let onFixTestScript;
  export let tabId;
  export let isGuestUser;
  export let isSharedWorkspace;
  export let userRole;

  let filter: "all" | "passed" | "failed" = "all";
  let allBtn: HTMLSpanElement;
  let passedBtn: HTMLSpanElement;
  let failedBtn: HTMLSpanElement;

  $: filteredResults = responseTestResults.filter((tc) => {
    if (filter === "all") return true;
    if (filter === "passed") return tc.testStatus === true;
    if (filter === "failed") return tc.testStatus === false;
    return true;
  });
  onMount(async () => {
    await tick(); // wait for DOM to render
    sliderStyle = getSliderStyle(filteredResults); // set initial slider position
  });

  $: sliderStyle = getSliderStyle(filteredResults);

  function getSliderStyle(filter: any) {
    if (!allBtn || !passedBtn || !failedBtn) return "";
    const gap = 4; // or read from CSS
    const prettyWidth = allBtn.offsetWidth;
    const rawWidth = passedBtn?.offsetWidth || 0;
    const previewWidth = failedBtn.offsetWidth;
    let left = 0;
    let width = prettyWidth;
    if (filter === "all") {
      left = prettyWidth / 2;
      width = prettyWidth;
    } else if (filter === "passed") {
      left = prettyWidth + gap + rawWidth / 2;
      width = rawWidth;
    } else if (filter === "failed") {
      left = prettyWidth + gap + rawWidth + gap + previewWidth / 2;
      width = previewWidth;
    }

    return `left: ${left}px; width: ${width}px; transform: translateX(-50%);`;
  }
</script>

{#if responseTestResults?.length > 0}
  <div class="d-flex flex-column pt-0 w-100 h-100">
    <div
      class="position-relative d-flex align-items-center rounded mb-0 py-1"
      style="position: relative;"
    >
      <!-- <div class="background-slider" style={sliderStyle}></div> -->
      <span
        bind:this={allBtn}
        role="button"
        on:click={() => {
          filter = "all";
        }}
        class="rounded text-fs-12 border-radius-2 px-2 py-1 btn-formatter"
        style={filter === "all"
          ? "background: var(--bg-ds-surface-600); border-radius: 6px;"
          : ""}
        class:selected={filter === "all"}
      >
        All
      </span>
      <span
        bind:this={passedBtn}
        role="button"
        on:click={() => {
          filter = "passed";
        }}
        class="rounded text-fs-12 border-radius-2 px-2 py-1 btn-formatter"
        style={filter === "passed"
          ? "background: var(--bg-ds-surface-600); border-radius: 6px;"
          : ""}
        class:selected={filter === "passed"}
      >
        Passed
      </span>
      <span
        bind:this={failedBtn}
        role="button"
        on:click={() => {
          filter = "failed";
        }}
        class="rounded text-fs-12 border-radius-2 px-2 py-1 btn-formatter"
        style={filter === "failed"
          ? "background: var(--bg-ds-surface-600); border-radius: 6px;"
          : ""}
        class:selected={filter === "failed"}
      >
        Failed
      </span>
    </div>
    <div
      style="flex:1; overflow:auto; border:1px solid var(--border-ds-surface-100); border-radius: 4px;"
    >
      {#each filteredResults as testCases}
        <div
          class="d-flex ps-0 gap-1 w-100 align-items-start"
          style="padding-left: 8px; padding: 6px;"
        >
          <div
            style="width: 60px; align-items: center; display: flex; justify-content:flex-start; padding-left:8px;"
          >
            <Tag
              type={testCases?.testStatus ? "green" : "orange"}
              text={testCases?.testStatus ? "Passed" : "Failed"}
              size="small"
            />
          </div>
          <div style="calc(100% - 60px); flex:1;">
            <p
              style="word-break: break-word; font-size: 12px; font-weight:400; color: var(--text-ds-neutral-400); padding-left: 4px; margin-bottom:0px;"
            >
              {testCases?.testName}
              {testCases?.testMessage
                ? `| AssertionError: ${testCases?.testMessage}`
                : ``}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class="d-flex align-items-center flex-column justify-content-center">
    <div class="d-flex flex-column align-items-center text-center">
      {#if responseTestMessage}
        <p
          class="text-fs-12 mb-2 pt-4"
          style="color: var(--text-ds-danger-400); max-width: 700px;"
        >
          <span class="d-inline-block">
            <ErrorCircleRegular size={"12px"} />
          </span>
          <span>
            Couldn't evaluate the test script: {responseTestMessage}
          </span>
        </p>
        {#if !isGuestUser && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
          <Button
            title="Fix Script"
            startIcon={SparkleRegular}
            type="outline-secondary"
            loader={$loadingState.get(tabId + "-fix-test-script")}
            disable={$loadingState.get(tabId + "-fix-test-script")}
            onClick={async () => {
              startLoading(tabId + "-fix-test-script");
              await onFixTestScript();
              stopLoading(tabId + "-fix-test-script");
            }}
          />
        {/if}
      {:else}
        <div class="my-4">
          <SparrowLogo />
        </div>
        {#if tests?.testCaseMode === TestCaseModeEnum.NO_CODE}
          <p class="text-fs-12 mb-5" style="color: var(--text-ds-neutral-400);">
            No test cases available. <br /> Start by adding your own test cases.
          </p>
        {:else if tests?.testCaseMode === TestCaseModeEnum.SCRIPT}
          <p class="text-fs-12 mb-5" style="color: var(--text-ds-neutral-400);">
            No test cases available. <br /> Start by adding your own test cases,
            select from smart suggestions or generate them with AI.
          </p>{/if}
      {/if}
    </div>
  </div>
{/if}

<style>
  .btn-formatter {
    position: relative;
    z-index: 2;
  }
  .btn-formatter {
    outline: none;
    border: none;
  }
</style>
