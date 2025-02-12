<script lang="ts">
  import { trashIcon as trashIcon } from "@sparrow/library/assets";
  import { Tooltip } from "@sparrow/library/ui";
  import { Input } from "@sparrow/library/forms";
  import { Toggle } from "@sparrow/library/ui";

  export let element;
  export let index;
  export let pairs;
  export let updateParam;
  export let updateCheck;
  export let deleteParam;
</script>

<div style="background-color: var(--bg-secondary-700);">
  <div
    class="ps-5 d-flex justify-content-between align-items-center bg-secondary-700 w-100"
    style="font-size: 12px; font-weight: 500; margin-bottom: 4px;"
  >
    <div
      class="position-relative w-50 d-flex justify-content-between align-items-center"
    >
      <div class="w-100">
        <Input
          id={`environment-search}`}
          type="text"
          bind:value={element.event}
          on:input={() => updateParam(index)}
          width={"100%"}
          height={"20px"}
          class="text-fs-12 me-5 bg-secondary-600"
          style="outline:none; background-color:transparent;"
          placeholder="Name"
          defaultBorderColor="transparent"
          hoveredBorderColor={"var(--border-primary-300)"}
          focusedBorderColor={"var(--border-primary-300)"}
          isEditIconRequired={false}
        />
      </div>
    </div>

    <div class=" ps-1 d-flex w-50 justify-content-between">
      <div class="d-flex align-items-center">
        {#if true}
            <Toggle
          bind:isActive={element.listen}
          onChange={() => {
              updateCheck(index);
            }}
         /> 
        {:else}
          <div style="width: 24px;"></div>
        {/if}
      </div>

      <div class="pe-2">
        {#if index !== pairs.length - 1}
          <Tooltip title={"Delete"} placement={"bottom-right"} distance={10}>
            <button
              class="bg-secondary-700 d-flex justify-content-center align-items-center border-0"
              style="width: 24px; height:16px;"
              on:click={() => deleteParam(index)}
            >
              <img class="trash-icon" src={trashIcon} alt="" />
            </button>
          </Tooltip>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .trash-icon:hover {
    background-color: var(--bg-secondary-500);
  }
</style>
