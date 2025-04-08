<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";

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
</script>

<div
  class="About d-flex flex-column h-100"
  style="padding-top:0; gap:16px !important; "
>
  <div class="h-100">
    <textarea
      disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
      id="updateWorkspaceDescField"
      class=" border-0 text-ds-font-size-12 input-outline shadow-none w-100 p-2"
      value={workspaceDescription || ""}
      placeholder="Describe this workspace's objectives or add links to generate API documentation. Start typing."
      on:blur={(event) => {
        if (workspaceDescription !== event.target.value) {
          onUpdateWorkspaceDescription(workspaceID, event.target.value);
        }
      }}
    />
  </div>
</div>

<style>
  textarea {
    outline: none;
    height: 300px;
    border: 1px solid transparent !important;
    border-radius: 4px !important;
    background-color: var(--bg-ds-surface-600);
  }
  textarea:focus,
  textarea:hover {
    border: 1px solid var(--border-primary-300) !important;
  }
</style>
