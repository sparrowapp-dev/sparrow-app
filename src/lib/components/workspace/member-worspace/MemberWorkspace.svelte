<script lang="ts">
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import { TeamRole, WorkspaceRole } from "$lib/utils/enums/team.enum";
  import type { TeamServiceMethods } from "$lib/utils/interfaces";
  import { notifications } from "$lib/utils/notifications";
  export let workspace;
  export let user;
  export let isWorkspaceMemberInfo = false;
  export let teamRole: TeamRole = null;
  export let userType;
  export let teamServiceMethods: TeamServiceMethods;
  export let userId: string;
  export let handleMemberPopUpSuccess;
  export let workspaceCount;
  export let handleDropDownWorkspaceLevel = (
    currentRole: WorkspaceRole | "remove",
  ) => {};

  const handleDropdown = async (id) => {
    if (id === "remove") {
      // perform remove operations
      if (workspaceCount === 1) {
        handleMemberPopUpSuccess();
      } else {
        const response = await teamServiceMethods.removeUserFromWorkspace(
          workspace._id,
          user.id,
        );
        if (response) {
          await teamServiceMethods.refreshWorkspace(userId);
          notifications.success(
            `${user.name} is removed from ${workspace.name}`,
          );
        } else {
          notifications.error(
            `Failed to remove ${user.name} from ${workspace.name}`,
          );
        }
      }
    } else if (
      workspace.position === WorkspaceRole.WORKSPACE_EDITOR &&
      id === WorkspaceRole.WORKSPACE_VIEWER
    ) {
      // demote editor to viewer
      const response = await teamServiceMethods.changeUserRoleAtWorkspace(
        workspace._id,
        user.id,
        WorkspaceRole.WORKSPACE_VIEWER,
      );
      if (response) {
        await teamServiceMethods.refreshWorkspace(userId);
        notifications.success(
          `${user.name} is now a viewer on ${workspace.name}`,
        );
      } else {
        notifications.error(
          `Failed to change role for ${user.name}. Please try again.`,
        );
      }
    } else if (
      workspace.position === WorkspaceRole.WORKSPACE_VIEWER &&
      id === WorkspaceRole.WORKSPACE_EDITOR
    ) {
      // promote viewer to editor
      const response = await teamServiceMethods.changeUserRoleAtWorkspace(
        workspace._id,
        user.id,
        WorkspaceRole.WORKSPACE_EDITOR,
      );
      if (response) {
        await teamServiceMethods.refreshWorkspace(userId);
        notifications.success(
          `${user.name} is now a editor on ${workspace.name}`,
        );
      } else {
        notifications.error(
          `Failed to change role for ${user.name}. Please try again.`,
        );
      }
    }
  };
</script>

<section>
  <div class="d-flex justify-content-between align-items-center">
    <span style="font-size:12px;" class="text-whiteColor">{workspace.name}</span
    >
    <div class="dropdown-workspace-access">
      {#if (userType === TeamRole.TEAM_OWNER && (isWorkspaceMemberInfo ? teamRole === TeamRole.TEAM_MEMBER : user.role === TeamRole.TEAM_MEMBER)) || (userType === TeamRole.TEAM_ADMIN && (isWorkspaceMemberInfo ? teamRole === TeamRole.TEAM_MEMBER : user.role === TeamRole.TEAM_MEMBER))}
        <MemberDropdown
          workspaceId={workspace._id}
          id={workspace._id + "member-workspace"}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
              color: "whiteColor",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
              color: "whiteColor",
            },
            {
              name: "Remove",
              id: "remove",
              color: "dangerColor",
            },
          ]}
          method={workspace.position ? workspace.position : ""}
          onclick={isWorkspaceMemberInfo
            ? handleDropDownWorkspaceLevel
            : handleDropdown}
        />
      {:else}
        <MemberDropdown
          id={workspace._id + "member-workspace"}
          disabled={true}
          workspaceId={workspace._id}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
              color: "whiteColor",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
              color: "whiteColor",
            },
            {
              name: "Admin",
              id: TeamRole.TEAM_ADMIN,
              color: "whiteColor",
            },
            {
              name: "Owner",
              id: TeamRole.TEAM_OWNER,
              color: "whiteColor",
            },
          ]}
          method={user.role || teamRole === TeamRole.TEAM_OWNER
            ? TeamRole.TEAM_ADMIN
            : workspace.position
            ? workspace.position
            : ""}
          onclick={isWorkspaceMemberInfo
            ? handleDropDownWorkspaceLevel
            : handleDropdown}
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
