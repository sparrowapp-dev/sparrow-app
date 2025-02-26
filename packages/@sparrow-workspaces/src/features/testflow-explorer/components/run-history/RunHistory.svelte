<script lang="ts">
  import { getMethodStyle } from "@sparrow/common/utils";
  import {
    CrossIcon,
    FlowChartRegular,
    HistoryIcon,
  } from "@sparrow/library/icons";
  import CheckmarkCircle from "../../icons/CheckmarkCircle.svelte";
  import ErrorCircle from "../../icons/ErrorCircle.svelte";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import { Accordion, Tooltip } from "@sparrow/library/ui";
  import { WithButtonV5 } from "@sparrow/workspaces/hoc";
  import { FormatTime } from "@sparrow/common/utils";
  import { ResponseStatusCode } from "@sparrow/common/enums";
  import History from "../../icons/History.svelte";
  const formatTimeAgo = new FormatTime().formatTimeAgo;
  export let testflowStore;
  export let testflowName = "";
  export let toggleHistoryDetails;
  export let toggleHistoryContainer;

  /**
   * Checks if the current request was successful based on the response status.
   * @param _status - The current status of the request.
   * @returns True if the request succeeded, false otherwise.
   */
  const checkIfRequestSucceed = (_status: string) => {
    if (
      Number(_status.split(" ")[0]) >= 200 &&
      Number(_status.split(" ")[0]) < 300
    )
      return true;
    return false;
  };
  $: console.log(toggleHistoryDetails);
</script>

<div class="position-relative">
  <div>
    <Tooltip
      title="History"
      show={!testflowStore?.isRunHistoryEnable}
      placement="bottom-right"
      distance={10}
    >
      <WithButtonV5
        icon={HistoryIcon}
        onClick={() => {
          toggleHistoryContainer(!testflowStore?.isRunHistoryEnable);
          MixpanelEvent(Events.Run_History);
        }}
        disable={false}
        loader={false}
      />
    </Tooltip>
    {#if testflowStore?.isRunHistoryEnable}
      <div
        class="run-history-container position-absolute d-flex flex-column border-radius-2"
        style="bottom:-10px;
              right:0;
              z-index:100;
              width: 320px; 
              height: 562px;
              background-color: var(--bg-ds-surface-700);
              border: 1px solid var(--border-ds-surface-100);
              border-radius: 8px;
              transform: translateY(100%)"
      >
        <div style="padding: 12px 12px 6px 12px;">
          <!-- HEADER -->
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex justify-content-center align-items-center">
              <History />
              <span class="ms-2 header-title-text"> Run History </span>
            </div>
            <div
              role="button"
              on:click={() => {
                toggleHistoryContainer(!testflowStore?.isRunHistoryEnable);
              }}
            >
              <CrossIcon
                height={"15px"}
                width={"15px"}
                color={"var(--icon-secondary-200)"}
              />
            </div>
          </div>
        </div>
        <hr
          class=""
          style="background-color: var(--border-ds-surface-100); margin:0px"
        />
        <div style="padding:12px;">
          <!-- TITLE -->
          <div
            class="d-flex align-items-center gap-1"
            style="margin-bottom: 16px;"
          >
            <div style="padding: 2px;">
              <FlowChartRegular color={"var(--icon-ds-neutral-300)"} />
            </div>
            <p class="test-flow-name" style="margin: 0px;">
              {testflowName}
            </p>
          </div>
          <!-- BODY -->
          <div style="flex:1; overflow:auto;">
            <div class="time-line ms-3">
              {#if testflowStore?.history && testflowStore?.history?.length > 0}
                {#each testflowStore?.history as history, ind}
                  <div class="position-relative history-selector">
                    <div class="ms-3 mb-1 p-3 bg-tertiary-670 border-radius-2">
                      <div class="d-flex justify-content-between mb-3">
                        <span class="text-fs-8 fw-bold">
                          {history?.successRequests} Success | {history?.failedRequests}
                          fail
                        </span>
                        <span class="text-fs-8" style="padding-right:2px;"
                          >{history?.totalTime}</span
                        >
                      </div>
                      {#each history?.requests as request, index}
                        {#if index <= 1 || (history.expand && index > 1)}
                          <div class="d-flex mb-2 align-items-center">
                            <span
                              style="padding: 0px 2px; width: 30px;"
                              class="bg-tertiary-190 text-center text-fs-6-important text-{getMethodStyle(
                                request.method,
                              )}">{request.method}</span
                            >
                            <span
                              style="padding: 0px 2px; width: calc(100% - 90px);"
                              class="px-1 text-fs-8 ellipsis"
                              >{request.name}</span
                            >
                            <span
                              style="padding: 0px 2px; width: 20px;"
                              class="text-fs-8 bg-tertiary-190 text-center text-{checkIfRequestSucceed(
                                request?.status,
                              )
                                ? 'getColor'
                                : 'deleteColor'}"
                              >{request.status === ResponseStatusCode.ERROR
                                ? "ERR"
                                : request.status.split(" ")[0]}</span
                            >
                            <span
                              style="padding: 0px 2px; width: 40px; text-align: right;"
                              class="text-fs-8 text-{checkIfRequestSucceed(
                                request?.status,
                              )
                                ? 'getColor'
                                : 'deleteColor'}">{request.time}</span
                            >
                          </div>
                        {/if}
                      {/each}
                      {#if !history.expand && history?.requests.length > 2}
                        <span
                          role="button"
                          class="text-fs-8 text-secondary-200"
                          style="text-decoration: underline;"
                          on:click={() => {
                            toggleHistoryDetails(true, ind);
                          }}>see all {history?.requests?.length} requests</span
                        >
                      {:else if history.expand && history?.requests.length > 2}
                        <span
                          role="button"
                          class="text-fs-8 text-secondary-200"
                          style="text-decoration: underline;"
                          on:click={() => {
                            toggleHistoryDetails(false, ind);
                          }}>see less</span
                        >
                      {/if}
                    </div>
                    <div class="ms-3 mb-3">
                      <p
                        class="text-fs-6 m-0 text-secondary-200"
                        style="text-align: right;"
                      >
                        {formatTimeAgo(history?.timestamp)}
                      </p>
                    </div>
                    <div
                      class="status-icon-circle position-absolute d-flex align-items-center justify-content-center"
                      style="top:0; left: -14px;  overflow:hidden;"
                    >
                      {#if history?.status === "pass"}
                        <CheckmarkCircle
                          size={"16px"}
                          fillColor={"var(--icon-ds-success-400)"}
                        />
                      {:else}
                        <ErrorCircle
                          size={"16px"}
                          fillColor="var(--icon-ds-danger-300)"
                        />
                      {/if}
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
            <div>
              {#if testflowStore?.history && testflowStore?.history.length > 0}
                {#each testflowStore.history as history, ind}
                  <Accordion position="left">
                    <div
                      class="d-flex justify-content-between mb-3"
                      slot="accordion-field"
                    >
                      <span class="text-fs-8 fw-bold">
                        {history.successRequests} Success | {history.failedRequests}
                        Fail
                      </span>
                      <span class="text-fs-8" style="padding-right:2px;">
                        {history.totalTime}
                      </span>
                    </div>
                    <div slot="accordion-content">
                      {#each history?.requests as request, index}
                        {#if index <= 1 || (history.expand && index > 1)}
                          <div
                            class="d-flex mb-2 align-items-center"
                            style="background-color: var(--bg-ds-surface-700);"
                          >
                            <span
                              style="padding: 0px 2px; width: 30px;"
                              class="bg-tertiary-190 text-center text-fs-6-important text-{getMethodStyle(
                                request.method,
                              )}">{request.method}</span
                            >
                            <span
                              style="padding: 0px 2px; width: calc(100% - 90px);"
                              class="px-1 text-fs-8 ellipsis"
                              >{request.name}</span
                            >
                            <span
                              style="padding: 0px 2px; width: 20px;"
                              class="text-fs-8 bg-tertiary-190 text-center text-{checkIfRequestSucceed(
                                request?.status,
                              )
                                ? 'getColor'
                                : 'deleteColor'}"
                              >{request.status === ResponseStatusCode.ERROR
                                ? "ERR"
                                : request.status.split(" ")[0]}</span
                            >
                            <span
                              style="padding: 0px 2px; width: 40px; text-align: right;"
                              class="text-fs-8 text-{checkIfRequestSucceed(
                                request?.status,
                              )
                                ? 'getColor'
                                : 'deleteColor'}">{request.time}</span
                            >
                          </div>
                        {/if}
                      {/each}
                    </div>
                  </Accordion>
                {/each}
              {/if}
            </div>
            {#if !testflowStore?.history || testflowStore?.history.length === 0}
              <p style="font-size: 12px;">
                You need to run the testflow to see the history.
              </p>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .time-line {
    border-left: 1px solid var(--border-secondary-50);
  }
  .history-selector:last-child::before {
    content: ""; /* Custom content for the pseudo-element */
    color: var(--primary-color); /* Adjust color as per your design */
    font-size: 12px; /* Adjust font size */
    margin-right: 5px; /* Space between the bullet and content */
    display: inline-block; /* Ensure it's inline with the content */
    background-color: var(--bg-ds-surface-50);
    position: absolute;
    bottom: 0;
    left: -2px;
    width: 1px;
    top: 14px;
    box-shadow: 0px 16px 32px 0px #0000004d;
  }
  .run-history-container {
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  }
  .header-title-text {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-ds-neutral-50);
  }
  .test-flow-name {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    letter-spacing: normal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status-icon-circle {
    width: 24px;
    height: 24px;
    padding: 4px;
    border-radius: 50%;
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--bg-ds-surface-500);
  }
</style>
