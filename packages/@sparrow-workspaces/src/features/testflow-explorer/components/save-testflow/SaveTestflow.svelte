<script lang="ts">
  import { SaveRegular } from "@sparrow/library/icons";

  import { Tooltip } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  export let isSave;
  export let isTestflowEditable;
  export let onSaveTestflow;
  export let testFlowRunning = false;

  /**
   * @description - handles different key press
   * @param event - keyboard events
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    const isSaveDisabled =
      isSave || !isTestflowEditable ? true : false || testFlowRunning;
    if (
      !isSaveDisabled &&
      (event.metaKey || event.ctrlKey) &&
      event.code === "KeyS"
    ) {
      event.preventDefault();
      onSaveTestflow();
    } else if ((event.metaKey || event.ctrlKey) && event.code === "KeyS") {
      event.preventDefault();
    }
  };
</script>

<div class="pe-1">
  <Tooltip title={"Save"} placement={"bottom-center"} distance={12} zIndex={10}>
    <Button
      type="secondary"
      startIcon={SaveRegular}
      disable={isSave || !isTestflowEditable ? true : false || testFlowRunning}
      size="medium"
      onClick={onSaveTestflow}
      iconSize={20}
    />
  </Tooltip>
</div>

<svelte:window on:keydown={handleKeyPress} />
