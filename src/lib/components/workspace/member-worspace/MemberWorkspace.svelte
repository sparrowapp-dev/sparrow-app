<script lang="ts">
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import { TeamRole, WorkspaceRole } from "$lib/utils/enums/team.enum";
  import type { TeamServiceMethods } from "$lib/utils/interfaces";
  import { notifications } from "$lib/utils/notifications";
  export let workspace;
  export let user;
  export let userType;
  export let teamServiceMethods: TeamServiceMethods;
  export let userId: string;
  export let handleMemberPopUpSuccess;
  export let workspaceCount;
  console.log(workspaceCount);

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
      workspace.position === WorkspaceRole.EDITOR &&
      id === WorkspaceRole.VIEWER
    ) {
      // demote editor to viewer
      const response = await teamServiceMethods.changeUserRoleAtWorkspace(
        workspace._id,
        user.id,
        {
          role: WorkspaceRole.VIEWER,
        },
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
      workspace.position === WorkspaceRole.VIEWER &&
      id === WorkspaceRole.EDITOR
    ) {
      // promote viewer to editor
      const response = await teamServiceMethods.changeUserRoleAtWorkspace(
        workspace._id,
        user.id,
        {
          role: WorkspaceRole.EDITOR,
        },
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
      {#if (userType === TeamRole.OWNER && user.role === TeamRole.MEMBER) || (userType === TeamRole.ADMIN && user.role === TeamRole.MEMBER)}
        <MemberDropdown
          id={workspace._id + "member-workspace"}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.EDITOR,
              color: "whiteColor",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.VIEWER,
              color: "whiteColor",
            },
            {
              name: "Remove",
              id: "remove",
              color: "dangerColor",
            },
          ]}
          method={workspace.position ? workspace.position : ""}
          onclick={handleDropdown}
        />
      {:else}
        <MemberDropdown
          id={workspace._id + "member-workspace"}
          disabled={true}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.EDITOR,
              color: "whiteColor",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.VIEWER,
              color: "whiteColor",
            },
            {
              name: "Admin",
              id: TeamRole.ADMIN,
              color: "whiteColor",
            },
            {
              name: "Owner",
              id: TeamRole.OWNER,
              color: "whiteColor",
            },
          ]}
          method={user.role === TeamRole.OWNER
            ? TeamRole.OWNER
            : workspace.position
            ? workspace.position
            : ""}
          onclick={handleDropdown}
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
