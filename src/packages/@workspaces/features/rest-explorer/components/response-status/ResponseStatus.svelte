<script lang="ts">
  import { ResponseStatusCode } from "$lib/utils/enums/request.enum";
  import { BoxIcon, ClockIcon, DotIcon } from "@library/icons";
  import type { Response } from "@common/types/rest-explorer";
  import Tooltip from "@common/components/tooltip/Tooltip.svelte";

  export let response: Response;
</script>

<div class="d-flex flex-column align-items-start justify-content-between w-100">
  <div
    class="response-container d-flex align-items-center justify-content-between p-2 w-100 z-1 position-sticky border-radius-2"
    style="top:55.4px;  margin-top: -1px;"
  >
    <div class="d-flex align-items-center gap-2">
      <!-- insert controller here -->
      <div class="d-flex gap-2">
        <Tooltip
          title="HTTP Status - {response.status.split(' ')[1]}"
          verticalOffset="- 42px"
          horizontalArrowOffset="+ 20px"
        >
          <span
            class="statuscode position-relative cursor-pointer border-0"
            style="font-size: 12px;"
          >
            <span
              class="ellipsis"
              style="color:{response.status === ResponseStatusCode.OK ||
              response.status === ResponseStatusCode.CREATED
                ? 'var(--success-color)'
                : 'var(--request-delete)'};"
            >
              <span class="me-1">
                <DotIcon
                  color={response.status === ResponseStatusCode.OK ||
                  response.status === ResponseStatusCode.CREATED
                    ? "var(--success-color)"
                    : "var(--request-delete)"}
                />
              </span>
              {response.status.split(" ")[0]}</span
            >
          </span>
        </Tooltip>
        <span
          class="d-flex align-items-center ps-1 pe-1 border-0 justify-content-center rounded text-backgroundColor gap-1 time-primary1"
          style="font-size: 12px;"
        >
          <span>
            <span class="me-1">
              <ClockIcon />
            </span>
            {response.time}
          </span>
          <p class="mb-0">ms</p>
        </span>
        <span
          class="d-flex align-items-center ps-1 pe-1 justify-content-center rounded border-0 text-backgroundColor gap-1 size-primary1"
          style="font-size: 12px;"
        >
          <span>
            <span class="me-1">
              <BoxIcon />
            </span>
            {response.size?.toFixed(2)}
          </span>
          <p class="mb-0">KB</p>
        </span>
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
    color: var(--success-color) !important;
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
