<script>
  import { SaveRegular } from "@sparrow/library/icons";

  import { Tooltip } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  export let isSave;
  export let isTestflowEditable;
  export let onSaveTestflow;
  export let testFlowRunning = false;
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
