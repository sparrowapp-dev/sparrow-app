<script lang="ts">
  /**
   * Components
   */
  import { Button } from "@sparrow/library/ui";

  /**
   * Types
   */
  import type { WorkspaceForm } from "../../types";

  /**
   * Exports
   */
  export let workspaceForm: WorkspaceForm;
  export let onCreateWorkspace;
  export let handleModalState;
  export let selectedTeam = "";
  export let handleTeamError;
  /**
   * Data
   */
  let workspaceUnderSubmission: boolean = false;
</script>

<div class="sparrow-modal-footer d-flex justify-content-end mt-4">
  <!-- 
      -- Cancel Button 
    -->
  <Button
    disable={workspaceUnderSubmission}
    title={`Cancel`}
    type="dark"
    buttonClassProp={`me-2`}
    onClick={() => {
      handleModalState(false);
    }}
  />

  <!-- 
      -- Submit Button 
    -->
  <Button
    title={"Create"}
    type="primary"
    disable={workspaceUnderSubmission}
    loader={workspaceUnderSubmission}
    buttonClassProp={`me-1`}
    onClick={async () => {
      workspaceForm.name.isTouched = true;
      if (!workspaceForm.name.value.trim()) return;
      if (selectedTeam === "") {
        handleTeamError();
        return;
      }
      workspaceUnderSubmission = true;
      const response = await onCreateWorkspace(
        workspaceForm.name.value.trim(),
        selectedTeam,
      );
      workspaceUnderSubmission = false;
      if (response.isSuccessful) {
        handleModalState(false);
      }
    }}
  />
</div>
