<script lang="ts">
  import { getMethodStyle } from "@deprecate/utils/helpers";
  import {
    CheckIcon2,
    CrossIcon,
    ExclamationIcon,
    HistoryIcon,
  } from "@sparrow/library/icons";
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import { Tooltip } from "@sparrow/library/ui";
  import { WithButtonV5 } from "@sparrow/workspaces/common/hoc";
  import { FormatTime } from "@sparrow/common/utils";
  import { ResponseStatusCode } from "@deprecate/utils/enums";
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
</script>

<div class="position-relative">
  <div>
    <Tooltip
      title="History"
      show={!testflowStore?.isRunHistoryEnable}
      placement="bottom-left"
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
        class="run-history-container position-absolute d-flex flex-column bg-tertiary-750 border-radius-2 p-3"
        style="bottom:-10px;
              right:0;
              z-index:100;
              width: 300px; 
              height: 500px;
              transform: translateY(100%)"
      >
        <div>
          <!-- HEADER -->
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <HistoryIcon
                height={"15px"}
                width={"15px"}
                color={"var(--icon-secondary-100)"}
              />
              <span class="ms-2 text-fs-12 fw-bold"> Run History </span>
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
          <hr class="my-3 text-tertiary-190" />

          <!-- TITLE -->
          <p class="text-fs-10 ellipsis fw-bold">{testflowName}</p>
        </div>
        <!-- BODY -->
        <div style="flex:1; overflow:auto;">
          <div class="time-line ms-3">
            {#if testflowStore?.history}
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
                            class="px-1 text-fs-8 ellipsis">{request.name}</span
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
                    class="position-absolute bg-tertiary-750 d-flex align-items-center justify-content-center"
                    style="height:14px; width:14px; top:0; left: -8px; border-radius:50%; overflow:hidden;
                border: 1px solid var(--border-secondary-50);"
                  >
                    {#if history?.status === "pass"}
                      <CheckIcon2
                        height={"8px"}
                        width={"8px"}
                        color={"#69D696"}
                      />
                    {:else}
                      <ExclamationIcon
                        height={"8px"}
                        width={"8px"}
                        color="#FF7878"
                      />
                    {/if}
                  </div>
                </div>
              {/each}
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
    background-color: var(--bg-tertiary-750);
    position: absolute;
    bottom: 0;
    left: -2px;
    width: 4px;
    top: 14px;
  }
  .run-history-container {
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  }
</style>
