<script context="module">
  import { enableBodyScroll, disableBodyScroll } from "body-scroll-lock";
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import {
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/request-response-section";

  //this is for horizaontal and vertical mode
  let isHorizontalVerticalMode;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  //this is for expand and collaps
  let isCollaps;
  collapsibleState.subscribe((value) => (isCollaps = value));
</script>

<script>
  import { sortable } from "svelte-agnostic-draggable";

  /**** Svelte Event Handling ****/

  function onSortableInit() {
    console.log("Sortable was created");
  }

  function onSortableActivate() {
    console.log("Sortable was activated");
    disableBodyScroll(document.body);
  }

  function onSortStart() {
    console.log("sorting started");
  }

  function onSortMove() {
    console.log("sorting continues");
  }

  function onSortStop() {
    console.log("sorting stopped");
  }

  function onSortableOver() {
    console.log("Draggable entered Sortable");
  }

  function onSortableChange() {
    console.log("sort order was changed");
  }

  function onSortableRemove() {
    console.log("list element was removed");
  }

  function onSortableReceive() {
    console.log("list element was added");
  }

  function onSortableUpdate() {
    console.log("list items were updated");
  }

  function onSortableOut() {
    console.log("Draggable left Sortable");
  }

  function onSortableDeactivate() {
    console.log("Sortable was deactivated");
    enableBodyScroll(document.body);
  }

  function onSortableDestroy() {
    console.log("Sortable was destroyed");
  }

  /**** List Data ****/

  let isHovered = false;
  let rows = [{ key: "", value: "" }];

  function toggleHover() {
    isHovered = !isHovered;
  }

  function addRow() {
    if (rows.length === 1 && rows[0].key === "" && rows[0].value === "") {
      rows[0].key = "New Key";
      rows[0].value = "New Value";
    } else if (
      rows[rows.length - 1].key !== "" ||
      rows[rows.length - 1].value !== ""
    ) {
      rows = [...rows, { key: "", value: "" }];
    }
  }
</script>

{#if isHorizontalVerticalMode}
  <div
    class="d-flex flex-column mt-4"
    style="overflow:auto;overflow-x:hidden;height:492px;"
  >
    <div
      class="d-flex text-requestBodyColor py-0 align-items-center justify-content-between"
      style="font-size: 12px; font-weight: 500;"
    >
      <p class="ps-5">Key</p>
      <p style="margin-right: 190px;">Value</p>
    </div>

    <div
      class="sortable"
      use:sortable={{
        cursor: "grabbing",
        zIndex: 10,
      }}
      style="
      display: block;
      position: relative;
      width:{isCollaps ? '100%' : '100%'}
      margin-bottom: 1px;
    "
      on:sortable:init={onSortableInit}
      on:sortable:destroy={onSortableActivate}
      on:sortable:activate={onSortableActivate}
      on:sortable:deactivate={onSortableDeactivate}
      on:sort:start={onSortStart}
      on:sort:move={onSortMove}
      on:sort:stop={onSortStop}
      on:sortable:over={onSortableOver}
      on:sortable:out={onSortableOut}
      on:sortable:change={onSortableChange}
      on:sortable:update={onSortableUpdate}
      on:sortable:remove={onSortableRemove}
      on:sortable:receive={onSortableReceive}
    >
      {#each rows as row, index}
        <div role="button" aria-label="Toggle Hover" class="sortable > div">
          <div
            on:mouseenter={toggleHover}
            on:mouseleave={toggleHover}
            style="
            margin: 0px;
            padding-top: 3px;
            cursor: grab;
            background-color:backgroundColor; /* Modify as needed */   
            display: flex;
            flex-direction: column;
            width: {isCollaps ? '100%' : '480px'};
          "
          >
            <div
              class="d-flex align-items-center justify-content-center gap-3 mb-2"
            >
              <img src={dragIcon} alt="" style="cursor:grabbing;" />
              <div>
                <input
                  class="form-check-input"
                  type="checkbox"
                  on:mouseenter={toggleHover}
                  on:mouseleave={toggleHover}
                />
              </div>

              <div class="flex-grow-1 w-100">
                <input
                  on:mouseenter={toggleHover}
                  on:mouseleave={toggleHover}
                  type="text"
                  placeholder="Enter Key"
                  class="form-control bg-blackColor py-1"
                  style="font-size: 13px;"
                  bind:value={row.key}
                  on:input={addRow}
                />
              </div>
              <div class="flex-grow-1 w-100">
                <input
                  on:mouseenter={toggleHover}
                  on:mouseleave={toggleHover}
                  type="text"
                  placeholder="Enter Value"
                  class="form-control bg-blackColor py-1"
                  style="font-size: 13px;"
                  bind:value={row.value}
                  on:input={addRow}
                />
              </div>
              <div class="w-75 h-75 pe-1">
                <button class="bg-backgroundColor border-0">
                  <img src={trashIcon} alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div
    class="d-flex flex-column mt-2 w-100"
    style="overflow:auto;overflow-x:hidden;height:200px;"
  >
    <div
      class="d-flex text-requestBodyColor ps-4 py-0 align-items-center justify-content-between"
      style="font-size: 12px; font-weight: 500;width:50%;"
    >
      <p class="ps-5">Key</p>
      <p class="pe-5">Value</p>
    </div>

    <div
      class="sortable"
      use:sortable={{
        cursor: "grabbing",
        zIndex: 10,
      }}
      style="

      display: block;
      position: relative;
      width: {isCollaps ? '100%' : '100%'};
      margin-bottom: 1px;
    "
      on:sortable:init={onSortableInit}
      on:sortable:destroy={onSortableActivate}
      on:sortable:activate={onSortableActivate}
      on:sortable:deactivate={onSortableDeactivate}
      on:sort:start={onSortStart}
      on:sort:move={onSortMove}
      on:sort:stop={onSortStop}
      on:sortable:over={onSortableOver}
      on:sortable:out={onSortableOut}
      on:sortable:change={onSortableChange}
      on:sortable:update={onSortableUpdate}
      on:sortable:remove={onSortableRemove}
      on:sortable:receive={onSortableReceive}
    >
      {#each rows as row, index}
        <div role="button" aria-label="Toggle Hover" class="sortable > div">
          <div
            on:mouseenter={toggleHover}
            on:mouseleave={toggleHover}
            style="
             width: {isCollaps ? '100%' : '100%'};
            margin: 0px;
            padding-top: 3px;
            cursor: grab;
            background-color:backgroundColor; /* Modify as needed */   
            display: flex;
            flex-direction: column;
          "
          >
            <div
              style="  width: {isCollaps ? '100%' : '100%'};"
              class="d-flex align-items-center justify-content-center gap-3 mb-2"
            >
              <img src={dragIcon} alt="" style="cursor:grabbing;" />
              <div>
                <input
                  class="form-check-input"
                  type="checkbox"
                  on:mouseenter={toggleHover}
                  on:mouseleave={toggleHover}
                />
              </div>
              <div class="flex-grow-3 w-100">
                <input
                  on:mouseenter={toggleHover}
                  on:mouseleave={toggleHover}
                  type="text"
                  placeholder="Enter Key"
                  class="form-control bg-blackColor py-1"
                  style="font-size: 13px;"
                  bind:value={row.key}
                  on:input={addRow}
                />
              </div>
              <div class="flex-grow-3 w-100">
                <input
                  on:mouseenter={toggleHover}
                  on:mouseleave={toggleHover}
                  type="text"
                  placeholder="Enter Value"
                  class="form-control bg-blackColor py-1"
                  style="font-size: 13px;"
                  bind:value={row.value}
                  on:input={addRow}
                />
              </div>
              <div class="w-75 h-75 pe-1">
                <button class="bg-backgroundColor border-0">
                  <img src={trashIcon} alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .sortable > div {
    -webkit-touch-callout: none;
    -ms-touch-action: none;
    touch-action: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .inputField {
    border: none;
  }

  .inputField:hover {
    border-bottom: 1px solid red; /* Change border color as needed */
  }
</style>
