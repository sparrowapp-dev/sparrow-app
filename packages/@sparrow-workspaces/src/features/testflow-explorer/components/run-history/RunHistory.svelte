<script lang="ts">
  import { getMethodStyle } from "@sparrow/common/utils";
  import { FlowChartRegular, HistoryIcon } from "@sparrow/library/icons";
  import { DismissRegular } from "@sparrow/library/icons";
  import { CheckCircle } from "@sparrow/library/icons";
  import { ErrorCircleRegular } from "@sparrow/library/icons";
  import { CircleSmallFilled } from "@sparrow/library/icons";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import { Accordion, Button, Tooltip } from "@sparrow/library/ui";
  import { WithButtonV5 } from "@sparrow/workspaces/hoc";
  import { FormatTime } from "@sparrow/common/utils";
  import { ResponseStatusCode } from "@sparrow/common/enums";
  import HistoryRegular from "../../icons/HistoryRegular.svelte";
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

  const truncateName = (name: string, charLimit: number = 12): string => {
    if (name.length > charLimit) {
      return name.slice(0, charLimit) + "...";
    }
    return name;
  };
  $: console.log("Test flow history------------>", testflowStore);
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
          <div class="d-flex align-items-center justify-content-between px-1">
            <div class="d-flex justify-content-center align-items-center">
              <HistoryRegular size={"16px"} color={"#FFFFFF"} />
              <span class="ms-2 header-title-text"> Run History </span>
            </div>
            <Button
              size={"medium"}
              startIcon={DismissRegular}
              type={"teritiary-regular"}
              onClick={() => {
                toggleHistoryContainer(!testflowStore?.isRunHistoryEnable);
              }}
            />
          </div>
        </div>
        <hr
          class=""
          style="background-color: var(--border-ds-surface-100); margin:0px"
        />
        <div style="padding:8px;">
          <!-- TITLE -->
          <div
            class="d-flex align-items-center gap-1 px-2"
            style="margin-bottom: 16px;"
          >
            <div style="padding: 2px;">
              <FlowChartRegular
                color={"var(--icon-ds-neutral-300)"}
                size={"16px"}
              />
            </div>
            <p class="test-flow-name" style="margin: 0px;">
              {testflowName}
            </p>
          </div>
          <!-- BODY -->
          <div style="flex:1; overflow:auto;">
            <div class="scroll-container" style="max-height:458px;">
              {#if testflowStore?.history && testflowStore?.history.length > 0}
                {#each testflowStore.history as history, ind}
                  <div class="d-flex justify-content-end">
                    <!-- Status Icon -->
                    <div
                      class={testflowStore?.history.length - 1 === ind
                        ? "status-icon-container-last"
                        : "status-icon-container"}
                    >
                      <div
                        class="status-icon-circle position-absolute d-flex align-items-center justify-content-center"
                      >
                        {#if history?.status === "pass"}
                          <CheckCircle
                            size={"12px"}
                            color={"var(--icon-ds-success-400)"}
                          />
                        {:else if history?.status === "fail" && history?.successRequests > 0}
                          <ErrorCircleRegular
                            size={"16px"}
                            color="var(--icon-ds-warning-300)"
                          />
                        {:else}
                          <ErrorCircleRegular
                            size={"16px"}
                            color="var(--icon-ds-danger-300)"
                          />
                        {/if}
                      </div>
                    </div>
                    <div style="width: 260px;">
                      <Accordion position="right">
                        <div
                          class="d-flex justify-content-between align-items-center"
                          slot="accordion-field"
                          style="gap: 26px;"
                        >
                          <div>
                            <p
                              style="margin: 0; width: 130px;"
                              class="d-flex align-items-center gap-2"
                            >
                              <span
                                class="status-value-container status-container-success px-1"
                              >
                                {history.successRequests} Success
                              </span>
                              <span
                                class="status-value-container status-container-fail px-1"
                              >
                                {history.failedRequests} Fail
                              </span>
                            </p>
                          </div>

                          <div
                            class="d-flex align-items-center"
                            style="margin-left: auto;"
                          >
                            <span
                              class="total-time-container"
                              style="text-align: right;"
                            >
                              {history.totalTime}
                            </span>
                          </div>
                        </div>

                        <div
                          slot="accordion-content"
                          style="background-color: var(--bg-ds-surface-700);"
                          class="p-2"
                        >
                          {#each history?.requests as request, index}
                            <div
                              class="d-flex mb-2 align-items-center justify-content-between gap-1"
                              style="opacity: {request?.status === 'pending'
                                ? 0.5
                                : 1};"
                            >
                              <div
                                class="d-flex align-items-center"
                                style="width: 30px;"
                              >
                                <span
                                  class="status-type-text text-{getMethodStyle(
                                    request.method,
                                  )}"
                                >
                                  {request.method}
                                </span>
                              </div>

                              <div
                                class="d-flex align-items-center"
                                style="width: 100px;"
                              >
                                <span
                                  class="px-1 text-fs-12 ellipsis"
                                  style="text-align: left;"
                                >
                                  {truncateName(request.name, 18)}
                                </span>
                              </div>

                              <div class="d-flex align-items-center gap-1">
                                <span
                                  class="text-fs-12 text-{checkIfRequestSucceed(
                                    request?.status,
                                  )
                                    ? 'success'
                                    : 'fail'} d-flex align-items-center"
                                  style="width: 41px; text-align: right; "
                                >
                                  <CircleSmallFilled
                                    size={"16px"}
                                    color={checkIfRequestSucceed(
                                      request?.status,
                                    )
                                      ? "var(--icon-ds-success-400)"
                                      : "var(--icon-ds-danger-300)"}
                                  />
                                  {request.status === ResponseStatusCode.ERROR
                                    ? "ERR"
                                    : request.status.split(" ")[0]}
                                </span>

                                <span
                                  class="text-fs-12 request-time"
                                  style="width: 48px; text-align: right;"
                                >
                                  {request.time}
                                </span>
                              </div>
                            </div>
                          {/each}
                        </div>
                      </Accordion>
                      <p
                        class="response-time"
                        style="text-align: left; margin-top:2px; margin-left:3px;"
                      >
                        {formatTimeAgo(history?.timestamp)}
                      </p>
                    </div>
                  </div>
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
  /* Scrollbar Styling */
  .scroll-container {
    overflow-y: auto;
    padding-right: 5px;
    scroll-behavior: smooth;
  }
  .scroll-container::-webkit-scrollbar {
    width: 4px;
  }

  .scroll-container::-webkit-scrollbar-track {
    background: var(--bg-ds-surface-700);
    border-radius: 4px;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background: var(--bg-ds-surface-100);
    border-radius: 8px;
  }
  .scroll-container::-webkit-scrollbar-button {
    color: var(--bg-ds-surface-100);
  }

  /* Status Icon Styling */
  .status-icon-circle {
    width: 24px;
    height: 24px;
    padding: 4px;
    border-radius: 50%;
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--bg-ds-surface-500);
    position: relative;
  }
  .status-value-container {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    text-align: center;
    min-height: 18px;
    border-radius: 2px;
    border: 1px solid var(--border-ds-surface-50);
  }
  .status-icon-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    left: -18px;
  }
  .status-icon-container-last {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    left: -18px;
  }

  .status-icon-circle {
    width: 24px;
    height: 24px;
    padding: 4px;
    border-radius: 50%;
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--bg-ds-surface-500);
    position: relative;
    z-index: 999;
  }

  .status-icon-container::before {
    content: "";
    position: absolute;
    width: 1px;
    height: 94%;
    background-color: var(--border-ds-surface-50);
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 0;
  }
  .status-container-success {
    background-color: var(--bg-ds-success-900) !important;
    border: 1px solid var(--border-ds-success-700);
    color: var(--text-ds-success-300);
  }
  .status-container-fail {
    background-color: var(--bg-ds-tertiary-900) !important;
    border: 1px solid var(--border-ds-tertiary-700);
    color: var(--text-ds-tertiary-300);
  }

  /* text Styling */
  .request-time {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    text-align: right;
    color: var(--text-ds-neutral-200);
  }
  .text-success.text-fail {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
  }
  .text-success {
    color: var(--text-ds-success-400) !important;
  }
  .text-fail {
    color: var(--text-ds-danger-300) !important;
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
  .total-time-container {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    color: var(--text-ds-neutral-200);
  }
  .status-type-text {
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: 9px;
  }
  .response-time {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    color: var(--text-ds-neutral-300);
  }
</style>
