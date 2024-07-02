<script lang="ts">
  import { TeamRole, WorkspaceRole } from "$lib/utils/enums/team.enum";
  import type { workspaceDocumentWithPosition } from "$lib/utils/interfaces";
  import { Select } from "@library/forms";
  export let workspace: workspaceDocumentWithPosition;
  export let user;
  export let userType;
  export let handleMemberPopUpSuccess;
  export let workspaceCount;

  /**
   * function to remove member from workspace
   */
  export let onRemoveUserFromWorkspace;
  /**
   * function to change user role at workspace
   */
  export let onChangeUserRoleAtWorkspace;

  const handleDropdown = async (id) => {
    if (id === "remove") {
      // perform remove operations
      if (workspaceCount === 1) {
        handleMemberPopUpSuccess();
      } else {
        await onRemoveUserFromWorkspace(
          workspace._id,
          workspace.name,
          user.id,
          user.name,
        );
      }
    } else if (
      workspace.position === WorkspaceRole.WORKSPACE_EDITOR &&
      id === WorkspaceRole.WORKSPACE_VIEWER
    ) {
      // demote editor to viewer
      await onChangeUserRoleAtWorkspace(
        workspace._id,
        workspace.name,
        user.id,
        user.name,
        WorkspaceRole.WORKSPACE_VIEWER,
      );
    } else if (
      workspace.position === WorkspaceRole.WORKSPACE_VIEWER &&
      id === WorkspaceRole.WORKSPACE_EDITOR
    ) {
      // promote viewer to editor
      await onChangeUserRoleAtWorkspace(
        workspace._id,
        workspace.name,
        user.id,
        user.name,
        WorkspaceRole.WORKSPACE_EDITOR,
      );
    }
  };
</script>

<section>
  <div class="d-flex justify-content-between align-items-center">
    <span style="font-size:12px;" class="text-whiteColor">{workspace.name}</span
    >
    <div class="dropdown-workspace-access">
      {#if (userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_MEMBER) || (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_MEMBER)}
        <Select
          id={workspace._id}
          titleId={workspace.position ? workspace.position : ""}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
            },
            {
              name: "Remove",
              id: "remove",
            },
          ]}
          onclick={handleDropdown}
          menuItem={"v2"}
          headerTheme={"transparent"}
          borderType={"none"}
          disabled={false}
          headerFontSize={"10px"}
          position={"absolute"}
        />
      {:else}
        <Select
          id={workspace._id + "member-workspace"}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
            },
            {
              name: "Admin",
              id: TeamRole.TEAM_ADMIN,
            },
            {
              name: "Owner",
              id: TeamRole.TEAM_OWNER,
            },
            {
              name: "Remove",
              id: "remove",
            },
          ]}
          titleId={workspace.position ? workspace.position : ""}
          onclick={handleDropdown}
          menuItem={"v2"}
          headerTheme={"transparent"}
          borderType={"none"}
          disabled={true}
          headerFontSize={"10px"}
          position={"absolute"}
        />
      {/if}
    </div>
  </div>
</section>

<style>
  .dropdown-workspace-access {
    width: 100px;
  }
</style>
