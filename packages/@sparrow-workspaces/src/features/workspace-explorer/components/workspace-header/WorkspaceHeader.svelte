<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Input } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";

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
</script>

<section>
  <div
    class="About d-flex flex-column h-100"
    style="padding-bottom:24px; gap:16px !important; "
  >
    <div class="d-flex" style="justify-content: space-between;">
      <div
        class="ellipsis w-100"
        style="font-weight: 700; color:var(--text-secondary-100);"
      >
        <input
          on:blur={(event) => {
            const newValue = event.target.value;
            const previousValue = workspaceName;
            if (event.target.value?.trim() === "") {
              resetInputField();
            } else if (newValue !== previousValue) {
              onUpdateWorkspaceName(workspaceID, newValue);
            }
          }}
          on:keydown={(event) => {
            if (event.key === "Enter") {
              onRenameInputKeyPress();
            }
          }}
          type="text"
          required
          id="renameInputFieldWorkspace"
          value={workspaceName}
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
          class="bg-transparent input-outline border-0 text-fs-18 text-left w-100 ps-2 py-0"
          maxlength={100}
        />
      </div>
      {#if userRole === WorkspaceRole.WORKSPACE_ADMIN}
        <div class="d-flex gap-2 ms-3">
          <Button
            type={"dark"}
            title={"Delete Workspace"}
            textClassProp={"fs-12 "}
            textStyleProp={"font-weight:400; font-size:12px;"}
            onClick={() => {
              onDeleteWorkspace();
            }}
            disable={userRole !== WorkspaceRole.WORKSPACE_ADMIN}
          />
          <Button
            type={"primary"}
            title={"Invite"}
            textClassProp={"fs-12"}
            textStyleProp={"font-weight:400; font-size:12px;"}
            onClick={() => {
              isWorkspaceInviteModalOpen = true;
            }}
            disable={userRole !== WorkspaceRole.WORKSPACE_ADMIN}
          ></Button>
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
