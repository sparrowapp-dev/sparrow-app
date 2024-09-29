<script lang="ts">
  import { ResponseStatusCode } from "@sparrow/common/enums/request.enum";
  import { BoxIcon, ClockIcon, DotIcon } from "@sparrow/library/icons";
  import type { Response } from "@sparrow/common/types/workspace";
  import { Tooltip } from "@sparrow/library/ui";
  export let response;

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

<div class="d-flex flex-column align-items-start justify-content-between w-100">
  <div
    class="response-container d-flex align-items-center justify-content-between z-1 p-2 w-100 position-sticky border-radius-2"
    style="top:55.4px;  margin-top: -1px;"
  >
    <div class="d-flex align-items-center gap-2">
      <!-- insert controller here -->
      <div class="d-flex align-items-center gap-2">
        <Tooltip
          title="HTTP Status - {response.status}"
          placement={"bottom"}
          zIndex={500}
          distance={20}
        >
          <span
            class="statuscode gap-1 d-flex align-items-center position-relative cursor-pointer border-0"
            style="font-size: 12px;"
          >
            <span
              class="ellipsis d-flex align-items-center"
              style="color:{checkIfRequestSucceed(response?.status)
                ? 'var(--icon-success-100)'
                : 'var(--request-delete)'};"
            >
              <span class="me-2 d-flex">
                <DotIcon
                  color={checkIfRequestSucceed(response?.status)
                    ? "var(--icon-success-100)"
                    : "var(--request-delete)"}
                  height={"6px"}
                  width={"6px"}
                />
              </span>
              {response.status.split(" ")[0]}</span
            >
          </span>
        </Tooltip>
        <Tooltip
          title="Response Time"
          placement={"bottom"}
          zIndex={500}
          distance={20}
        >
          <span
            class="text-fs-12 d-flex align-items-center ps-1 pe-1 border-0 justify-content-center rounded text-backgroundColor gap-1 time-primary1"
            style=" color:{checkIfRequestSucceed(response?.status)
              ? 'var(--icon-success-100)'
              : 'var(--request-delete)'};"
          >
            <span class="me-1 d-flex">
              <ClockIcon
                color={checkIfRequestSucceed(response?.status)
                  ? "var(--icon-success-100)"
                  : "var(--request-delete)"}
                height={"8px"}
                width={"8px"}
              />
            </span>
            <span
              class="text-fs-12"
              style=" color:{checkIfRequestSucceed(response?.status)
                ? 'var(--icon-success-100)'
                : 'var(--request-delete)'};"
            >
              {response.time}
            </span>
            <p
              class="mb-0 text-fs-12"
              style=" font-size: 12px; color:{checkIfRequestSucceed(
                response?.status,
              )
                ? 'var(--icon-success-100)'
                : 'var(--request-delete)'};"
            >
              ms
            </p>
          </span>
        </Tooltip>
        <Tooltip
          title="Response Size"
          placement={"bottom"}
          zIndex={500}
          distance={20}
        >
          <span
            class="d-flex align-items-center ps-1 pe-1 justify-content-center rounded border-0 text-backgroundColor gap-1 size-primary1"
            style="font-size: 12px;"
          >
            <span class="me-1 d-flex">
              <BoxIcon />
            </span>
            {response.size?.toFixed(2)}
            <p class="mb-0" style="font-size: 12px;">KB</p>
          </span>
        </Tooltip>
      </div>
    </div>
  </div>
</div>

<style>
  .response-container {
    flex-wrap: wrap;
    background-color: var(--bg-tertiary-400);
  }

  .time-primary1 {
    color: var(--icon-success-100) !important;
    background-color: transparent;
  }
  .size-primary1 {
    color: var(--text-secondary-100) !important;
    background-color: transparent;
  }
  .statuscode {
    padding: 4px 8px;
    background-color: transparent;
  }
</style>
