<script>
  import { Button } from "@sparrow/library/ui";

  export let handleModalState;
  export let requestName;
  export let blockName;
  export let onSaveRequest;
</script>

<!-- Section for the modal content -->
<section>
  <div
    class="text-fs-14 text-lightGray"
    style="color: var(--text-secondary-1000); margin: 24px 0px"
  >
    {`The request “${requestName}” in ${blockName} has unsaved changes. Changing the
      API will discard your edits. Do you wish to continue?`}
  </div>

  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end">
    <span style="margin-right: 15px;">
      <!-- Cancel button to close the modal without leaving the team -->
      <Button
        disable={false}
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"secondary"}
        onClick={() => {
          handleModalState(false); // Close the modal
        }}
      />
    </span>
    <Button
      disable={false}
      title={"Continue"}
      textClassProp={"fs-6"}
      type={"primary"}
      onClick={() => {
        onSaveRequest();
      }}
      loader={false}
    />
  </div>
</section>
