<script lang="ts">
  import RequestEventsList from "../events-lists/RequestEventsList.svelte";
  import { onMount } from "svelte";
  import type { EventsValues } from "@sparrow/common/types/workspace/socket-io-request-tab";

  export let events;

  export let onEventsChange;

  const handleEventChange = (pairs: any[]): void => {
    onEventsChange(pairs);
  };

  //  export let callback;

  let pairs: EventsValues;

  export let isTopHeaderRequired = true;
</script>

<div class="outer-section">
  <div
    class="mb-0 me-0 w-100 bg-secondary-700 py-0 border-radius-2 section-layout"
  >
    <div
      class="d-flex gap-3 py-1 mb-1 align-items-center w-100 {!isTopHeaderRequired
        ? 'd-none'
        : ''}"
      style="height:26px; "
    >
      <div
        class="ps-4 d-flex bg-secondary-700 align-items-center w-100"
        style="font-size: 12px; font-weight: 500; background-color:#1B1B1B;"
      >
        <p
          class="mb-0 w-50 text-secondary-200 text-fs-12 p-1"
          style="font-weight: 1000;"
        >
          Key
        </p>

        <p
          class="mb-0 w-50 text-secondary-200 text-fs-12 ps-0 ms-3"
          style="font-weight: 1000;"
        >
          Listen
        </p>

        <div class="h-75 pe-2">
          <button class=" border-0" style="width:70px;" />
        </div>
      </div>
    </div>

    <RequestEventsList pairs={events} callback={handleEventChange} />
  </div>
</div>

<style>
  .section-layout {
    border-top: 1px solid var(--border-secondary-500);
    border-bottom: 1px solid var(--border-secondary-500);
  }
</style>
