<script lang="ts">
  /**
   * Components
   */
  import { Button } from "@sparrow/library/ui";

  /**
   * Types
   */
  import type { TeamForm } from "../../types";

  /**
   * Exports
   */
  export let teamForm: TeamForm;
  export let onCreateTeam;
  export let handleModalState;

  /**
   * Data
   */
  let teamUnderSubmission: boolean = false;
</script>

<div class="sparrow-modal-footer d-flex justify-content-end mt-4">
  <!-- 
    -- Cancel Button 
  -->
  <Button
    disable={teamUnderSubmission}
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
    title={"Create Team"}
    type="primary"
    disable={teamUnderSubmission}
    loader={teamUnderSubmission}
    buttonClassProp={`me-1`}
    onClick={async () => {
      teamForm.name.isTouched = true;
      if (!teamForm.name.value) return;
      teamUnderSubmission = true;
      const response = await onCreateTeam(
        teamForm.name.value,
        teamForm.description.value,
        teamForm.file.value,
      );
      teamUnderSubmission = false;
      if (response.isSuccessful) {
        handleModalState(false);
      }
    }}
  />
</div>
