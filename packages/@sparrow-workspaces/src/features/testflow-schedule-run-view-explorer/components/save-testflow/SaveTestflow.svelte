<script lang="ts">
  import { SaveRegular } from "@sparrow/library/icons";

  import { Tooltip } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  export let isSave;
  export let isTestflowEditable;
  export let onSaveTestflow;
  export let testFlowRunning = false;

  $: isSaveDisabled = isSave || !isTestflowEditable || testFlowRunning;

  /**
   * @description - handles different key press
   * @param event - keyboard events
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    if (
      !isSaveDisabled &&
      (event.metaKey || event.ctrlKey) &&
      event.code === "KeyS"
    ) {
      event.preventDefault();
      handleSaveClick();
    } else if ((event.metaKey || event.ctrlKey) && event.code === "KeyS") {
      event.preventDefault();
    }
  };

  const handleSaveClick = () => {
    if (!isSaveDisabled) {
      onSaveTestflow();
    }
  };
</script>

<div class="pe-1">
  <Tooltip title={"Save"} placement={"bottom-center"} distance={12} zIndex={10}>
    <Button
      type="secondary"
      startIcon={SaveRegular}
      disable={isSaveDisabled}
      size="medium"
      onClick={handleSaveClick}
      iconSize={20}
    />
  </Tooltip>
</div>

<svelte:window on:keydown={handleKeyPress} />
