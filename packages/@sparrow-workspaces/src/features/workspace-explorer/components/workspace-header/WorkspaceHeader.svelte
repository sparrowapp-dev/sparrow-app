<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Input } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";
  import { PeopleRegular, SaveRegular } from "@sparrow/library/icons";
  /**
   * The name of the workspace.
   */
  export let workspaceName: string = "";

  /**
   * The ID of the workspace.
   */
  export let workspaceID: string = "";

  /**
   * Boolean flag to indicate if the workspace invite modal is open.
   */
  export let isWorkspaceInviteModalOpen: boolean;

  /**
   * Function to handle deletion of the workspace.
   */
  export let onDeleteWorkspace;

  /**
   * Function to update the workspace name.
   * @param workspaceID - The ID of the workspace.
   * @param workspaceName - The updated name of the workspace.
   */
  export let onUpdateWorkspaceName: (
    workspaceID: string,
    workspaceName: string,
  ) => void;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  const onRenameInputKeyPress = () => {
    const inputField = document.getElementById(
      "renameInputFieldWorkspace",
    ) as HTMLInputElement;
    inputField.blur();
  };

  const resetInputField = () => {
    const inputField = document.getElementById(
      "renameInputFieldWorkspace",
    ) as HTMLInputElement;
    inputField.value = workspaceName;
  };
  const handleInputName = (event) => {
    if (event.key === "Enter") {
      onRenameInputKeyPress();
    }
  };
  const handleBlurName = () => {
    const newValue = event.target.value;
    const previousValue = workspaceName;
    if (event.target.value?.trim() === "") {
      resetInputField();
    } else if (newValue !== previousValue) {
      onUpdateWorkspaceName(workspaceID, newValue);
    }
  };
</script>

<section>
  <div
    class="About d-flex flex-column h-100"
    style="padding-bottom:24px; gap:16px !important; "
  >
    <div class="d-flex" style="justify-content: space-between;">
      <div
        class="ellipsis w-auto"
        style="font-weight: 700; color:var(--text-secondary-100);"
      >
        <Input
          width={"398px"}
          placeholder={""}
          type={"text"}
          value={workspaceName}
          variant={"inline"}
          id="renameInputFieldWorkspace"
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
          maxlength={100}
          on:input={handleInputName}
          on:blur={handleBlurName}
        />
      </div>
      {#if userRole === WorkspaceRole.WORKSPACE_ADMIN}
        <div class="d-flex gap-2 ms-3">
          <Button
            startIcon={PeopleRegular}
            size={"medium"}
            type={"primary"}
            title={"Invite"}
            onClick={() => {
              isWorkspaceInviteModalOpen = true;
            }}
            disable={userRole !== WorkspaceRole.WORKSPACE_ADMIN}
          />
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  input {
    outline: none;
    border: 1px solid transparent !important;
  }
  input:focus,
  input:hover {
    border: 1px solid var(--border-primary-300) !important;
  }
</style>
