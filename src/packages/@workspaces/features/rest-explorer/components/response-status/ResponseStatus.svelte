<script lang="ts">
  import { ResponseStatusCode } from "$lib/utils/enums/request.enum";
  import StatusSuccess from "$lib/assets/status-success.svelte";
  import StatusError from "$lib/assets/status-error.svelte";

  export let response;
</script>

<div class="d-flex flex-column align-items-start justify-content-between w-100">
  <div
    class="response-container d-flex align-items-center justify-content-between pb-3 w-100 z-1 position-sticky"
    style="top:55.4px;  margin-top: -1px;"
  >
    <div class="d-flex align-items-center gap-2">
      <!-- insert controller here -->
      <div class="d-flex gap-2">
        <button
          class="statuscode position-relative cursor-pointer ps-1 pe-1 border-0 rounded d-flex align-items-center justify-content-center text-backgroundColor gap-1 {response.status ===
            '200 OK' || response.status === '201 Created'
            ? 'status-primary1'
            : 'status-danger'} "
          style="font-size: 10px;"
        >
          {#if response.status?.length > 12}
            <div class="position-absolute tooltip-statuscode">
              <span class="ellipsis">
                <span class="me-1">
                  {#if response.status === ResponseStatusCode.OK || response.status === ResponseStatusCode.CREATED}
                    <StatusSuccess
                      height={8}
                      width={8}
                      backgroundColor={"var(--success-color)"}
                      textColor={"var(--background-color)"}
                    />
                  {:else}
                    <StatusError
                      height={8}
                      width={8}
                      backgroundColor={"var(--request-delete)"}
                      textColor={"var(--background-color)"}
                    />
                  {/if}
                </span>
                {response.status}</span
              >
            </div>
          {/if}
          <span class="ellipsis">
            <span class="me-1">
              {#if response.status === ResponseStatusCode.OK || response.status === ResponseStatusCode.CREATED}
                <StatusSuccess
                  height={8}
                  width={8}
                  backgroundColor={"var(--success-color)"}
                  textColor={"var(--background-color)"}
                />
              {:else}
                <StatusError
                  height={8}
                  width={8}
                  backgroundColor={"var(--request-delete)"}
                  textColor={"var(--background-color)"}
                />
              {/if}
            </span>
            {response.status}</span
          >
        </button>
        <button
          class="d-flex align-items-center ps-1 pe-1 border-0 justify-content-center rounded text-backgroundColor gap-1 time-primary1"
          style="font-size: 10px;"
        >
          <span>{response.time}</span>
          <p class="mb-0">ms</p>
        </button>
        <button
          class="d-flex align-items-center ps-1 pe-1 justify-content-center rounded border-0 text-backgroundColor gap-1 size-primary1"
          style="font-size: 10px;"
        >
          <span>{response.size?.toFixed(2)}</span>
          <p class="mb-0">KB</p>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .response-container {
    flex-wrap: wrap;
    background-color: #22232e;
  }

  .status-primary1 {
    color: var(--success-color) !important;
    background-color: transparent;
    padding-top: 1px;
    padding-bottom: 1px;
    max-width: 100px;
  }
  .status-danger {
    color: var(--request-delete) !important;
    background-color: transparent;
    padding-top: 1px;
    padding-bottom: 1px;
    max-width: 100px;
  }
  .status-danger:hover,
  .status-primary1:hover {
    background-color: var(--background-light) !important;
  }

  .time-primary1 {
    color: var(--send-button) !important;
    background-color: transparent;
  }
  .size-primary1 {
    color: var(--request-post) !important;
    background-color: transparent;
  }
  .tooltip-statuscode {
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--background-light) !important;
    padding: 4px 8px;
    border-radius: 4px;
    display: none;
    transition: 0.2s ease-in-out;
  }
  .statuscode {
    padding: 4px 8px;
  }
  .statuscode:hover .tooltip-statuscode {
    display: block;
    transition: 0.2s ease-in-out;
  }
</style>
