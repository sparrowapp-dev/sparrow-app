<script lang="ts">
  import { SparrowLogo } from "@sparrow/common/images";
  import { startLoading, stopLoading } from "@sparrow/common/store";
  import { TestCaseModeEnum } from "@sparrow/common/types/workspace";
  import { ErrorCircleRegular, SparkleRegular } from "@sparrow/library/icons";
  import { Button, Tag } from "@sparrow/library/ui";
  import { loadingState } from "@sparrow/common/store";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { onMount, tick } from "svelte";

  export let responseTestResults: any[] = [];
  export let responseTestMessage: any[] = [];
  export let tests: any;
  export let onFixTestScript: any;
  export let tabId: string;
  export let isGuestUser: boolean;
  export let userRole: string;

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

{#if responseTestResults?.length > 0 || responseTestMessage?.length > 0}
  <div class="d-flex flex-column pt-0 w-100 h-100">
    <!-- Filter Tabs -->
    <div
      class="position-relative d-flex align-items-center rounded mb-0 py-1"
      style="position: relative;"
    >
      <!-- <div class="background-slider" style={sliderStyle}></div> -->
      <span
        bind:this={allBtn}
        role="button"
        tabindex="0"
        on:click={() => {
          filter = "all";
        }}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            filter = "all";
          }
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
        tabindex="0"
        on:click={() => {
          filter = "passed";
        }}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            filter = "passed";
          }
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
        tabindex="0"
        on:click={() => {
          filter = "failed";
        }}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            filter = "failed";
          }
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
      {#if responseTestMessage?.length > 0}
        {#each responseTestMessage as errorMessage}
          <div class="d-flex align-items-center px-2 mb-1 pt-2" style="">
            <p
              class="text-fs-12 pe-2 mb-0"
              style="color: var(--text-ds-danger-400); max-width: calc(100% - 130px);"
            >
              <span class="d-inline-block">
                <ErrorCircleRegular size={"12px"} />
              </span>
              <span>
                Couldn't evaluate the {errorMessage.initiator} test script: {errorMessage.error}
              </span>
            </p>
            {#if !isGuestUser && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
              <Button
                title="Fix Script"
                size={"extra-small"}
                startIcon={SparkleRegular}
                type="outline-secondary"
                loader={$loadingState.get(
                  tabId + "-" + errorMessage.initiator + "-fix-test-script",
                )}
                disable={$loadingState.get(
                  tabId + "-" + errorMessage.initiator + "-fix-test-script",
                )}
                onClick={async () => {
                  startLoading(
                    tabId + "-" + errorMessage.initiator + "-fix-test-script",
                  );
                  await onFixTestScript(errorMessage.initiator);
                  stopLoading(
                    tabId + "-" + errorMessage.initiator + "-fix-test-script",
                  );
                }}
              />
            {/if}
          </div>
        {/each}
      {/if}
      {#each filteredResults as testCases}
        <div
          class="d-flex ps-0 gap-1 w-100 align-items-start"
          style="padding-left: 8px; padding: 6px;"
        >
          <div
            style="width: 140px; align-items: center; display: flex; justify-content:flex-start; padding-left:8px;"
          >
            <Tag
              type={testCases?.testStatus ? "green" : "orange"}
              text={testCases?.testStatus ? "Passed" : "Failed"}
              size="small"
            />
            <span class="pe-2"></span>
            <Tag type={"grey"} text={testCases?.initiator} size="small" />
          </div>
          <div style="calc(100% - 140px); flex:1;">
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
      {#if responseTestMessage?.length > 0}
        {#each responseTestMessage as resErr}
          <p
            class="text-fs-12 mb-2 pt-4"
            style="color: var(--text-ds-danger-400); max-width: 700px;"
          >
            <span class="d-inline-block">
              <ErrorCircleRegular size={"12px"} />
            </span>
            <span>
              Couldn't evaluate the test script: {resErr.error}
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
        {/each}
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
