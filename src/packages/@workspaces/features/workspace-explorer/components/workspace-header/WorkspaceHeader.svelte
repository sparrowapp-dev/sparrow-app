<script lang="ts">
  import { WorkspaceRole } from "$lib/utils/enums";
  import { Input } from "@library/forms";
  import { Button } from "@library/ui";
  import { notifications } from "@library/ui/toast/Toast";

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

  /**
   * Handles the update of workspace name.
   * Calls onUpdateWorkspaceName with current workspaceID and workspaceName.
   * Shows an error notification if workspaceName is empty.
   */
  const handleWorkspaceName = async () => {
    if (workspaceName != "") {
      await onUpdateWorkspaceName(workspaceID, workspaceName);
    } else {
      notifications.error("Please Enter A Workspace Name");
    }
  };
</script>

<section>
  <div
    class="About d-flex flex-column h-100"
    style="padding:24px; gap:16px !important; "
  >
    <div class="d-flex" style="justify-content: space-between;">
      <div
        class="ellipsis"
        style="font-weight: 700; font-size:18px; color:var(--text-secondary-100);"
      >
        <Input
          bind:value={workspaceName}
          on:blur={handleWorkspaceName}
          id={"workspace-name"}
          width={"300px"}
          type="text"
          defaultBorderColor="Transparent"
          hoveredBorderColor={"var(--border-primary-300)"}
          focusedBorderColor={"var(--border-primary-300)"}
          class="text-fs-18 bg-transparent  "
          style="outline:none; font-weight:700;"
          placeholder="My Workspace"
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
        />
      </div>
      <div class="d-flex gap-2">
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
    </div>
  </div>
</section>
