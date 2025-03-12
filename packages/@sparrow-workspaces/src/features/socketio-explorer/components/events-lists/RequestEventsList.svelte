<script lang="ts">
  import { trashIcon as trashIcon } from "@sparrow/library/assets";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { Input } from "@sparrow/library/forms";
  import { Toggle } from "@sparrow/library/ui";
  import { DeleteRegular } from "@sparrow/library/icons";

  export let element;
  export let index;
  export let pairs;
  export let updateParam;
  export let updateCheck;
  export let deleteParam;
</script>

<div style="background-color: var(--bg-ds-surface-600);" class="rounded-bottom-1">
  <div
    class="d-flex justify-content-between align-items-center bg-secondary-700 w-100 rounded-bottom-1"
    style="font-size: 12px; font-weight: 500;background-color: var(--bg-ds-surface-600);padding:0px 4px 0px 24px;border-top: var(--border-ds-surface-400) 1px solid;"
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
          size="small"
          class="text-fs-12 fw-medium me-5 bg-secondary-600"
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
            isActive={element.listen}
            onChange={() => {
              updateCheck(index);
            }}
          />
        {:else}
          <div style="width: 24px;"></div>
        {/if}
      </div>

      <div class="">
        {#if index !== pairs.length - 1}
          <Tooltip title={"Delete"} placement={"bottom-right"} distance={10}>
            <Button
              buttonClassProp=""
              size="extra-small"
              type="teritiary-regular"
              startIcon={DeleteRegular}
              onClick={() => deleteParam(index)}
            />
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
