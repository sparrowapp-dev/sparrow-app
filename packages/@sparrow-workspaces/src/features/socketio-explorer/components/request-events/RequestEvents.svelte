<script lang="ts">

  import RequestEventsList from "../events-lists/RequestEventsList.svelte";
  import type { EventsValues } from "@sparrow/common/types/workspace/socket-io-request-tab";

  // exports
  export let keyValue: EventsValues[];
  export let callback: (pairs: EventsValues[]) => void;

  export let isTopHeaderRequired = true;
  export let isInputBoxEditable = true;

  let pairs: EventsValues[] = keyValue;



  const updateParam = (index: number): void => {
    pairs = pairs;
    if (
      pairs.length - 1 === index &&
      isInputBoxEditable &&
      pairs[index].event !== ""
    ) {
      pairs[pairs.length - 1].listen = true;
      pairs.push({ event: "", listen: false });
      pairs = pairs;
    }
    callback(pairs);
  };

  const deleteParam = (index: number): void => {
    if (pairs.length > 1) {
      let filteredKeyValue = pairs.filter((elem, i) => {
        if (i !== index) {
          return true;
        }
        return false;
      });
      pairs = filteredKeyValue;
    }
    callback(pairs);
    setTimeout(() => {
      pairs[pairs.length - 1].event = "";
    }, 0);
  };

  const updateCheck = (index: number): void => {
    let filteredKeyValue = pairs.map((elem, i) => {
        if (i === index) {
        elem.listen = !elem.listen;
      }
      return elem;
    });
    pairs = filteredKeyValue;
    callback(pairs);
  };

</script>

 <div class="outer-section">
  <div
    class="mb-0 me-0 w-100 bg-secondary-700 py-0 section-layout rounded-3"
    
  >
    <div
      class="d-flex gap-3 py-1 align-items-center w-100 {!isTopHeaderRequired
        ? 'd-none'
        : ''}"
      style="height:26px; "
    >
      <div
        class="d-flex align-items-center w-100 rounded-top-1"
        style="font-size: 12px; font-weight: 500; background-color:var(--bg-ds-surface-400);padding:0px 24px"
      >
        <p
          class="mb-0 w-50 text-fs-12 "
          style="font-weight: 500;padding:2px 8px;color:var(--text-ds-neutral-200)"
        >
          Event
        </p>

        <p
          class="mb-0 w-50 text-fs-12 p-1"
          style="font-weight: 500;padding:2px 8px;color:var(--text-ds-neutral-200)"
        >
          Listen
        </p>

      </div>
    </div>

      <div class="w-100" style="display:block; position:relative;">
      {#each pairs as element, index (index)}
        <RequestEventsList
          {element}
          {index}
          {pairs}
          {updateParam}
          {updateCheck}
          {deleteParam}
        />
      {/each}
    </div>
  </div>
</div>


