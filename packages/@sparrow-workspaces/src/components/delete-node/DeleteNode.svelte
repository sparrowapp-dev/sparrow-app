<script>
  import { Button } from "@sparrow/library/ui";

  export let handleModalState;
  export let deletedNodeId;
  export let handleDeleteNode;
  export let deleteNodeName;
  export let deleteCount;

  let isDeletingNode = false;

  const handleDeletNode = () => {
    isDeletingNode = true;
    handleDeleteNode(deletedNodeId);
    isDeletingNode = false;
  };
</script>

<!-- Section for the modal content -->
<section>
  <div>
    <!-- Prompt message for the user to confirm leaving the team -->
    <p
      class="text-fs-14 text-ds-font-weight-medium"
      style="color: var(--text-secondary-1000);"
    >
      Deleting this block will break connected downstream blocks that rely on
      its dynamic expressions. Are you sure you want to proceed?
    </p>
  </div>

  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end">
    <span style="margin-right: 15px;">
      <!-- Cancel button to close the modal without leaving the team -->
      <Button
        disable={isDeletingNode}
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
      title={"Delete"}
      textClassProp={"fs-6"}
      type={"danger"}
      onClick={() => {
        handleDeletNode();
      }}
      loader={isDeletingNode}
    />
  </div>
</section>
