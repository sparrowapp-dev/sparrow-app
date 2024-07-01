<script lang="ts">
  import { Button } from "@library/ui";
  import type { TeamForm } from "../../types";
  export let teamForm: TeamForm;
  export let onCreateTeam;
  export let handleModalState;

  let teamUnderSubmission: boolean = false;
</script>

<div class="sparrow-modal-footer d-flex justify-content-end mt-4">
  <Button
    disable={teamUnderSubmission}
    title={`Cancel`}
    type="dark"
    buttonClassProp={`me-2`}
    onClick={() => {
      handleModalState(false);
    }}
  />
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
