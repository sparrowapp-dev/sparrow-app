<script lang="ts">
  import { WorkspaceRole } from "$lib/utils/enums";

  /**
   * The description of the workspace.
   */
  export let workspaceDescription: string = "";

  /**
   * The ID of the workspace.
   */
  export let workspaceID: string = "";

  /**
   * Function to update the workspace description.
   * @param workspaceId - The ID of the workspace.
   * @param workspaceDescription - The updated description of the workspace.
   */
  export let onUpdateWorkspaceDescription: (
    workspaceId: string,
    workspaceDescription: string,
  ) => void;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  const onRenameTextareaKeyPress = () => {
    const inputField = document.getElementById(
      "updateWorkspaceDescField",
    ) as HTMLInputElement;
    inputField.blur();
  };
</script>

<div
  class="About d-flex flex-column h-100"
  style="padding:24px; padding-top:0; gap:16px !important; "
>
  <div>
    <textarea
      disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
      id="updateWorkspaceDescField"
      style="font-size: 14px; "
      class="form-control bg-transparent border-0 text-textColor fs-6 h-50 input-outline shadow-none"
      value={workspaceDescription || ""}
      placeholder="This is your personal workspace. Describe the objectives of the workspace and how it is meant to be used. Or create a comprehensive API documentation by including links to your collections and requests. Start typing."
      on:blur={(event) => {
        if (workspaceDescription !== event.target.value) {
          onUpdateWorkspaceDescription(workspaceID, event.target.value);
        }
      }}
      on:keydown={(event) => {
        if (event.key === "Enter") {
          onRenameTextareaKeyPress();
        }
      }}
    />
  </div>
</div>

<style>
  .text-area::placeholder {
    font-size: 12px;
    color: var(--bg-secondary-950);
  }
  .text-area {
    outline: none;
  }
</style>
