<script lang="ts">
  import type {
    KeyValuePair,
    KeyValuePairWithBase,
  } from "@sparrow/common/interfaces/request.interface";

  import RequestEventsList from "../events-lists/RequestEventsList.svelte";
  import { TabularInputTheme } from "../../../../utils";
  import type { EventsValues } from "@sparrow/common/types/workspace/socket-io-request-tab";

  // exports
  export let keyValue: KeyValuePair[];
  export let callback: (pairs: KeyValuePair[]) => void;
  export let environmentVariables;
  export let onUpdateEnvironment;

  export let isCheckBoxEditable = true;
  export let isTopHeaderRequired = true;
  export let isInputBoxEditable = true;

  let pairs: EventsValues[] = keyValue;
  let controller: boolean = false;

  const theme = new TabularInputTheme().build();

  $: {
    if (keyValue) {
      identifySelectAllState();
    }
  }

  /**
   * @description - calculates the select all checkbox state - weather checked or not
   */
  const identifySelectAllState = () => {
    pairs = [];
    pairs = keyValue;
    controller = false;
    // if (pairs.length > 1) {
    //   let isUncheckedExist: boolean = false;
    //   for (let i = 0; i < pairs.length - 1; i++) {
    //     if (pairs[i].listen === false) {
    //       isUncheckedExist = true;
    //       break;
    //     }
    //   }
    //   if (isUncheckedExist) {
    //     controller = false;
    //   } else {
    //     controller = true;
    //   }
    // }
  };

  const updateParam = (index: number): void => {
    pairs = pairs;
    if (
      pairs.length - 1 === index &&
      // although in readonly mode input is disabled
      // but codemirror internally invokes this function and updates key value
      // so one more extra check here for read only mode
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

  let isBulkEditLoaded = false;
</script>

<div class="outer-section">
  <section
    class="mb-0 me-0 w-100 py-0 border-radius-2 section-layout"
    style="overflow:hidden;"
  >
    <div
      class="w-100 d-flex align-items-center px-3 pair-header-row {!isTopHeaderRequired
        ? 'd-none'
        : ''}"
      style="position:relative;"
    >
      <div style="height:14px; width:14px;" class="me-3"></div>

      <div class="d-flex gap-0" style="width: calc(100% - 188px);">
        <div
          class="w-50 position-relative text-fs-12 text-secondary-200 fw-bold"
          style="padding-left: 6px;"
        >
          Key
        </div>
        <div
          class="w-50 position-relative text-fs-12 text-secondary-200 fw-bold"
          style="padding-left: 68px;"
        >
          Value
        </div>
      </div>
      <div style="width:140px;" class="ms-3 d-flex align-items-center">
        <div class="w-100 d-flex">
          <div class="w-100 d-flex justify-content-end"></div>
        </div>
      </div>
    </div>
    <div class="w-100" style="display:block; position:relative;">
      {#each pairs as element, index (index)}
        <RequestEventsList
          {element}
          {index}
          {pairs}
          {theme}
          {environmentVariables}
          {onUpdateEnvironment}
          {updateParam}
          {updateCheck}
          {deleteParam}
          {isInputBoxEditable}
          {isCheckBoxEditable}
        />
      {/each}
    </div>
  </section>
</div>

<!-- <script lang="ts">
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
</script> -->

<!-- <div class="outer-section">
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
</div> -->

<!-- <style>
  .section-layout {
    border-top: 1px solid var(--border-secondary-500);
    border-bottom: 1px solid var(--border-secondary-500);
  }
</style> -->

<style>
  .pair-header-row {
    padding-top: 3px;
    padding-bottom: 3px;
    background-color: var(--bg-secondary-880);
    height: 26px;
  }

  /* The checkbox-parent */
  .checkbox-parent {
    display: block;
    position: relative;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Hide the browser's default checkbox */
  .checkbox-parent input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    background-color: transparent;
    border: 2px solid var(--text-secondary-500);
  }

  /* Create a custom checkbox */
  .checkbox-parent .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 14px;
    width: 14px;
    border-radius: 3px;
    background-color: transparent;
    border: 2px solid var(--text-secondary-500);
  }

  /* On mouse-over, add a grey background color */
  /* .checkbox-parent:hover input ~ .checkmark {
    background-color: #ccc;
  } */

  /* When the checkbox is checked, add a blue background */
  .checkbox-parent input:checked ~ .checkmark {
    border: none;
    background-color: var(--bg-primary-300);
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkbox-parent .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .checkbox-parent input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .checkbox-parent .checkmark:after {
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid var(--text-secondary-800);
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>
