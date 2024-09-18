<script>
  import { getMethodStyle } from "$lib/utils/helpers";
  import {
    CheckIcon2,
    CrossIcon,
    ExclamationIcon,
    HistoryIcon,
  } from "@library/icons";

  import { Tooltip } from "@library/ui";
  import { WithButtonV5 } from "@workspaces/common/hoc";
  import { FormatTime } from "@common/utils/formatTime";
  const formatTimeAgo = new FormatTime().formatTimeAgo;

  const timelines = [
    {
      status: "pass",
      successRequests: "7",
      failedRequests: "2",
      totalTIme: "10sec",
      timestamp: new Date().toISOString(),
      requests: [
        {
          method: "GET",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
        {
          method: "GET",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
        {
          method: "GET",
          name: "user login",
          status: "200",
          time: "1.52ms",
        },
        {
          method: "GET",
          name: "user login",
          status: "200",
          time: "1.52ms",
        },
        {
          method: "GET",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
      ],
      expand: true,
    },
    {
      status: "pass",
      successRequests: "7",
      failedRequests: "2",
      totalTIme: "10sec",
      timestamp: new Date().toISOString(),
      requests: [
        {
          method: "GET",
          name: "user login ndfjkebfrfbef refrfbjrefrjfbrerfrf fregferg",
          status: "201",
          time: "1.52ms",
        },
        {
          method: "POST",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
        {
          method: "GET",
          name: "user login ndfjkebfrfbef refrfbjrefrjfbrerfrf fregferg",
          status: "201",
          time: "1.52ms",
        },
        {
          method: "POST",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
      ],
      expand: false,
    },
    {
      status: "fail",
      successRequests: "7",
      failedRequests: "2",
      totalTIme: "10sec",
      timestamp: new Date().toISOString(),
      requests: [
        {
          method: "GET",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
        {
          method: "GET",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
        {
          method: "GET",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
        {
          method: "GET",
          name: "user login",
          status: "201",
          time: "1.52ms",
        },
      ],
      expand: true,
    },
    ,
  ];
</script>

<div class="position-relative">
  <div>
    <Tooltip title="History" placement="bottom-left" distance={10}>
      <WithButtonV5
        icon={HistoryIcon}
        onClick={() => {
          // quickHelp = true;
        }}
        disable={false}
        loader={false}
      />
    </Tooltip>
    <div
      class="position-absolute d-flex flex-column bg-tertiary-750 border-radius-2 p-3"
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
            <span class="ms-2 text-fs-12"> Run History </span>
          </div>
          <div>
            <CrossIcon
              height={"15px"}
              width={"15px"}
              color={"var(--icon-secondary-170)"}
            />
          </div>
        </div>
        <hr class="my-3" />

        <!-- TITLE -->
        <p class="text-fs-10">Login Flow</p>
      </div>
      <!-- BODY -->
      <div style="flex:1; overflow:auto;">
        <div class="time-line ms-3">
          {#each timelines as history}
            <div class="position-relative">
              <div class="ms-3 mb-1 p-3 bg-tertiary-670">
                <div class="d-flex justify-content-between mb-3">
                  <span class="text-fs-8">
                    {history?.successRequests} Success | {history?.failedRequests}
                    fail
                  </span>
                  <span class="text-fs-8">{history?.totalTIme}</span>
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
                        class="text-fs-8 text-center text-{request.status ===
                        '201'
                          ? 'deleteColor'
                          : 'getColor'}">{request.status}</span
                      >
                      <span
                        style="padding: 0px 2px; width: 40px; text-align: right;"
                        class="text-fs-8 text-{request.status === '201'
                          ? 'deleteColor'
                          : 'getColor'}">{request.time}</span
                      >
                    </div>
                  {/if}
                {/each}
                {#if !history.expand && history?.requests.length > 2}
                  <span class="text-fs-8">see all 8 requests</span>
                {:else if history.expand && history?.requests.length > 2}
                  <span class="text-fs-8">see Less</span>
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
                border: 1px solid grey;"
              >
                {#if history.status === "pass"}
                  <CheckIcon2 height={"8px"} width={"8px"} color={"green"} />
                {:else}
                  <ExclamationIcon height={"8px"} width={"8px"} color="red" />
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .time-line {
    border-left: 1px solid grey;
  }
</style>
