<script lang="ts">
  /**
   * Components
   */
  import { Button } from "@sparrow/library/ui";

  /**
   * Types
   */
  import type { ProfileForm } from "../../../../types";

  /**
   * Exports
   */
  export let profileForm: ProfileForm;
  export let onCreateProfile;
  export let handleModalState;

  /**
   * Data
   */
  let teamUnderSubmission: boolean = false;
</script>

<div class="sparrow-modal-footer d-flex justify-content-end mt-3">
  <!-- 
    -- Cancel Button 
  -->
  <Button
    disable={teamUnderSubmission}
    title={`Cancel`}
    type="secondary"
    buttonClassProp={`me-2`}
    onClick={() => {
      handleModalState(false);
    }}
  />

  <!-- 
    -- Submit Button 
  -->
  <Button
    title={"Add Profile"}
    type="primary"
    disable={teamUnderSubmission}
    loader={teamUnderSubmission}
    buttonClassProp={`me-1`}
    onClick={async () => {
      profileForm.name.isTouched = true;
      if (!profileForm.name.value || profileForm.name.invalid) return;
      teamUnderSubmission = true;
      const response = await onCreateProfile(
        profileForm.name.value,
        profileForm.description.value,
        profileForm.auth,
      );
      teamUnderSubmission = false;
      if (response.isSuccessful) {
        handleModalState(false);
      }
    }}
  />
</div>
