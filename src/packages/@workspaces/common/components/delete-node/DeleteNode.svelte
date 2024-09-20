<script>
  import { Button } from "@library/ui";
  import { notifications } from "@library/ui/toast/Toast";
  import { onMount } from "svelte";

  // Props passed to the component
  export let handleModalState; // Function to handle the modal state
  export let deletedNodeId;
  export let handleDeleteNode;
export let deleteNodeName;
  let isDeletingNode = false;
  let selectedNodeName = "";

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
    <p class="lightGray" style="color: lightGray;">
      Are you sure you want to delete this block? Deleting
      <span style="font-weight: 700;">
        "{deleteNodeName || ""}"
      </span>? will also remove its two connected blocks.
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
        type={"dark"}
        onClick={() => {
          handleModalState(false); // Close the modal
        }}
      />
    </span>
    <!-- Leave button to confirm leaving the team -->
    <Button
      disable={false}
      title={"Delete"}
      textClassProp={"fs-6"}
      type={"danger"}
      onClick={() => {
        handleDeletNode(); // Execute the leave team function
      }}
      loader={isDeletingNode}
    />
  </div>
</section>
