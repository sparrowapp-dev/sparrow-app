<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import type { WorkspaceDocument } from "@app/database/database";
  import { TeamRole, WorkspaceRole } from "$lib/utils/enums/team.enum";
  import type {
    TeamServiceMethods,
    workspaceDocumentWithPosition,
  } from "$lib/utils/interfaces";
  import { notifications } from "@library/ui/toast/Toast";
  export let workspace: workspaceDocumentWithPosition;
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
        <Dropdown
          dropdownId={workspace._id}
          dropDownType={{
            type: "text",
            title: workspace.position ? workspace.position : "",
          }}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
              dynamicClasses: "text-whiteColor",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
              dynamicClasses: "text-whiteColor",
            },
            {
              name: "Remove",
              id: "remove",
              dynamicClasses: "text-dangerColor",
            },
          ]}
          onclick={isWorkspaceMemberInfo
            ? handleDropDownWorkspaceLevel
            : handleDropdown}
          additionalType={"memberinfo"}
        />
      {:else}
        <Dropdown
          dropdownId={workspace._id + "member-workspace"}
          dropDownType={{
            type: "text",
            title: workspace.position ? workspace.position : "",
          }}
          disabled={true}
          method={workspace.position ? workspace.position : ""}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
              dynamicClasses: "text-whiteColor",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
              dynamicClasses: "text-whiteColor",
            },
            {
              name: "Admin",
              id: TeamRole.TEAM_ADMIN,
              dynamicClasses: "text-whiteColor",
            },
            {
              name: "Owner",
              id: TeamRole.TEAM_OWNER,
              dynamicClasses: "text-whiteColor",
            },
            {
              name: "Remove",
              id: "remove",
              dynamicClasses: "text-dangerColor",
            },
          ]}
          onclick={isWorkspaceMemberInfo
            ? handleDropDownWorkspaceLevel
            : handleDropdown}
          additionalType={"memberinfo"}
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
