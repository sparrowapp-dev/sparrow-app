<script lang="ts">
  import { enableBodyScroll, disableBodyScroll } from "body-scroll-lock";
  import dragIcon from "$lib/assets/drag.svg";
  import trashIcon from "$lib/assets/trash-icon.svg";
  import { isHorizontalVertical } from "$lib/store/request-response-section";
  import { keyStore, valueStore } from "$lib/store/parameter";
  import { sortable } from "svelte-agnostic-draggable";

  let isHorizontalVerticalMode: boolean;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));

  function onSortableInit() {}

  function onSortableActivate() {
    disableBodyScroll(document.body);
  }

  function onSortStart() {}

  function onSortMove() {}

  function onSortStop() {}

  function onSortableOver() {}

  function onSortableChange() {}

  function onSortableRemove() {}

  function onSortableReceive() {}

  function onSortableUpdate() {}

  function onSortableOut() {}

  function onSortableDeactivate() {
    enableBodyScroll(document.body);
  }

  function onSortableDestroy() {}

  let isHovered: boolean = false;
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

  function updateKey(e) {
    keyStore.set(e.target.value);
  }

  function updateValue(e) {
    valueStore.set(e.target.value);
  }
</script>

<div class="d-flex flex-column mt-3 me-0 w-100">
  <div
    class="d-flex text-requestBodyColor align-items-center justify-content-between"
    style="font-size: 12px; font-weight: 500; width:{isHorizontalVerticalMode
      ? '50%'
      : '50%'}"
  >
    <p class="ps-5 ms-4">Key</p>
    <p style="margin-left: 130px;">Value</p>
  </div>

  <div
    class="w-100 sortable"
    use:sortable={{
      cursor: "grabbing",
    }}
    style="margin-bottom: 1px;
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
      <div
        role="button"
        aria-label="Toggle Hover"
        class="sortable > div"
        style="width: {isHorizontalVerticalMode ? '100%' : '100%'};"
      >
        <div
          on:mouseenter={toggleHover}
          on:mouseleave={toggleHover}
          style="padding-top: 1px;cursor: grab;background-color:backgroundColor;display: flex;flex-direction: column;width: {isHorizontalVerticalMode
            ? '100%'
            : '100%'};"
        >
          <div
            class="d-flex {isHorizontalVerticalMode
              ? 'w-100'
              : 'w-100'} align-items-center justify-content-center gap-3 mb-2"
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
                class="form-control bg-blackColor py-1 border-0"
                style="font-size: 13px;"
                bind:value={row.key}
                on:input={addRow}
                on:input={updateKey}
              />
            </div>
            <div class="flex-grow-1 w-100">
              <input
                on:mouseenter={toggleHover}
                on:mouseleave={toggleHover}
                type="text"
                placeholder="Enter Value"
                class="form-control bg-blackColor py-1 border-0"
                style="font-size: 13px;"
                bind:value={row.value}
                on:input={addRow}
                on:input={updateValue}
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
</style>
