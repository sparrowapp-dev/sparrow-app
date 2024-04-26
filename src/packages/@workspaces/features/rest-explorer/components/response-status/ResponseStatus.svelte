<script lang="ts">
  import { ResponseStatusCode } from "$lib/utils/enums/request.enum";
  import StatusSuccess from "$lib/assets/status-success.svelte";
  import StatusError from "$lib/assets/status-error.svelte";
  import { BoxIcon, ClockIcon, DotIcon } from "@library/icons";

  export let response;
</script>

<div class="d-flex flex-column align-items-start justify-content-between w-100">
  <div
    class="response-container d-flex align-items-center justify-content-between p-2 w-100 z-1 position-sticky"
    style="top:55.4px;  margin-top: -1px;"
  >
    <div class="d-flex align-items-center gap-2">
      <!-- insert controller here -->
      <div class="d-flex gap-2">
        <button
          class="statuscode position-relative cursor-pointer border-0"
          style="font-size: 10px;"
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
        </button>
        <button
          class="d-flex align-items-center ps-1 pe-1 border-0 justify-content-center rounded text-backgroundColor gap-1 time-primary1"
          style="font-size: 10px;"
        >
          <span>
            <span class="me-1">
              <ClockIcon />
            </span>
            {response.time}
          </span>
          <p class="mb-0">ms</p>
        </button>
        <button
          class="d-flex align-items-center ps-1 pe-1 justify-content-center rounded border-0 text-backgroundColor gap-1 size-primary1"
          style="font-size: 10px;"
        >
          <span>
            <span class="me-1">
              <BoxIcon />
            </span>
            {response.size?.toFixed(2)}
          </span>
          <p class="mb-0">KB</p>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .response-container {
    flex-wrap: wrap;
    background-color: var(--bg-secondary-500);
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
