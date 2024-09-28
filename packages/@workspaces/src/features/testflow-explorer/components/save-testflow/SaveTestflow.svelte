<script>
  import { DiskIcon } from "@sparrow/library/icons";

  import { Tooltip } from "@sparrow/library/ui";
  export let isSave;
  export let isTestflowEditable;
  export let onSaveTestflow;
  let isHovered = false;
</script>

<div class="pe-1">
  <Tooltip title={"Save"} placement={"bottom"} distance={12} zIndex={10}>
    <button
      class="save-disk d-flex align-items-center justify-content-center border-radius-2 border-0"
      on:click={onSaveTestflow}
      on:mouseenter={() => {
        isHovered = true;
      }}
      on:mouseleave={() => {
        isHovered = false;
      }}
      disabled={isSave || !isTestflowEditable ? true : false}
      style="background-color: {isSave || !isTestflowEditable
        ? 'var(--icon-secondary-550)'
        : 'var(--bg-secondary-970)'}; color: white;"
    >
      <DiskIcon
        height={22}
        width={22}
        color={isSave || !isTestflowEditable
          ? "var(--icon-secondary-380)"
          : isHovered
            ? "var(--icon-primary-200)"
            : "var(--icon-secondary-100)"}
      />
    </button>
  </Tooltip>
</div>

<style>
  .save-disk {
    padding: 7px;
  }
  .save-disk:disabled {
    background-color: var(--bg-secondary-550);
  }
</style>
