<script lang="ts">
  import { ResponseStatusCode } from "@sparrow/common/enums/request.enum";
  import {
    ArchiveRegular,
    BoxIcon,
    ClockIcon,
    ClockRegular,
    DotIcon,
  } from "@sparrow/library/icons";
  import type { Response } from "@sparrow/common/types/workspace";
  import { Tooltip } from "@sparrow/library/ui";
  export let response: Response;

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
    <div
      class="d-flex align-items-center gap-2 ms-auto"
      style="justify-content: right;"
    >
      <!-- insert controller here -->
      <div class="d-flex align-items-center gap-3">
        <Tooltip
          title="HTTP Status - {response.status}"
          placement={"bottom-center"}
          zIndex={500}
        >
          <span
            class="statuscode gap-1 d-flex align-items-center position-relative cursor-pointer border-0"
            style="font-size: 12px; "
          >
            <span
              class="ellipsis d-flex align-items-center response-text"
              style="gap:6px;color:{checkIfRequestSucceed(response?.status)
                ? 'var(--text-ds-success-300)'
                : 'var(--request-delete)'};"
            >
              <span class="d-flex">
                <DotIcon
                  color={checkIfRequestSucceed(response?.status)
                    ? "var(--text-ds-success-300)"
                    : "var(--request-delete)"}
                  height={"6px"}
                  width={"6px"}
                />
              </span>
              {response.status.split(" ")[0]}</span
            >
          </span>
        </Tooltip>
        <Tooltip title="Time" placement={"bottom-center"} zIndex={500}>
          <span
            class="text-fs-12 d-flex align-items-center border-0 justify-content-center align-items-center rounded time-primary1 response-text"
            style=" color:{checkIfRequestSucceed(response?.status)
              ? 'var(--text-ds-success-300)'
              : 'var(--request-delete)'};"
          >
            <span class="d-flex">
              <ClockRegular
                size="12px"
                color={checkIfRequestSucceed(response?.status)
                  ? "var(--text-ds-success-300)"
                  : "var(--request-delete)"}
              />
            </span>
            <span
              class="text-fs-12"
              style=" margin-left:6px;color:{checkIfRequestSucceed(
                response?.status,
              )
                ? 'var(--text-ds-success-300)'
                : 'var(--request-delete)'};"
            >
              {response.time}
            </span>
            <p
              class="mb-0 text-fs-12"
              style="margin-left:3px; font-size: 12px; color:{checkIfRequestSucceed(
                response?.status,
              )
                ? 'var(--text-ds-success-300)'
                : 'var(--request-delete)'};"
            >
              ms
            </p>
          </span>
        </Tooltip>
        <Tooltip title="Size" placement={"bottom-center"} zIndex={500}>
          <span
            class="d-flex align-items-center justify-content-center rounded border-0 text-backgroundColor size-primary1 response-text"
            style="font-size: 12px;"
          >
            <span class="d-flex" style="margin-right: 6px;">
              <ArchiveRegular size={"12px"} color="var(--icon-ds-neutral-50)" />
            </span>
            {response.size?.toFixed(2)}
            <p class="mb-0 ms-1" style="font-size: 12px;">KB</p>
          </span>
        </Tooltip>
      </div>
    </div>
  </div>
</div>

<style>
  .response-container {
    flex-wrap: wrap;
  }

  .time-primary1 {
    color: var(--text-ds-success-300) !important;
    background-color: transparent;
  }
  .size-primary1 {
    color: var(--text-secondary-100) !important;
    background-color: transparent;
  }
  .statuscode {
    background-color: transparent;
  }
  .response-text {
    font-weight: 500;
  }
</style>
